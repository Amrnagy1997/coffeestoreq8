import fs from "fs";
import path from "path";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CustomRule {
  id: string;
  keyword: string;
  response: string;
}

export interface BotConfig {
  botName: string;
  botActive: boolean;
  autoWelcomeText: string;
  howToOrderText?: string;
  menuLinkText?: string;
  workingHours?: string;
  location?: string;
  paymentAndShipping: string;
  gccShippingText?: string;
  menu: MenuItem[];
  customResponses: CustomRule[];
}

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

export function getBotConfig(): BotConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    }
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("[ConfigManager] Error reading config.json:", e);
    return {
      botName: "CoffeeStore Bot ☕",
      botActive: true,
      autoWelcomeText: "أهلاً بك في CoffeeStore ☕",
      paymentAndShipping: "💳 طرق الدفع: رابط دفع (ومض / KNET) - 🚚 التوصيل: 2 دينار لأي مكان بالكويت",
      menu: [],
      customResponses: [],
    };
  }
}

export function saveBotConfig(newConfig: Partial<BotConfig>): BotConfig {
  const current = getBotConfig();
  const updated = { ...current, ...newConfig };
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    console.log("[ConfigManager] Config updated successfully.");
  } catch (e) {
    console.error("[ConfigManager] Error saving config.json:", e);
  }
  return updated;
}
