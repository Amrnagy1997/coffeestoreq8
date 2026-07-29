import { NextRequest, NextResponse } from "next/server";
import { processWhatsAppIncomingMessage } from "@/lib/whatsapp/botEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone = "96590001122", text = "", buttonPayload = "" } = body;

    console.log(`[WhatsApp Simulator Request] Phone: ${phone}, Text: "${text}", Payload: "${buttonPayload}"`);

    const replyPayload = await processWhatsAppIncomingMessage(phone, text, buttonPayload);

    return NextResponse.json({
      success: true,
      botResponse: replyPayload,
    });
  } catch (err: any) {
    console.error("[WhatsApp Simulator Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process simulator message" },
      { status: 500 }
    );
  }
}
