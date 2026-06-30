import fs from "fs";
import path from "path";

// Programmatic .env loader for Hostinger/production standalone server
if (process.env.NODE_ENV === "production") {
  try {
    let envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) {
      envPath = path.join(process.cwd(), "..", ".env");
    }
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          let val = parts.slice(1).join("=").trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
      console.log("Prisma: Loaded environment variables from .env successfully.");
    }
  } catch (err: any) {
    console.error("Prisma: Error loading .env file:", err.message);
  }
}

import { PrismaClient } from "../generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
