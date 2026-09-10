// TEMPORARY helper: lists the chats your bot can currently see, with their IDs.
// Use it to find the correct TELEGRAM_CHAT_ID. Does NOT expose the bot token.
// Remove after configuring. Requires TELEGRAM_BOT_TOKEN to be set.

export default async function handler(req, res) {
  const { TELEGRAM_BOT_TOKEN } = process.env;
  if (!TELEGRAM_BOT_TOKEN) return res.status(500).json({ error: 'Missing TELEGRAM_BOT_TOKEN' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    const data = await r.json();
    if (!data.ok) return res.status(502).json({ ok: false, telegram: data });

    // Collect distinct chats seen across recent updates.
    const seen = new Map();
    for (const u of data.result || []) {
      const chat = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
      if (chat && !seen.has(chat.id)) {
        seen.set(chat.id, { id: chat.id, type: chat.type, title: chat.title || chat.username || null });
      }
    }

    const chats = [...seen.values()];
    return res.status(200).json({
      ok: true,
      chats,
      hint: chats.length
        ? 'Copy the id of your group into the TELEGRAM_CHAT_ID env var (include the leading -100 if shown).'
        : 'No chats seen yet. Add the bot to the group and send any message there, then reload this page.',
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e) });
  }
}
