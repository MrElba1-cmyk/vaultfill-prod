/**
 * Stealth Proxy — VaultFill Autonomous Systems
 *
 * Abstracts sender identity for all outbound Telegram/Email alerts.
 * All communications are sent as "VaultFill Autonomous Systems" —
 * no personal identifiers leak through the proxy.
 */

const SENDER_IDENTITY = 'VaultFill Autonomous Systems';
const SENDER_EMAIL = process.env.STEALTH_PROXY_EMAIL || 'noreply@vaultfill.io';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

export type AlertPayload = {
  channel: 'telegram' | 'email' | 'both';
  subject: string;
  body: string;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, string>;
  /** Override recipient email (otherwise uses STEALTH_PROXY_RECIPIENT) */
  recipientEmail?: string;
};

export type ProxyResult = {
  ok: boolean;
  channel: string;
  error?: string;
};

// ---------- Telegram ----------

async function sendTelegram(subject: string, body: string, priority: string): Promise<ProxyResult> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, channel: 'telegram', error: 'Telegram not configured' };
  }

  const icon = priority === 'high' ? '🔴' : priority === 'low' ? '⚪' : '🟡';
  const text = `${icon} *${SENDER_IDENTITY}*\n\n*${escapeMarkdown(subject)}*\n\n${escapeMarkdown(body)}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, channel: 'telegram', error: err };
    }
    return { ok: true, channel: 'telegram' };
  } catch (e) {
    return { ok: false, channel: 'telegram', error: (e as Error).message };
  }
}

function escapeMarkdown(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// ---------- Email (SendGrid) ----------

async function sendEmail(
  subject: string,
  body: string,
  recipient?: string
): Promise<ProxyResult> {
  const to = recipient || process.env.STEALTH_PROXY_RECIPIENT;
  if (!SENDGRID_API_KEY || !to) {
    return { ok: false, channel: 'email', error: 'Email not configured' };
  }

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDER_EMAIL, name: SENDER_IDENTITY },
        subject: `[VaultFill] ${subject}`,
        content: [
          {
            type: 'text/plain',
            value: `${SENDER_IDENTITY}\n${'─'.repeat(40)}\n\n${body}\n\n─\nThis is an automated message from VaultFill Autonomous Systems.\nDo not reply to this email.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, channel: 'email', error: err };
    }
    return { ok: true, channel: 'email' };
  } catch (e) {
    return { ok: false, channel: 'email', error: (e as Error).message };
  }
}

// ---------- Public API ----------

export async function sendStealthAlert(payload: AlertPayload): Promise<ProxyResult[]> {
  const { channel, subject, body, priority = 'normal', recipientEmail } = payload;
  const results: ProxyResult[] = [];

  if (channel === 'telegram' || channel === 'both') {
    results.push(await sendTelegram(subject, body, priority));
  }
  if (channel === 'email' || channel === 'both') {
    results.push(await sendEmail(subject, body, recipientEmail));
  }

  return results;
}
