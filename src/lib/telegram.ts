function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "8943207136:AAFVbI4iIJQDJm5Gy-S4JfkOqaM0meWbZb8";
  const chatId = process.env.TELEGRAM_CHAT_ID || "1441536109";

  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Telegram notification skipped.");
    return;
  }

  const itemsListHtml = order.items
    .map(
      (item) =>
        `• <b>${escapeHtml(item.name)}</b>${item.variantName ? ` (${escapeHtml(item.variantName)})` : ""} × ${item.quantity} - ${item.price} KWD`
    )
    .join("\n");

  const htmlMessage = `
🛍️ <b>طلب جديد على المتجر! (Coffee Store Q8)</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>رقم الطلب:</b> <code>#${escapeHtml(order.id)}</code>
👤 <b>اسم العميل:</b> ${escapeHtml(order.customerName)}
📞 <b>رقم الهاتف:</b> <a href="tel:${escapeHtml(order.customerPhone)}">${escapeHtml(order.customerPhone)}</a>
📍 <b>العنوان:</b> ${escapeHtml(order.customerAddress)}
${order.instagramMessage ? `💬 <b>ملاحظات/إنستغرام:</b>\n${escapeHtml(order.instagramMessage)}\n` : ""}
📦 <b>المنتجات المطلوبة:</b>
${itemsListHtml}

💰 <b>إجمالي الطلب:</b> <b>${order.totalPrice} KWD</b>
━━━━━━━━━━━━━━━━━━
🔗 <a href="https://coffeestoreq8.com/admin/orders">عرض الطلبات في لوحة التحكم</a>
  `.trim();

  const plainMessage = `
🛍️ طلب جديد على المتجر! (Coffee Store Q8)
━━━━━━━━━━━━━━━━━━
🆔 رقم الطلب: #${order.id}
👤 اسم العميل: ${order.customerName}
📞 رقم الهاتف: ${order.customerPhone}
📍 العنوان: ${order.customerAddress}
${order.instagramMessage ? `💬 ملاحظات/إنستغرام:\n${order.instagramMessage}\n` : ""}
📦 المنتجات المطلوبة:
${order.items.map((i) => `• ${i.name}${i.variantName ? ` (${i.variantName})` : ""} x ${i.quantity} - ${i.price} KWD`).join("\n")}

💰 إجمالي الطلب: ${order.totalPrice} KWD
━━━━━━━━━━━━━━━━━━
🔗 https://coffeestoreq8.com/admin/orders
  `.trim();

  try {
    // Attempt 1: Rich HTML Message
    let response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    let result = await response.json();
    if (result.ok) {
      console.log("تم إرسال إشعار الطلب الجديد عبر تيليجرام بنجاح!");
      return;
    }

    console.warn("HTML Telegram send failed, retrying with plain text...", result);

    // Attempt 2: Fallback Plain Text (Guaranteed to succeed)
    response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: plainMessage,
        disable_web_page_preview: true,
      }),
    });

    result = await response.json();
    if (!result.ok) {
      console.error("فشل إرسال إشعار تيليجرام حتى في النمط العادي:", result);
    } else {
      console.log("تم إرسال إشعار الطلب الجديد بالنمط النصي بنجاح!");
    }
  } catch (error) {
    console.error("خطأ أثناء إرسال إشعار تيليجرام:", error);
  }
}
