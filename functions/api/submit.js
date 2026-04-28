export async function onRequestPost(context) {
  try {
    // 1. استلام البيانات من النموذج
    const request = context.request;
    const formData = await request.formData();
    
    const name = formData.get('contactName');
    const email = formData.get('email');
    const offer = formData.get('offer');
    const message = formData.get('message') || 'No additional details provided.';

    // 2. إعدادات Telegram (سيتم جلبها من متغيرات البيئة في Cloudflare بأمان)
    const BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = context.env.TELEGRAM_CHAT_ID;

    // 3. تنسيق الرسالة الفاخرة التي ستصلك على تيليجرام
    const telegramText = `🚨 **New Strategic Offer Received**\n\n` +
                         `🌐 **Asset:** TheDevelopmentRoad.com\n` +
                         `👤 **Contact:** ${name}\n` +
                         `📧 **Email:** ${email}\n` +
                         `💰 **Proposed Offer:** ${offer}\n` +
                         `📝 **Message:**\n${message}`;

    // 4. إرسال الطلب إلى خوادم Telegram
    if (BOT_TOKEN && CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramText,
          parse_mode: 'Markdown'
        })
      });
    }

    // 5. الرد على المتصفح بنجاح العملية
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
  }
}