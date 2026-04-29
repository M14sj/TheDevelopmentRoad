// دالة مساعدة لتشفير الرموز الخاصة بـ HTML لمنع أخطاء تيليجرام
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
    // 1. استلام البيانات من النموذج
    const request = context.request;
    const formData = await request.formData();
    
    // جلب البيانات مع توفير قيمة افتراضية للرسالة
    const name = formData.get('contactName');
    const email = formData.get('email');
    const offer = formData.get('offer');
    const message = formData.get('message') || 'Unknown!';

    // 2. إعدادات Telegram
    const BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = context.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Missing Telegram environment variables.");
      return new Response(JSON.stringify({ success: false, error: "Server Configuration Error" }), { status: 500 });
    }

    // 3. حماية المدخلات وتنسيق الرسالة
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOffer = escapeHtml(offer);
    const safeMessage = escapeHtml(message);

    const telegramText = `🔔 <b>New Offer Received</b>\n\n` +
                         `🌐 : TheDevelopmentRoad.com\n` +
                         `👤 : ${safeName}\n` +
                         `📧 : <code>${safeEmail}</code>\n` +
                         `💰 : <b>${safeOffer}</b>\n` +
                         `\n<pre>${safeMessage}</pre>`;

    // 4. إرسال الطلب إلى خوادم Telegram والتحقق من النتيجة
    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramText,
        parse_mode: 'HTML'
      })
    });

    // التحقق الفعلي من أن تيليجرام قبل الرسالة
    if (!tgResponse.ok) {
      const tgError = await tgResponse.text();
      console.error("Telegram API Error:", tgError); // سيفيدك جداً في تتبع الأخطاء من لوحة Cloudflare
      return new Response(JSON.stringify({ success: false, error: "Failed to send message to Telegram" }), { 
        status: 502, // Bad Gateway (since Telegram failed)
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. الرد على المتصفح بنجاح العملية
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // تسجيل الخطأ الفعلي لتتمكن من قراءته في Cloudflare Logs
    console.error("Internal Server Error in onRequestPost:", error);
    
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
