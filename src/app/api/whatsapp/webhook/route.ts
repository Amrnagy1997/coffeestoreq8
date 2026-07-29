import { NextRequest, NextResponse } from "next/server";
import { processWhatsAppIncomingMessage } from "@/lib/whatsapp/botEngine";
import { sendMetaWhatsAppMessage } from "@/lib/whatsapp/metaClient";

/**
 * GET Handler for Meta Webhook Verification
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.META_WA_VERIFY_TOKEN || "coffeestore_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("[WhatsApp Webhook] Verification failed token mismatch.");
    return new NextResponse("Forbidden", { status: 403 });
  }
}

/**
 * POST Handler for Incoming WhatsApp Messages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp Webhook Payload Received]:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages && value.messages.length > 0) {
      const msg = value.messages[0];
      const fromPhone = msg.from; // Customer phone number

      let incomingText = "";
      let buttonPayload = "";

      if (msg.type === "text") {
        incomingText = msg.text?.body || "";
      } else if (msg.type === "interactive") {
        if (msg.interactive.type === "button_reply") {
          buttonPayload = msg.interactive.button_reply?.id || "";
          incomingText = msg.interactive.button_reply?.title || "";
        } else if (msg.interactive.type === "list_reply") {
          buttonPayload = msg.interactive.list_reply?.id || "";
          incomingText = msg.interactive.list_reply?.title || "";
        }
      } else if (msg.type === "button") {
        buttonPayload = msg.button?.payload || "";
        incomingText = msg.button?.text || "";
      }

      // Process message through Bot Engine
      const replyPayload = await processWhatsAppIncomingMessage(fromPhone, incomingText, buttonPayload);

      // Send Response back via Meta WhatsApp Cloud API
      await sendMetaWhatsAppMessage(replyPayload);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
