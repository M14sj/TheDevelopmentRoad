function escapeHtml(text) {
  if (!text) return text;
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    const name = formData.get('contactName');
    const email = formData.get('email');
    const offer = formData.get('offer');
    const message = formData.get('message') || 'Unknown!';

    const BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = context.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }

    const telegramText = `🔔 <b>New Offer Received</b>\n\n` +
                         `🌐 : TheDevelopmentRoad.com\n` +
                         `👤 : ${escapeHtml(name)}\n` +
                         `📧 : <code>${escapeHtml(email)}</code>\n` +
                         `💰 : <b>${escapeHtml(offer)}</b>\n` +
                         `\n<pre>${escapeHtml(message)}</pre>`;

    const tgPromise = fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramText,
        parse_mode: 'HTML'
      })
    });

    context.waitUntil(tgPromise);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
