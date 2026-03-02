
/**
 * AutomationService handles communication with external workflow engines (n8n).
 * It follows the "Fire and Forget" pattern for non-blocking UI performance,
 * while logging errors for reliability.
 */

export interface WebhookPayload {
  eventId: string;
  timestamp: string;
  action: string;
  payload: any;
}

export class AutomationService {
  private static webhookUrl = process.env.N8N_WEBHOOK_URL;

  static async dispatch(action: string, data: any): Promise<void> {
    if (!this.webhookUrl) {
      console.warn(`[AutomationService] No N8N_WEBHOOK_URL configured. Skipping action: ${action}`);
      return;
    }

    const payload: WebhookPayload = {
      eventId: `evt_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      payload: data
    };

    try {
      // We don't 'await' this in the main thread to keep the UI snappy,
      // but we handle the promise to log errors.
      fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          console.error(`[AutomationService] Webhook failed with status ${res.status} for action ${action}`);
        }
      }).catch(err => {
        console.error(`[AutomationService] Network error for action ${action}:`, err);
      });
    } catch (error) {
      console.error(`[AutomationService] Unexpected error dispatching ${action}:`, error);
    }
  }
}
