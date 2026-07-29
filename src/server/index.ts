import express from "express";
import cors from "cors";
import path from "path";
import { getBotConfig, saveBotConfig } from "../bot/configManager";
import { getBotState, initWhatsAppWebClient, handleIncomingMessage, setBotStatus } from "../bot/whatsappClient";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve Static Control Dashboard UI
app.use(express.static(path.join(__dirname, "..", "public")));

// Initialize Real WhatsApp Client Engine
initWhatsAppWebClient();

// API: Get Bot Status & Logs
app.get("/api/status", async (req, res) => {
  const currentState = getBotState();
  res.json({
    success: true,
    state: currentState,
  });
});


// API: Toggle Connect Status (for simulation)
app.post("/api/status/toggle", (req, res) => {
  const currentState = getBotState();
  if (currentState.status === "CONNECTED") {
    setBotStatus("SCAN_QR");
  } else {
    setBotStatus("CONNECTED", "+965 9000 1122 (واتساب الأعمال)");
  }
  res.json({ success: true, state: getBotState() });
});


// API: Get Bot Configuration
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    config: getBotConfig(),
  });
});

// API: Update Bot Configuration
app.post("/api/config", (req, res) => {
  const updated = saveBotConfig(req.body);
  res.json({
    success: true,
    config: updated,
  });
});

// API: Add Custom Response Rule
app.post("/api/config/rules", (req, res) => {
  const { keyword, response } = req.body;
  if (!keyword || !response) {
    return res.status(400).json({ success: false, error: "Keyword and response are required" });
  }

  const current = getBotConfig();
  const newRule = {
    id: `rule_${Date.now()}`,
    keyword,
    response,
  };
  current.customResponses.push(newRule);
  const updated = saveBotConfig({ customResponses: current.customResponses });

  res.json({
    success: true,
    config: updated,
  });
});

// API: Delete Custom Response Rule
app.delete("/api/config/rules/:id", (req, res) => {
  const { id } = req.params;
  const current = getBotConfig();
  const filtered = current.customResponses.filter((r) => r.id !== id);
  const updated = saveBotConfig({ customResponses: filtered });

  res.json({
    success: true,
    config: updated,
  });
});

// API: Simulate Chat Message
app.post("/api/simulate-chat", (req, res) => {
  const { phone = "+965 9988 7766", message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  const result = handleIncomingMessage(phone, message);
  res.json({
    success: true,
    incoming: message,
    reply: result.replyText,
    matchedRule: result.matchedRule,
  });
});

// Fallback to index.html for dashboard
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CoffeeStore WhatsApp Bot Microservice Started!`);
  console.log(`🌐 Control Dashboard URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
