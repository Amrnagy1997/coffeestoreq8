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
  logs: [],
};

const pausedChats = new Map<string, number>();
let waClient: Client | null = null;

/**
 * Ensure QR code data URL is updated with latest raw QR text
 */
export async function ensureQrCodeDataUrl(): Promise<string> {
  if (state.rawQrText) {
    try {
      state.qrCodeDataUrl = await QRCode.toDataURL(state.rawQrText, { width: 320, margin: 2 });
    } catch (e) {
      console.error("[WhatsApp Client] Error rendering QR data URL:", e);
    }
  }
  return state.qrCodeDataUrl || "";
}

/**
 * Request an 8-character Pairing Code for Linking with Phone Number
 */
export async function requestPairingCode(phoneNumber: string): Promise<string> {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  if (!waClient) {
    throw new Error("سيرفر الواتساب قيد التهيئة، يرجى المحاولة بعد قليل.");
  }
  try {
    const code = await (waClient as any).requestPairingCode(cleanPhone);
    state.pairingCode = code;
    console.log(`[WhatsApp Client] Pairing Code generated for ${cleanPhone}: ${code}`);
    return code;
  } catch (err: any) {
    console.error("[WhatsApp Client] Error requesting pairing code:", err);
    throw new Error(err.message || "تعذر توليد كود الاقتران حالياً.");
  }
}

/**
 * Initialize Real WhatsApp Web Client via Puppeteer
 */
export async function initWhatsAppWebClient() {
  console.log("[WhatsApp Client] Starting real WhatsApp Web engine...");
  state.status = "INITIALIZING";

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
        console.log(`[WhatsApp Client] Found browser executable at: ${p}`);
        break;
      }
    }
  } else {
    console.log(`[WhatsApp Client] Using PUPPETEER_EXECUTABLE_PATH: ${executablePath}`);
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
        ],
      },
    });

    // Event: Live QR Code received
    waClient.on("qr", async (qr) => {
      console.log("[WhatsApp Client] Live REAL QR Code received from WhatsApp servers!");
      state.rawQrText = qr;
      state.status = "SCAN_QR";
      try {
        state.qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 2 });
      } catch (err) {
        console.error("[WhatsApp Client] Failed to generate QR data URL:", err);
      }
    });

    // Event: Authenticated & Connected
    waClient.on("ready", () => {
      console.log("[WhatsApp Client] WhatsApp Web connected successfully!");
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
      console.log("[WhatsApp Client] Session authenticated!");
    });

    waClient.on("auth_failure", (msg) => {
      console.error("[WhatsApp Client] Auth failure:", msg);
      state.status = "SCAN_QR";
    });

    waClient.on("disconnected", (reason) => {
      console.log("[WhatsApp Client] Disconnected:", reason);
      state.status = "DISCONNECTED";
      state.botPhone = null;
    });

    // Event: Human Agent Takeover Listener
    waClient.on("message_create", async (msg) => {
      if (msg.fromMe && !msg.to.includes("@g.us")) {
        const targetPhone = msg.to.replace("@c.us", "").replace(/[^0-9]/g, "");
        if (targetPhone) {
          pausedChats.set(targetPhone, Date.now());
          state.pausedChatsCount = pausedChats.size;
          console.log(`[Human Agent Takeover] Agent sent message to: ${targetPhone}. Auto-reply paused.`);
        }
      }
    });

    // Event: Incoming Customer Message Listener
    waClient.on("message", async (msg) => {
      if (msg.from.includes("@g.us") || msg.from.includes("status")) return;

      const fromPhone = msg.from.replace("@c.us", "").replace(/[^0-9]/g, "");
      const incomingText = (msg.body || "").trim();

      console.log(`[WhatsApp Incoming Msg] From: ${fromPhone}, Text: "${incomingText}"`);

      const pausedTime = pausedChats.get(fromPhone);
      const isUnpauseCommand =
        incomingText.toLowerCase() === "البوت" ||
        incomingText.toLowerCase() === "تفعيل البوت" ||
        incomingText.toLowerCase() === "start";

      if (pausedTime && !isUnpauseCommand) {
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        if (Date.now() - pausedTime < twelveHoursInMs) {
          console.log(`[WhatsApp Auto-Reply Skipped] Chat with ${fromPhone} is paused for human agent conversation.`);
          return;
        } else {
          pausedChats.delete(fromPhone);
          state.pausedChatsCount = pausedChats.size;
        }
      }

      if (isUnpauseCommand && pausedTime) {
        pausedChats.delete(fromPhone);
        state.pausedChatsCount = pausedChats.size;
        console.log(`[WhatsApp Auto-Reply Resumed] Customer ${fromPhone} requested bot activation.`);
      }

      const hasPhotoOrMedia = Boolean(msg.hasMedia);
      const result = generateAutomatedReply(incomingText, hasPhotoOrMedia);

      if (result.replyText) {
        try {
          await msg.reply(result.replyText);
          addBotLog(fromPhone, incomingText, result.replyText, result.matchedRule);
          console.log(`[WhatsApp Reply Sent] To: ${fromPhone}`);
        } catch (sendErr) {
          console.error("[WhatsApp Send Reply Error]:", sendErr);
        }
      }
    });

    waClient.initialize().catch((err) => {
      console.error("[WhatsApp Client Initialize Error]:", err);
      state.status = "SCAN_QR";
    });
  } catch (err: any) {
    console.error("[WhatsApp Client Setup Failed]:", err);
  }
}

export function unpauseChat(phone: string) {
  const clean = phone.replace(/[^0-9]/g, "");
  pausedChats.delete(clean);
  state.pausedChatsCount = pausedChats.size;
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
