import Imap from 'node-imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { ImapAccount } from '../types/email.type';

//type for the callback function that will handle new emails
type NewMailCallback = (email: ParsedMail, accountId: string) => void;

class ImapService {
  private imap: Imap;
  private accountId: string;

  constructor(config: ImapAccount) {
    this.accountId = config.id;
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      // a keepalive signal every 10 seconds
      keepalive: {
        interval: 10000,
        idle: 30000,
        force: true, //keepalives even if the server doesn't support the IDLE keepalive extension
      },
    });
  }

  // The main method to start the real-time listener
  public startListening(onNewMail: NewMailCallback): void {
    this.imap.on('ready', () => {
      this.openInbox();
    });
    this.imap.on('mail', (numNewMsgs: number) => {
      console.log(`[${this.accountId}] New mail event! ${numNewMsgs} new message(s).`);
      // the count of new messages to fetch
      this.openInbox(numNewMsgs, onNewMail);
    });

    this.imap.on('error', (err: Error) => {
      console.error(`[${this.accountId}] IMAP Error:`, err);
    });

    this.imap.on('close', () => {
      console.log(`[${this.accountId}] Connection closed. Reconnecting in 10 seconds...`);
      setTimeout(() => this.imap.connect(), 10000); // Attempt to reconnect
    });

    this.imap.connect();
  }
  private openInbox(fetchCount = 0, onNewMail?: NewMailCallback): void {
    this.imap.openBox('INBOX', false, (err) => {
      if (err) {
        console.error(`[${this.accountId}] Error opening INBOX:`, err);
        return;
      }
      if (fetchCount > 0 && onNewMail) {
        this.fetchNewEmails(fetchCount, onNewMail);
      }
    });
  }
  private fetchNewEmails(count: number, onNewMail: NewMailCallback): void {
    // search for all message UIDs in the mailbox
    this.imap.search(['ALL'], (searchErr, uids) => {
      if (searchErr || uids.length === 0) {
        if (searchErr) console.error(`[${this.accountId}] Search Error:`, searchErr);
        return;
      }

      // get the uids of only the newest messages
      const uidsToFetch = uids.slice(-count);

      const fetch = this.imap.fetch(uidsToFetch, { bodies: '', markSeen: true });
      fetch.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream as any, async (parseErr, parsed) => {
            if (parseErr) return;
            // Pass the parsed email and accountId to the callback
            onNewMail(parsed, this.accountId);
          });
        });
      });

      fetch.once('error', (fetchErr) => {
        console.error(`[${this.accountId}] Fetch Error:`, fetchErr);
      });
    });
  }
  
  // we keep this method for the initial sync,it remains unchanged.
  public async fetchLast30Days(): Promise<ParsedMail[]> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', true, (err) => {
          if (err) return reject(err);
          const date = new Date();
          date.setDate(date.getDate() - 30);
          this.imap.search([['SINCE', date.toISOString().split('T')[0]]], (searchErr, uids) => {
            if (searchErr || uids.length === 0) return resolve([]);
            const emails: ParsedMail[] = [];
            const fetch = this.imap.fetch(uids, { bodies: '' });
            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream as any, async (pErr, parsed) => { if (parsed) emails.push(parsed); });
              });
            });
            fetch.once('end', () => {
              this.imap.end();
              resolve(emails);
            });
          });
        });
      });
      this.imap.once('error', reject);
      this.imap.connect();
    });
  }
}

export default ImapService;