import { getBotConfig } from "./configManager";

export interface ResponseResult {
  replyText: string;
  matchedRule?: string;
}

function normalizeArabicText(str: string): string {
  return (str || "")
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
    .replace(/[أإآ]/g, "ا") // normalize alef
    .replace(/ة/g, "ه") // normalize taa marbouta
    .replace(/[\r\n\t]/g, " ")
    .trim()
    .toLowerCase();
}

export function generateAutomatedReply(incomingMessage: string, hasMedia?: boolean): ResponseResult {
  const config = getBotConfig();

  // If bot is turned OFF in dashboard
  if (!config.botActive) {
    return { replyText: "" };
  }

  const text = normalizeArabicText(incomingMessage);

  // 1. Direct Route to Customer Support for Existing Order Status / Delivery Time Inquiries
  const isExistingOrderInquiry =
    text.includes("متى يوصل") ||
    text.includes("امتى هيوصل") ||
    text.includes("امتى يوصل") ||
    text.includes("وين طلبي") ||
    text.includes("وين الطلب") ||
    text.includes("اين طلبي") ||
    text.includes("حالة الطلب") ||
    text.includes("تتبع الطلب") ||
    text.includes("تتبع طلبي") ||
    text.includes("استفسار عن طلب") ||
    text.includes("طلب سابق") ||
    text.includes("تاخر الطلب") ||
    text.includes("وصل الطلب") ||
    text.includes("ما وصل");

  if (isExistingOrderInquiry) {
    return {
      replyText:
        "👤 **خدمة العملاء - متابعة الطلبات**:\nتم توجيه استفسارك بشأن طلبك وموعد وصوله لممثل خدمة العملاء مباشرة وسيقوم بالرد عليك وتزويدك بحالة الطلب فوراً 📦☕",
      matchedRule: "EXISTING_ORDER_INQUIRY_AGENT",
    };
  }

  // Check if customer is asking HOW to order vs actually placing an order
  const isAskingHowToOrder =
    text.includes("كيفية") ||
    text.includes("ازاي") ||
    text.includes("كيف اطلب") ||
    text.includes("ازاي اطلب") ||
    text.includes("طريقة الطلب") ||
    text.includes("كيفية الطلب");

  // 2. Order Submitted Confirmation (Image OR Text with product name e.g. مج دبدوب, or name/address details)
  if (
    !isAskingHowToOrder &&
    (hasMedia ||
      text.includes("مج ") ||
      text.endsWith("مج") ||
      text.includes("كوب") ||
      text.includes("صورة") ||
      text.includes("طلب:") ||
      text.includes("اريد") ||
      text.includes("ابي") ||
      text.includes("ابغى") ||
      (text.includes("اسم") && text.includes("عنوان")) ||
      (text.includes("شارع") && text.includes("منطقة")) ||
      text.includes("قطعة") ||
      text.includes("مبنى"))
  ) {
    return {
      replyText:
        "🎉 **تم تسجيل طلبك بنجاح!** ☕\n\nسوف يتم التواصل معك من قبل خدمة العملاء لتأكيد الطلب والتوصيل في أقرب وقت.\n\nشكراً لتسوقك من CoffeeStore ✨",
      matchedRule: "ORDER_SUBMITTED_CONFIRMATION",
    };
  }

  // 3. Welcome / Greetings
  const greetingKeywords = ["مرحبا", "مرحبتين", "سلام", "السلام عليكم", "hi", "hello", "start", "البوت", "بداية"];
  if (greetingKeywords.some((k) => text === k || text.startsWith(k))) {
    return {
      replyText: config.autoWelcomeText,
      matchedRule: "GREETING",
    };
  }

  // 4. Prices & Website Catalog (Option 1)
  if (
    text.includes("منيو") ||
    text.includes("منتجات") ||
    text.includes("اسعار") ||
    text.includes("سعر") ||
    text.includes("موقع") ||
    text.includes("كتالوج") ||
    text === "1"
  ) {
    const menuResponse =
      config.menuLinkText ||
      "☕ **تصفح الكتالوج والأسعار الكاملة**:\nيمكنك الاطلاع على كافة المنتجات الفاخرة وأسعارها المحدثة عبر موقعنا الإلكتروني الرسمي:\n\n🌐 www.coffeestoreq8.com";
    return {
      replyText: menuResponse,
      matchedRule: "PRICES_MENU_LINK",
    };
  }

  // 5. How to Order (Option 2)
  if (
    text.includes("طلب") ||
    text.includes("اطلب") ||
    text.includes("كيفية") ||
    text.includes("ازاي") ||
    text.includes("كيف") ||
    text.includes("طريقة") ||
    text === "2"
  ) {
    const howToOrderResponse =
      config.howToOrderText ||
      "📝 **كيفية الطلب من CoffeeStore**:\nللطلب السريع عبر الواتساب، يرجى إرسال ما يلي:\n\n1. 👤 **الاسم الكامل**\n2. 📍 **عنوان التوصيل بالتفصيل** (المنطقة، الشارع، المبنى)\n3. 📸 **صورة أو اسم المنتج المطلوب** (مثل: مج دبدوب)\n\nوسيقوم النظام وممثل الخدمة بتأكيد طلبك فوراً! ☕";
    return {
      replyText: howToOrderResponse,
      matchedRule: "HOW_TO_ORDER",
    };
  }

  // 6. GCC International Shipping Inquiries (السعودية، قطر، البحرين، عمان، الإمارات)
  if (
    text.includes("السعودية") ||
    text.includes("سعودية") ||
    text.includes("قطر") ||
    text.includes("البحرين") ||
    text.includes("بحرين") ||
    text.includes("عمان") ||
    text.includes("الامارات") ||
    text.includes("امارات") ||
    text.includes("الخليج") ||
    text.includes("خليج") ||
    text.includes("دولي") ||
    text.includes("خارج الكويت")
  ) {
    const gccResponse =
      config.gccShippingText ||
      "🌍 **الشحن والتوصيل لدول الخليج**:\nنعم متاح التوصيل والتوصيل لجميع دول الخليج ✈️ (السعودية، قطر، البحرين، عمان، الإمارات).\n\n💰 **تكلفة الشحن الدولي**: تُحسب قيمة الشحن بناءً على كمية ووزن الطلب عند التجهيز.";
    return {
      replyText: gccResponse,
      matchedRule: "GCC_SHIPPING",
    };
  }

  // 7. Local Delivery & Payment Options & Shipping Times (Option 3)
  if (
    text.includes("توصيل") ||
    text.includes("شحن") ||
    text.includes("دفع") ||
    text.includes("رابط") ||
    text.includes("ومض") ||
    text.includes("knet") ||
    text.includes("دينار") ||
    text.includes("استوك") ||
    text.includes("stock") ||
    text.includes("بري") ||
    text.includes("اوردر") ||
    text === "3"
  ) {
    return {
      replyText: config.paymentAndShipping,
      matchedRule: "SHIPPING_PAYMENT",
    };
  }

  // 8. Customer Support (Option 4)
  if (text.includes("خدمة عملاء") || text.includes("دعم") || text.includes("موظف") || text.includes("تحدث") || text === "4") {
    return {
      replyText: "👤 تم توجيه استفسارك لموظف خدمة العملاء وسيقوم بالرد عليك في أقرب وقت متاح.\nشكراً لتواصلك مع CoffeeStore ☕",
      matchedRule: "HUMAN_SUPPORT",
    };
  }

  // 9. Check Custom Config Rules
  for (const rule of config.customResponses) {
    if (rule.keyword && text.includes(normalizeArabicText(rule.keyword))) {
      return {
        replyText: rule.response,
        matchedRule: `CUSTOM_${rule.id}`,
      };
    }
  }

  // Default Fallback
  return {
    replyText: `عذراً، لم أفهم طلبك بالكامل 🙏\n\n${config.autoWelcomeText}`,
    matchedRule: "FALLBACK",
  };
}
