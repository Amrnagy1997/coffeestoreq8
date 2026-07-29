/**
 * Meta WhatsApp Cloud API Client & Message Formatter
 */

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppListOption {
  id: string;
  title: string;
  description?: string;
}

export interface BotResponsePayload {
  recipientPhone: string;
  type: "text" | "interactive_buttons" | "interactive_list" | "media";
  text?: string;
  buttons?: WhatsAppButton[];
  listTitle?: string;
  listButtonText?: string;
  sections?: {
    title: string;
    rows: WhatsAppListOption[];
  }[];
  imageUrl?: string;
  rawMetaPayload?: any;
}

/**
 * Send an HTTP request to Meta WhatsApp Cloud API endpoint
 */
export async function sendMetaWhatsAppMessage(payload: BotResponsePayload) {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID || process.env.META_WA_PHONE_ID;

  if (!token || !phoneId) {
    console.log("[WhatsApp Meta Client] Skipping direct Meta API call - WHATSAPP_TOKEN or PHONE_ID not set.");
    return { success: false, error: "Meta credentials missing in env" };
  }

  let body: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: payload.recipientPhone,
  };

  if (payload.type === "text") {
    body.type = "text";
    body.text = { preview_url: true, body: payload.text || "" };
  } else if (payload.type === "interactive_buttons") {
    body.type = "interactive";
    body.interactive = {
      type: "button",
      body: { text: payload.text || "" },
      action: {
        buttons: (payload.buttons || []).map((btn) => ({
          type: "reply",
          reply: {
            id: btn.id,
            title: btn.title.substring(0, 20), // Meta limit 20 chars
          },
        })),
      },
    };
  } else if (payload.type === "interactive_list") {
    body.type = "interactive";
    body.interactive = {
      type: "list",
      header: { type: "text", text: "☕ CoffeeStore" },
      body: { text: payload.text || "" },
      action: {
        button: (payload.listButtonText || "اختر خياراً").substring(0, 20),
        sections: (payload.sections || []).map((sec) => ({
          title: sec.title.substring(0, 24),
          rows: sec.rows.map((r) => ({
            id: r.id,
            title: r.title.substring(0, 24),
            description: r.description ? r.description.substring(0, 72) : undefined,
          })),
        })),
      },
    };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[WhatsApp Meta API Response]:", data);
    return { success: res.ok, data };
  } catch (err: any) {
    console.error("[WhatsApp Meta API Error]:", err);
    return { success: false, error: err.message };
  }
}
