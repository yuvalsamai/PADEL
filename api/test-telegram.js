// TEMPORARY test endpoint: open in a browser to confirm the Telegram wiring.
// Sends a test message to the configured group using the same env vars as the
// real order alert. Does NOT expose the bot token. Remove after verifying.

export default async function handler(req, res) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: 'Missing env vars',
      hasToken: Boolean(TELEGRAM_BOT_TOKEN),
      hasChatId: Boolean(TELEGRAM_CHAT_ID),
    });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: '✅ בדיקת חיבור CourtCheck — אם קיבלת את ההודעה הזו, ההתראות עובדות!',
      }),
    });
    const data = await tgRes.json();
    // Telegram's own ok/description tells us exactly what to fix (e.g. "chat not found").
    // chatIdUsed echoes the value the deployed function actually read from the env,
    // so we can tell whether a config change was picked up. (A chat id is not secret.)
    return res.status(tgRes.ok ? 200 : 502).json({
      delivered: data.ok === true,
      chatIdUsed: TELEGRAM_CHAT_ID,
      telegram: data,
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e) });
  }
}
