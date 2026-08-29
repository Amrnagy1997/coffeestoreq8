export async function sendTelegramOrderNotification(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  instagramMessage?: string | null;
  items: {
    name: string;
    quantity: number;
    price: number;
    variantName?: string | null;
  }[];
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "1441536109";

  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Telegram notification skipped.");
    return;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `• *${item.name}*${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity} - ${item.price} KWD`
    )
    .join("\n");

  const message = `
🛍️ *طلب جديد على المتجر! (Coffee Store Q8)*
━━━━━━━━━━━━━━━━━━
🆔 *رقم الطلب:* \`#${order.id}\`
👤 *اسم العميل:* ${order.customerName}
📞 *رقم الهاتف:* [${order.customerPhone}](tel:${order.customerPhone})
📍 *العنوان:* ${order.customerAddress}
${order.instagramMessage ? `💬 *ملاحظات/إنستغرام:* ${order.instagramMessage}\n` : ""}
📦 *المنتجات المطلوبة:*
${itemsList}

💰 *إجمالي الطلب:* *${order.totalPrice} KWD*
━━━━━━━━━━━━━━━━━━
🔗 [عرض الطلبات في لوحة التحكم](https://coffeestoreq8.com/admin/orders)
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error("فشل إرسال إشعار تيليجرام:", result);
    } else {
      console.log("تم إرسال إشعار الطلب الجديد عبر تيليجرام بنجاح!");
    }
  } catch (error) {
    console.error("خطأ أثناء إرسال إشعار تيليجرام:", error);
  }
}
