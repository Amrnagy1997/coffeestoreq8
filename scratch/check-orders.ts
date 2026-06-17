import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const orders = await prisma.order.findMany({
    include: { items: true }
  });
  console.log("Total orders:", orders.length);
  console.log(JSON.stringify(orders, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
