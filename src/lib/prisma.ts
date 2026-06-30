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

  // Programmatic persistent uploads symlink creation (run only at runtime in nodejs folder)
  const isHostingerRuntime = process.cwd().endsWith("nodejs");
  if (isHostingerRuntime) {
    try {
      const targetDir = "/home/u487607181/domains/coffeestoreq8.com/public_html/uploads";
      const symlinkPath = "/home/u487607181/domains/coffeestoreq8.com/nodejs/public/uploads";

      let needsSymlink = false;
      try {
        const lstat = fs.lstatSync(symlinkPath);
        if (!lstat.isSymbolicLink()) {
          needsSymlink = true;
          if (lstat.isDirectory()) {
            // Copy any new uploads to targetDir before removing the folder
            const files = fs.readdirSync(symlinkPath);
            files.forEach(file => {
              const src = path.join(symlinkPath, file);
              const dest = path.join(targetDir, file);
              if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                console.log(`Prisma: Migrated local file to persistent uploads: ${file}`);
              }
            });
            fs.rmSync(symlinkPath, { recursive: true, force: true });
          }
        }
      } catch (e) {
        needsSymlink = true;
      }

      if (needsSymlink) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const symlinkParent = path.dirname(symlinkPath);
        if (!fs.existsSync(symlinkParent)) {
          fs.mkdirSync(symlinkParent, { recursive: true });
        }
        fs.symlinkSync(targetDir, symlinkPath, "dir");
        console.log("Prisma: Created symbolic link for persistent uploads successfully.");
      }
    } catch (err: any) {
      console.error("Prisma: Error setting up persistent uploads symlink:", err.message);
    }
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
