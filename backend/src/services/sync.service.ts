import { ParsedMail } from 'mailparser';
import { ImapAccount, Email } from '../types/email.type';
import ElasticsearchService from './elasticsearch.service';
import ImapService from './imap.service';
import AIService from './ai.service';
import NotificationService from './notification.service';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class SyncService {
  private esService: ElasticsearchService;
  private aiService: AIService;
  private notificationService: NotificationService; 

  constructor() {
    this.esService = ElasticsearchService.getInstance();
    this.aiService = AIService.getInstance();
    this.notificationService = NotificationService.getInstance(); 
  }
  private transformEmail(rawEmail: ParsedMail, accountId: string): Email | null {
    if (!rawEmail.messageId || !rawEmail.from?.value[0] || !rawEmail.to) {
      return null;
    }
    const toRecipients = Array.isArray(rawEmail.to) ? rawEmail.to : [rawEmail.to];
    return {
      id: rawEmail.messageId,
      accountId: accountId,
      threadId: (rawEmail.headers.get('in-reply-to') as string) || rawEmail.messageId,
      subject: rawEmail.subject || '',
      from: {
        name: rawEmail.from.value[0].name || '',
        email: rawEmail.from.value[0].address || '',
      },
      to: toRecipients.flatMap(r => r.value.map(recipient => ({
        name: recipient.name || '',
        email: recipient.address || '',
      }))),
      date: rawEmail.date || new Date(),
      body: {
        plain: rawEmail.text || '',
        html: rawEmail.html || undefined,
      },
    };
  }

  public async runInitialSync(): Promise<void> {
    console.log('Starting initial sync for all accounts...');
    const accountsJson = process.env.IMAP_ACCOUNTS;
    if (!accountsJson) {
      console.error('IMAP_ACCOUNTS environment variable not set.');
      return;
    }
    const accounts: ImapAccount[] = JSON.parse(accountsJson);

    for (const account of accounts) {
      console.log(`\n--- Syncing account: ${account.user} ---`);

      //  outer try/catch handles account-level failures
      try {
        const existingIds = await this.esService.getExistingEmailIds(account.id);
        console.log(`Found ${existingIds.size} existing emails for this account.`);

        const imapService = new ImapService(account);
        const rawEmails = await imapService.fetchLast30Days();

        const newEmails = rawEmails.filter(email => !existingIds.has(email.messageId!));
        console.log(`Fetched ${rawEmails.length} total emails, ${newEmails.length} are new. Processing...`);

        if (newEmails.length === 0) continue;

        let indexedCount = 0;
        for (const rawEmail of newEmails) {
          // It ensures one bad email doesn't stop the whole process.
          try {
            const email = this.transformEmail(rawEmail, account.id);
            if (email) {
              console.log(`Processing email with subject: "${email.subject}"`);
              await delay(4000); // 4-second delay for countering rate limits

              const category = await this.aiService.classifyEmail(email.subject, email.body.plain);
              email.classification = category;

              await this.esService.indexEmail(email);
              console.log(` -> Classified as "${category}" and indexed successfully.`);
              indexedCount++;
              if (category === 'Interested') {
                console.log(`   -> Triggering notifications for interested email...`);
                await this.notificationService.sendSlackNotification(email);
                await this.notificationService.triggerWebhook(email);
              }
            }
          } catch (emailError) {
            console.error(`\n---! FAILED TO PROCESS ONE EMAIL !---`);
            console.error(`Subject: "${rawEmail.subject}"`);
            console.error(`Error:`, (emailError as Error).message);
            console.error(`---! SKIPPING TO NEXT EMAIL !---\n`);
          }
        }
        console.log(`\nSuccessfully processed and indexed ${indexedCount} new historical emails for ${account.user}.`);

      } catch (accountError) {
        console.error(`Failed to sync account ${account.user}:`, (accountError as Error).message);
      }
    }
    console.log('\n✅ Initial sync completed for all accounts.');
  }
  public startAllListeners(): void {
    console.log('\n🎧 Starting real-time listeners for all accounts...');
    const accountsJson = process.env.IMAP_ACCOUNTS;
    if (!accountsJson) {
      console.error('IMAP_ACCOUNTS environment variable not set.');
      return;
    }
    const accounts: ImapAccount[] = JSON.parse(accountsJson);

    for (const account of accounts) {
      const imapService = new ImapService(account);
      const onNewMailCallback = async (email: ParsedMail, accountId: string) => {
        console.log(`[${accountId}] Real-time: Received new email with subject "${email.subject}".`);
        const transformedEmail = this.transformEmail(email, accountId);
        if (transformedEmail) {
          // --- ADDED DELAY ---
          console.log('Waiting 4 seconds before AI call...');
          await delay(4000);

          console.log(`[${accountId}] Classifying email...`);
          const category = await this.aiService.classifyEmail(transformedEmail.subject, transformedEmail.body.plain);
          transformedEmail.classification = category;
          console.log(`[${accountId}] New email classified as "${category}". Indexing now...`);
          await this.esService.indexEmail(transformedEmail);
          console.log(`[${accountId}] New email indexed successfully.`);
          if (category === 'Interested') {
            console.log(`[${accountId}] Triggering notifications for interested email...`);
            await this.notificationService.sendSlackNotification(transformedEmail);
            await this.notificationService.triggerWebhook(transformedEmail);
          }
        }
      };
      imapService.startListening(onNewMailCallback);
    }
  }
}

export default SyncService;