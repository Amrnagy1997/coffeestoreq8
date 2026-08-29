import fs from "fs";
import path from "path";

// Programmatic .env loader for Hostinger/production standalone server
if (typeof process !== "undefined" && process.env) {
  try {
    const candidatePaths = [
      path.join(process.cwd(), ".env"),
      path.join(process.cwd(), "..", ".env"),
      path.join(__dirname, "..", "..", "..", ".env"),
      "/home/u487607181/domains/coffeestoreq8.com/nodejs/.env",
      "/home/u487607181/domains/coffeestoreq8.com/hbuilds/versions/01a04d35-fd66-70ca-a922-b4339418f8fa/nodejs/.env"
    ];

    for (const envPath of candidatePaths) {
      if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        envConfig.split("\n").forEach((line) => {
          const parts = line.split("=");
          if (parts.length >= 2) {
            const key = parts[0].trim();
            let val = parts.slice(1).join("=").trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
          }
        });
      }
    }
  } catch (err: any) {
    console.error("Prisma: Error loading .env file:", err.message);
  }
}

import { PrismaClient } from "../generated/prisma";

const databaseUrl =
  process.env.DATABASE_URL ||
  "mysql://u487607181_coffeestore:Amrnagy4626313@127.0.0.1:3306/u487607181_coffeestoreq8";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
