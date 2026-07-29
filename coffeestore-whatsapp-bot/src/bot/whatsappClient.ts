import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { generateAutomatedReply } from "./responseEngine";

export interface BotState {
  status: "DISCONNECTED" | "SCAN_QR" | "CONNECTED" | "INITIALIZING";
  qrCodeDataUrl: string | null;
  rawQrText: string | null;
  botPhone: string | null;
  pairingCode: string | null;
  pausedChatsCount: number;
  systemLogs: string[];
  logs: Array<{
    id: string;
    timestamp: string;
    from: string;
    incomingText: string;
    replyText: string;
    matchedRule?: string;
  }>;
}

const state: BotState = {
  status: "INITIALIZING",
  qrCodeDataUrl: null,
  rawQrText: null,
  botPhone: null,
  pairingCode: null,
  pausedChatsCount: 0,
  systemLogs: [],
  logs: [],
};

function appendSystemLog(msg: string) {
  const time = new Date().toLocaleTimeString("ar-EG");
  const entry = `[${time}] ${msg}`;
  console.log(entry);
  state.systemLogs.unshift(entry);
  if (state.systemLogs.length > 30) state.systemLogs.pop();
}

const pausedChats = new Map<string, number>();
const botSentMessageTexts = new Set<string>();
let waClient: Client | null = null;

export function clearAllPausedChats(): number {
  const count = pausedChats.size;
  pausedChats.clear();
  botSentMessageTexts.clear();
  state.pausedChatsCount = 0;
  appendSystemLog(`تم إزالة التوقف لـ ${count} محادثة. البوت جاهز للرد الآلي الفوري على جميع الرسائل المتتالية.`);
  return count;
}

export function unpauseChat(phone: string) {
  const clean = phone.replace(/[^0-9]/g, "");
  pausedChats.delete(clean);
  state.pausedChatsCount = pausedChats.size;
}

export async function ensureQrCodeDataUrl(): Promise<string> {
  if (state.rawQrText) {
    try {
      state.qrCodeDataUrl = await QRCode.toDataURL(state.rawQrText, { width: 320, margin: 2 });
    } catch (e) {
      console.error("Error rendering QR data URL:", e);
    }
  }
  return state.qrCodeDataUrl || "";
}

export async function requestPairingCode(phoneNumber: string): Promise<string> {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  if (!waClient) {
    throw new Error("سيرفر الواتساب قيد التهيئة، يرجى المحاولة بعد قليل.");
  }
  try {
    appendSystemLog(`جاري طلب كود الاقتران للرقم: ${cleanPhone}`);
    const code = await (waClient as any).requestPairingCode(cleanPhone);
    state.pairingCode = code;
    appendSystemLog(`تم توليد كود الاقتران بنجاح: ${code}`);
    return code;
  } catch (err: any) {
    appendSystemLog(`فشل توليد كود الاقتران: ${err.message}`);
    throw new Error(err.message || "تعذر توليد كود الاقتران حالياً.");
  }
}

export async function resetWhatsAppClientSession(): Promise<void> {
  appendSystemLog("جاري إعادة تشغيل جلسة الواتساب ومسح التخزين المؤقت...");
  try {
    if (waClient) {
      await waClient.destroy().catch(() => {});
      waClient = null;
    }
    const authFolder = path.join(process.cwd(), ".wwebjs_auth");
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
      appendSystemLog("تم مسح مجلد الجلسة القديمة .wwebjs_auth بنجاح.");
    }
  } catch (e: any) {
    appendSystemLog(`تنبيه أثناء مسح الجلسة: ${e.message}`);
  }

  state.status = "INITIALIZING";
  state.qrCodeDataUrl = null;
  state.rawQrText = null;
  state.botPhone = null;
  state.pairingCode = null;

  setTimeout(() => {
    initWhatsAppWebClient();
  }, 1000);
}

export async function initWhatsAppWebClient() {
  appendSystemLog("بدء تشغيل محرك WhatsApp Web المباشر...");
  state.status = "INITIALIZING";

  clearAllPausedChats();

  let executablePath: string | undefined = process.env.PUPPETEER_EXECUTABLE_PATH;

  if (!executablePath) {
    const chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ];

    for (const p of chromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        appendSystemLog(`تم العثور على متصفح Chromium في: ${p}`);
        break;
      }
    }
  } else {
    appendSystemLog(`استخدام متصفح النظام السحابي PUPPETEER_EXECUTABLE_PATH: ${executablePath}`);
  }

  try {
    waClient = new Client({
      authStrategy: new LocalAuth({
        clientId: "coffeestore-bot-session",
        dataPath: path.join(process.cwd(), ".wwebjs_auth"),
      }),
      puppeteer: {
        headless: true,
        executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-dev-tools",
          "--max-memory-per-target=128",
          '--js-flags="--max-old-space-size=128"',
        ],
      },
    });

    waClient.on("qr", async (qr) => {
      appendSystemLog("تم استلام رمز QR حقيقي جديد من خوادم الواتساب!");
      state.rawQrText = qr;
      state.status = "SCAN_QR";
      try {
        state.qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 2 });
      } catch (err) {
        console.error("Failed to generate QR data URL:", err);
      }
    });

    waClient.on("ready", () => {
      appendSystemLog("تم الاتصال بالواتساب وجاهزية البوت 100%!");
      state.status = "CONNECTED";
      state.qrCodeDataUrl = null;
      state.rawQrText = null;
      state.pairingCode = null;
      if (waClient?.info?.wid?.user) {
        state.botPhone = `+${waClient.info.wid.user}`;
      } else {
        state.botPhone = "WhatsApp Business Connected";
      }
    });

    waClient.on("authenticated", () => {
      appendSystemLog("تم توثيق جلسة الواتساب بنجاح (Authenticated)!");
      state.status = "CONNECTED";
      state.qrCodeDataUrl = null;
      state.rawQrText = null;
      state.botPhone = "مرتبط بالواتساب التجاري";
    });

    waClient.on("auth_failure", (msg) => {
      appendSystemLog(`فشل التوثيق Auth Failure: ${msg}`);
      state.status = "SCAN_QR";
    });

    waClient.on("disconnected", (reason) => {
      appendSystemLog(`انقطع الاتصال Disconnected: ${reason}`);
      state.status = "DISCONNECTED";
      state.botPhone = null;
    });

    // Event: Human Agent Takeover Listener (Detect ONLY manual human agent messages)
    waClient.on("message_create", async (msg) => {
      if (msg.fromMe && !msg.to.includes("@g.us")) {
        const targetPhone = msg.to.replace("@c.us", "").replace(/[^0-9]/g, "");
        const bodyText = (msg.body || "").trim();

        // Check if message was sent by the bot itself
        const isBotAutomatedMessage =
          botSentMessageTexts.has(bodyText) ||
          bodyText.includes("CoffeeStore") ||
          bodyText.includes("تصفح الكتالوج والأسعار") ||
          bodyText.includes("كيفية الطلب") ||
          bodyText.includes("تم تسجيل طلبك بنجاح") ||
          bodyText.includes("توجيه استفسارك");

        if (isBotAutomatedMessage) {
          botSentMessageTexts.delete(bodyText);
          return; // Do NOT pause auto-reply for bot's own automated messages!
        }

        if (targetPhone) {
          pausedChats.set(targetPhone, Date.now());
          state.pausedChatsCount = pausedChats.size;
          appendSystemLog(`رد بشري يدوي صادِر للرقم ${targetPhone}. تم إيقاف البوت لهذا الرقم لمدة 15 دقيقة.`);
        }
      }
    });

    waClient.on("message", async (msg) => {
      if (msg.from.includes("@g.us") || msg.from.includes("status")) return;

      const fromPhone = msg.from.replace("@c.us", "").replace(/[^0-9]/g, "");
      const incomingText = (msg.body || "").trim();

      appendSystemLog(`رسالة جديدة قادمة من ${fromPhone}: "${incomingText}"`);

      const pausedTime = pausedChats.get(fromPhone);
      const isUnpauseCommand =
        incomingText.toLowerCase().includes("البوت") ||
        incomingText.toLowerCase().includes("منيو") ||
        incomingText.toLowerCase().includes("سلام") ||
        incomingText.toLowerCase().includes("مرحبا") ||
        incomingText.toLowerCase().includes("start");

      const fifteenMinutesInMs = 15 * 60 * 1000;
      if (pausedTime && Date.now() - pausedTime > fifteenMinutesInMs) {
        pausedChats.delete(fromPhone);
        state.pausedChatsCount = pausedChats.size;
      }

      if (pausedChats.has(fromPhone) && !isUnpauseCommand) {
        appendSystemLog(`تم تخطي الرد التلقائي للرقم ${fromPhone} لوجود محادثة بشرية يدوية نشطة.`);
        return;
      }

      if (isUnpauseCommand && pausedChats.has(fromPhone)) {
        pausedChats.delete(fromPhone);
        state.pausedChatsCount = pausedChats.size;
      }

      const hasPhotoOrMedia = Boolean(msg.hasMedia);
      const result = generateAutomatedReply(incomingText, hasPhotoOrMedia);

      if (result.replyText && waClient) {
        try {
          // Register bot reply text so message_create doesn't pause the chat
          botSentMessageTexts.add(result.replyText.trim());

          await waClient.sendMessage(msg.from, result.replyText);
          addBotLog(fromPhone, incomingText, result.replyText, result.matchedRule);
          appendSystemLog(`تم إرسال الرد التلقائي بنجاح إلى ${fromPhone} (${result.matchedRule})`);
        } catch (sendErr: any) {
          appendSystemLog(`خطأ أثناء إرسال الرسالة إلى ${fromPhone}: ${sendErr.message}`);
        }
      }
    });

    waClient.initialize().catch((err) => {
      appendSystemLog(`خطأ عند تهيئة العميل Initialize Error: ${err.message}`);
      state.status = "SCAN_QR";
    });
  } catch (err: any) {
    appendSystemLog(`فشل إعداد الواتساب: ${err.message}`);
  }
}

export function getBotState(): BotState {
  return state;
}

export function setBotStatus(status: BotState["status"], phone?: string) {
  state.status = status;
  if (phone) state.botPhone = phone;
  if (status === "CONNECTED") {
    state.qrCodeDataUrl = null;
  }
}

export function addBotLog(from: string, incomingText: string, replyText: string, matchedRule?: string) {
  state.logs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    from,
    incomingText,
    replyText,
    matchedRule,
  });

  if (state.logs.length > 50) {
    state.logs.pop();
  }
}

export function handleIncomingMessage(fromPhone: string, text: string): { replyText: string; matchedRule?: string } {
  const result = generateAutomatedReply(text);
  if (result.replyText) {
    addBotLog(fromPhone, text, result.replyText, result.matchedRule);
  }
  return result;
}
