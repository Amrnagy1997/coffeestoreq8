import { PrismaClient } from "../src/generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";
import * as mariadb from "mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@coffeestoreq8.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin created:", admin.email);

  // 2. Create Products
  const products = [
    {
      name: "Limited Edition Cherry Blossom Mug",
      description: "Beautiful limited edition mug featuring authentic Japanese cherry blossom design. 12oz capacity.",
      price: 15.0,
      category: "Limited Edition",
      featured: true,
      stock: 50,
      sku: "MUG-JP-CHERRY",
      isPreOrder: true,
      images: ["/uploads/cherry_blossom.png"],
    },
    {
      name: "Matte Black Siren Mug",
      description: "Sleek matte black finish with iconic embossed logo. Professional and stylish.",
      price: 12.0,
      category: "Classic",
      featured: true,
      stock: 100,
      sku: "MUG-CL-BLACK",
      images: ["/uploads/matte_black.png"],
    },
    {
      name: "Iridescent Unicorn Tumbler",
      description: "Stunning iridescent finish that changes color with light. Perfect for cold drinks and collectors.",
      price: 25.0,
      category: "Tumblers",
      featured: true,
      stock: 30,
      sku: "TUM-UN-IRID",
      isPreOrder: true,
      images: ["/uploads/unicorn_tumbler.png"],
    },
    {
      name: "Korea Seoul City Mug",
      description: "Part of the City Collection. Features the beautiful Seoul skyline and traditional architecture.",
      price: 18.0,
      category: "Global Collection",
      featured: true,
      stock: 20,
      sku: "MUG-KR-SEOUL",
      images: ["/uploads/cherry_blossom.png"],
    },
    {
      name: "Copper Stainless Steel Mug",
      description: "Vacuum insulated double wall stainless steel. Keeps your coffee hot for hours. Copper finish.",
      price: 22.0,
      category: "Stainless Steel",
      featured: false,
      stock: 45,
      sku: "MUG-SS-COPPER",
      images: ["/uploads/matte_black.png"],
    },
  ];

  for (const product of products) {
    const { images, ...productData } = product;
    
    const existingProduct = await prisma.product.findUnique({
      where: { sku: product.sku },
      include: { images: true }
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: productData
      });
      
      await prisma.productImage.deleteMany({
        where: { productId: existingProduct.id }
      });
      
      await prisma.productImage.createMany({
        data: images.map(url => ({ url, productId: existingProduct.id }))
      });
    } else {
      await prisma.product.create({
        data: {
          ...productData,
          images: {
            create: images.map((url) => ({ url })),
          },
        },
      });
    }
  }

  console.log("Products seeded successfully with local images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
