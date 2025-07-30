import axios from 'axios';
import { Email } from '../types/email.type';

class NotificationService {
  private static instance: NotificationService;
  private constructor() {}
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendSlackNotification(email: Email): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return; // silently fail if no URL is configured
    }
    const payload = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚀 *New "Interested" Lead!*\n*From:* ${email.from.name} <${email.from.email}>`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Subject:*\n${email.subject}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Received on account: ${email.accountId} at ${email.date.toLocaleString()}`,
            },
          ],
        },
      ],
    };

    try {
      await axios.post(webhookUrl, payload);
      console.log(`[NotificationService] Slack notification sent for email ID: ${email.id}`);
    } catch (error) {
      console.error('[NotificationService] Failed to send Slack notification:', (error as any).message);
    }
  }

  public async triggerWebhook(email: Email): Promise<void> {
    const webhookUrl = process.env.GENERIC_WEBHOOK_URL;
    if (!webhookUrl) {
      return; //silently fail if no URL is configured
    }

    try {
      //send the entire email object as the payload
      await axios.post(webhookUrl, email);
      console.log(`[NotificationService] Generic webhook triggered for email ID: ${email.id}`);
    } catch (error) {
      console.error('[NotificationService] Failed to trigger generic webhook:', (error as any).message);
    }
  }
}

export default NotificationService;