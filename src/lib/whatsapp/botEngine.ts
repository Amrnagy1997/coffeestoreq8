import prisma from "@/lib/prisma";
import { BotResponsePayload, sendMetaWhatsAppMessage } from "./metaClient";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export async function processWhatsAppIncomingMessage(
  userPhone: string,
  incomingText: string,
  buttonPayload?: string
): Promise<BotResponsePayload> {
  const cleanPhone = userPhone.replace(/[^0-9]/g, "");
  const text = (incomingText || "").trim();
  const payloadId = buttonPayload || text;

  // 1. Get or Create User Session
  let session = await prisma.whatsAppSession.findUnique({
    where: { phone: cleanPhone },
  });

  if (!session) {
    session = await prisma.whatsAppSession.create({
      data: {
        phone: cleanPhone,
        step: "IDLE",
        cartData: "[]",
      },
    });
  }

  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(session.cartData || "[]");
  } catch (e) {
    cart = [];
  }

  // Handle explicit reset command
  if (payloadId === "BTN_RESTART" || text.toLowerCase() === "إلغاء" || text.toLowerCase() === "الغاء" || text.toLowerCase() === "reset") {
    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { step: "IDLE", cartData: "[]", tempName: null, tempAddress: null },
    });
    return getWelcomePayload(cleanPhone);
  }

  // State Machine logic
  const currentStep = session.step;

  // STEP: AWAITING_NAME during Checkout
  if (currentStep === "AWAITING_NAME") {
    if (text.length < 2) {
      return {
        recipientPhone: cleanPhone,
        type: "text",
        text: "⚠️ يرجى إدخال اسم ثلاثي صحيح لاستكمال الطلب:",
      };
    }

    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { tempName: text, step: "AWAITING_ADDRESS" },
    });

    return {
      recipientPhone: cleanPhone,
      type: "text",
      text: `أهلاً بك يا ${text}! 👋\n\nيرجى إرسال **عنوان التوصيل بالتفصيل** (المنطقة، الشارع، رقم المنزل/المبنى، الشقة): 📍`,
    };
  }

  // STEP: AWAITING_ADDRESS during Checkout
  if (currentStep === "AWAITING_ADDRESS") {
    if (text.length < 5) {
      return {
        recipientPhone: cleanPhone,
        type: "text",
        text: "⚠️ يرجى كتابة عنوان مفصل ليتمكن مندوب التوصيل من الوصول إليك بسهولة:",
      };
    }

    if (cart.length === 0) {
      await prisma.whatsAppSession.update({
        where: { phone: cleanPhone },
        data: { step: "IDLE" },
      });
      return {
        recipientPhone: cleanPhone,
        type: "interactive_buttons",
        text: "🛒 سلتك فارغة حالياً! تصفح المنيو وأضف منتجات أولاً:",
        buttons: [
          { id: "BTN_CATALOG", title: "☕ تصفح المنيو" },
          { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
        ],
      };
    }

    // Create Order in DB!
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const customerName = session.tempName || "عميل واتساب";
    const customerAddress = text;

    try {
      const order = await prisma.order.create({
        data: {
          customerName,
          customerPhone: cleanPhone,
          customerAddress,
          totalPrice,
          instagramMessage: "طلب عبر بوت الواتساب التفاعلي",
          status: "pending",
          items: {
            create: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              variantId: item.variantId || null,
              variantName: item.variantName || null,
            })),
          },
        },
      });

      // Clear Session
      await prisma.whatsAppSession.update({
        where: { phone: cleanPhone },
        data: { step: "IDLE", cartData: "[]", tempName: null, tempAddress: null },
      });

      const itemsSummary = cart.map((i) => `• ${i.name} (x${i.quantity}) - ${i.price * i.quantity} د.ك`).join("\n");

      return {
        recipientPhone: cleanPhone,
        type: "interactive_buttons",
        text: `🎉 **تم تأكيد طلبك بنجاح!** 🎉\n\n📦 **رقم الطلب**: \`${order.id}\`\n👤 **الاسم**: ${customerName}\n📞 **الهاتف**: ${cleanPhone}\n📍 **العنوان**: ${customerAddress}\n\n📝 **تفاصيل الطلب**:\n${itemsSummary}\n\n💰 **الإجمالي**: ${totalPrice.toFixed(2)} د.ك\n\nسيتم تجهيز طلبك وتوصيله في أقرب وقت. يمكنك متابعة حالة الطلب في أي وقت!`,
        buttons: [
          { id: `BTN_TRACK_${order.id}`, title: "📦 تتبع هذا الطلب" },
          { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
        ],
      };
    } catch (err: any) {
      console.error("[WhatsApp Order Creation Error]:", err);
      return {
        recipientPhone: cleanPhone,
        type: "text",
        text: "❌ حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى لاحقاً.",
      };
    }
  }

  // STEP: AWAITING_ORDER_ID for Tracking
  if (currentStep === "AWAITING_ORDER_ID") {
    const searchId = text.trim();
    // Search DB by Order ID or Phone
    const foundOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: searchId },
          { customerPhone: { contains: searchId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { step: "IDLE" },
    });

    if (!foundOrder) {
      return {
        recipientPhone: cleanPhone,
        type: "interactive_buttons",
        text: `❌ لم نجد أي طلب مرتبط بالرمز: "${searchId}".\n\nتأكد من رقم الطلب وحاول مجدداً:`,
        buttons: [
          { id: "BTN_TRACK_ORDER", title: "إعادة المحاولة" },
          { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
        ],
      };
    }

    const statusMap: Record<string, string> = {
      pending: "⏳ قيد المراجعة والإعداد",
      processing: "☕ قيد التجهيز في المطبخ/المغسلة",
      shipped: "🚚 في الطريق إليك مع المندوب",
      delivered: "✅ تم التسليم بنجاح",
      cancelled: "❌ ملغي",
    };

    const statusLabel = statusMap[foundOrder.status] || foundOrder.status;
    const itemsList = foundOrder.items.map((it) => `• ${it.name} (x${it.quantity})`).join("\n");

    return {
      recipientPhone: cleanPhone,
      type: "interactive_buttons",
      text: `📦 **تفاصيل الطلب #${foundOrder.id}**:\n\n👤 **العميل**: ${foundOrder.customerName}\n📊 **الحالة**: ${statusLabel}\n💰 **المبلغ**: ${foundOrder.totalPrice.toFixed(2)} د.ك\n📅 **التاريخ**: ${new Date(foundOrder.createdAt).toLocaleDateString("ar-EG")}\n\n📝 **المنتجات**:\n${itemsList}`,
      buttons: [
        { id: "BTN_CATALOG", title: "☕ طلب جديد" },
        { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
      ],
    };
  }

  // --- BUTTON PAYLOAD COMMAND DISPATCHER ---

  // Command: Show Main Menu / Welcome
  if (payloadId === "BTN_MAIN_MENU" || text.includes("مرحبا") || text.includes("سلام") || text.includes("menu") || text.includes("المنيو")) {
    return getWelcomePayload(cleanPhone);
  }

  // Command: Browse Catalog
  if (payloadId === "BTN_CATALOG" || text.includes("منيو") || text.includes("منتجات") || text.includes("catalog")) {
    const products = await prisma.product.findMany({
      take: 8,
      include: { images: true, variants: true },
    });

    if (products.length === 0) {
      return {
        recipientPhone: cleanPhone,
        type: "text",
        text: "☕ المتجر قيد التحديث حالياً ولا توجد منتجات متوفرة الآن.",
      };
    }

    const rows = products.map((p) => ({
      id: `ADD_PRODUCT_${p.id}`,
      title: `${p.name}`.substring(0, 24),
      description: `${p.price.toFixed(2)} د.ك - ${p.description || "كوب قهوة فاخر"}`.substring(0, 72),
    }));

    let messageText = "☕ **منيو CoffeeStore المميز**:\nاختر من قائمة المنتجات أدناه لإضافتها مباشرة لسلتك:\n\n";
    products.forEach((p, idx) => {
      messageText += `${idx + 1}. **${p.name}** - ${p.price.toFixed(2)} د.ك\n`;
    });

    return {
      recipientPhone: cleanPhone,
      type: "interactive_list",
      text: messageText,
      listButtonText: "☕ تصفح واختر المنتجات",
      sections: [
        {
          title: "القهوة والأكواب",
          rows,
        },
      ],
    };
  }

  // Command: Add Specific Product to Cart
  if (payloadId.startsWith("ADD_PRODUCT_")) {
    const prodId = payloadId.replace("ADD_PRODUCT_", "");
    const product = await prisma.product.findUnique({
      where: { id: prodId },
    });

    if (!product) {
      return {
        recipientPhone: cleanPhone,
        type: "text",
        text: "❌ هذا المنتج غير متوفر حالياً.",
      };
    }

    // Add to cart in session
    const existingIndex = cart.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { cartData: JSON.stringify(cart) },
    });

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      recipientPhone: cleanPhone,
      type: "interactive_buttons",
      text: `✅ **تمت إضافة "${product.name}" إلى سلتك بنجاح!**\n\n🛒 إجمالي السلة: **${totalCount} منتجات** (${totalPrice.toFixed(2)} د.ك)`,
      buttons: [
        { id: "BTN_MY_CART", title: "🛒 عرض السلة والطلب" },
        { id: "BTN_CATALOG", title: "➕ إضافة منتج آخر" },
        { id: "BTN_CHECKOUT", title: "💳 إتمام الطلب الآن" },
      ],
    };
  }

  // Command: View Cart
  if (payloadId === "BTN_MY_CART" || text.includes("سلة") || text.includes("cart")) {
    if (cart.length === 0) {
      return {
        recipientPhone: cleanPhone,
        type: "interactive_buttons",
        text: "🛒 سلتك فارغة حالياً!\n\nيمكنك اختيار منتجاتك المفضلة من المنيو:",
        buttons: [
          { id: "BTN_CATALOG", title: "☕ تصفح المنيو" },
          { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
        ],
      };
    }

    const itemsSummary = cart.map((i) => `• **${i.name}** (x${i.quantity}) - ${(i.price * i.quantity).toFixed(2)} د.ك`).join("\n");
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      recipientPhone: cleanPhone,
      type: "interactive_buttons",
      text: `🛒 **محتويات سلتك الحالية**:\n\n${itemsSummary}\n\n💰 **الإجمالي الكلي**: ${totalPrice.toFixed(2)} د.ك`,
      buttons: [
        { id: "BTN_CHECKOUT", title: "💳 إتمام الطلب الآن" },
        { id: "BTN_CLEAR_CART", title: "🗑️ إفراغ السلة" },
        { id: "BTN_CATALOG", title: "☕ إضافة المزيد" },
      ],
    };
  }

  // Command: Clear Cart
  if (payloadId === "BTN_CLEAR_CART") {
    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { cartData: "[]" },
    });

    return {
      recipientPhone: cleanPhone,
      type: "interactive_buttons",
      text: "🗑️ تم إفراغ سلتك بنجاح.",
      buttons: [
        { id: "BTN_CATALOG", title: "☕ تصفح المنيو" },
        { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
      ],
    };
  }

  // Command: Initiate Checkout
  if (payloadId === "BTN_CHECKOUT" || text.includes("طلب") || text.includes("شراء") || text.includes("checkout")) {
    if (cart.length === 0) {
      return {
        recipientPhone: cleanPhone,
        type: "interactive_buttons",
        text: "🛒 السلة فارغة. من فضلك اختر منتجاً أولاً من المنيو:",
        buttons: [{ id: "BTN_CATALOG", title: "☕ تصفح المنيو" }],
      };
    }

    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { step: "AWAITING_NAME" },
    });

    return {
      recipientPhone: cleanPhone,
      type: "text",
      text: "📝 **بدء إجراءات الطلب**:\n\nيرجى كتابة **اسمك الكامل** لاستخدامه في فاتورة الطلب 👤:",
    };
  }

  // Command: Track Order Prompt
  if (payloadId === "BTN_TRACK_ORDER" || payloadId.startsWith("BTN_TRACK_") || text.includes("تتبع") || text.includes("حالة")) {
    if (payloadId.startsWith("BTN_TRACK_") && payloadId !== "BTN_TRACK_ORDER") {
      const targetOrderId = payloadId.replace("BTN_TRACK_", "");
      const foundOrder = await prisma.order.findUnique({
        where: { id: targetOrderId },
        include: { items: true },
      });

      if (foundOrder) {
        const itemsList = foundOrder.items.map((it) => `• ${it.name} (x${it.quantity})`).join("\n");
        return {
          recipientPhone: cleanPhone,
          type: "interactive_buttons",
          text: `📦 **حالة الطلب #${foundOrder.id}**:\n\n📊 **الحالة**: ${foundOrder.status.toUpperCase()}\n💰 **الإجمالي**: ${foundOrder.totalPrice.toFixed(2)} د.ك\n📅 **التاريخ**: ${new Date(foundOrder.createdAt).toLocaleDateString()}\n\n📝 **العناصر**:\n${itemsList}`,
          buttons: [
            { id: "BTN_CATALOG", title: "☕ طلب جديد" },
            { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
          ],
        };
      }
    }

    await prisma.whatsAppSession.update({
      where: { phone: cleanPhone },
      data: { step: "AWAITING_ORDER_ID" },
    });

    return {
      recipientPhone: cleanPhone,
      type: "text",
      text: "🔍 **متابعة الطلبات**:\n\nمن فضلك أرسل **رقم الطلب** أو **رقم الهاتف** للبحث عن حالة طلبك 📦:",
    };
  }

  // Command: Support Info
  if (payloadId === "BTN_SUPPORT" || text.includes("دعم") || text.includes("مساعدة") || text.includes("تواصل")) {
    return {
      recipientPhone: cleanPhone,
      type: "interactive_buttons",
      text: "📞 **خدمة العملاء والدعم الفني - CoffeeStore**:\n\n📍 **الموقع**: الكويت\n⏰ **ساعات العمل**: يومياً 8:00 ص - 11:00 م\n📸 **انستغرام**: instagram.com/coffeestoreq8\n\nنحن يسعدنا دائماً خدمتك!",
      buttons: [
        { id: "BTN_CATALOG", title: "☕ تصفح المنيو" },
        { id: "BTN_MAIN_MENU", title: "القائمة الرئيسية" },
      ],
    };
  }

  // Default fallback welcome
  return getWelcomePayload(cleanPhone);
}

function getWelcomePayload(phone: string): BotResponsePayload {
  return {
    recipientPhone: phone,
    type: "interactive_buttons",
    text: "أهلاً بك في **CoffeeStore** ☕✨\n\nبوت الخدمة الذاتية والتسوق السريع عبر الواتساب. اختر من الخيارات التالية للبدء:",
    buttons: [
      { id: "BTN_CATALOG", title: "☕ تصفح المنيو" },
      { id: "BTN_MY_CART", title: "🛒 السلة والطلب" },
      { id: "BTN_TRACK_ORDER", title: "📦 تتبع الطلب" },
    ],
  };
}
