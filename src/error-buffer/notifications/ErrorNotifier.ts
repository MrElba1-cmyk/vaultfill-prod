/**
 * Notification dispatcher for the Error Buffer.
 * Supports console, webhook, and Telegram channels.
 */

import { BufferedError, NotificationChannel } from '../core/types';

export class ErrorNotifier {
  private channels: NotificationChannel[];

  constructor(channels: NotificationChannel[]) {
    this.channels = channels.filter(c => c.enabled);
  }

  async notify(entry: BufferedError): Promise<void> {
    const message = this.formatMessage(entry);

    await Promise.allSettled(
      this.channels.map(ch => this.dispatch(ch, message, entry))
    );
  }

  private async dispatch(channel: NotificationChannel, message: string, entry: BufferedError): Promise<void> {
    switch (channel.type) {
      case 'console':
        console.warn(`🚨 [HITL Alert] ${message}`);
        break;

      case 'telegram':
        await this.sendTelegram(channel.config, message);
        break;

      case 'webhook':
        await this.sendWebhook(channel.config, entry);
        break;
    }
  }

  private async sendTelegram(config: Record<string, string>, message: string): Promise<void> {
    const { botToken, chatId } = config;
    if (!botToken || !chatId) {
      console.warn('[ErrorNotifier] Telegram not configured (missing botToken/chatId)');
      return;
    }

    try {
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      if (!resp.ok) console.error(`[ErrorNotifier] Telegram failed: ${resp.status}`);
    } catch (err) {
      console.error('[ErrorNotifier] Telegram send error:', err);
    }
  }

  private async sendWebhook(config: Record<string, string>, entry: BufferedError): Promise<void> {
    const { url } = config;
    if (!url) return;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error('[ErrorNotifier] Webhook send error:', err);
    }
  }

  private formatMessage(entry: BufferedError): string {
    return [
      `<b>🚨 VaultFill Error [${entry.severity.toUpperCase()}]</b>`,
      `<b>Source:</b> ${entry.context.source}`,
      `<b>Error:</b> ${entry.error.message}`,
      entry.context.userId ? `<b>User:</b> ${entry.context.userId}` : '',
      `<b>ID:</b> <code>${entry.id}</code>`,
      `<b>Time:</b> ${entry.timestamp}`,
    ].filter(Boolean).join('\n');
  }
}
