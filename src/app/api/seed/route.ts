import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Clear existing data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});

    const productsData = [
      {
        name: "Japan Sakura Edition 2024",
        description: "A beautiful limited edition item from the 2024 Sakura collection in Japan. Featuring delicate cherry blossom patterns and a soft pink gradient.",
        price: 15.5,
        category: "Limited Edition",
        stock: 5,
        featured: true,
        sku: "SBUX-JP-SK-24",
        isPreOrder: true,
        images: ["https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Classic Green Collection",
        description: "The timeless classic. This item features an iconic logo in high-relief. Perfect for your daily routine.",
        price: 8.5,
        category: "Core Collection",
        stock: 50,
        featured: true,
        sku: "SBUX-CORE-GRN",
        images: ["https://images.unsplash.com/photo-1544787210-2211d40a5146?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Milan Reserve Edition",
        description: "Exclusively from the Milan Reserve. This matte black item with gold accents represents the pinnacle of craftsmanship.",
        price: 22.0,
        category: "Region Specific",
        stock: 3,
        featured: true,
        sku: "SBUX-MILAN-RES",
        isPreOrder: true,
        images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop"],
      },
      {
        name: "Holiday 2025 Edition",
        description: "Celebrate the festive season with our 2025 Holiday edition. A collector favorite every year.",
        price: 12.0,
        category: "Seasonal",
        stock: 20,
        featured: true,
        sku: "SBUX-HOL-25",
        images: ["https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=1000&auto=format&fit=crop"],
      },
    ];

    for (const item of productsData) {
      const { images, ...data } = item;
      await prisma.product.create({
        data: {
          ...data,
          images: {
            create: images.map(url => ({ url }))
          }
        }
      });
    }

    // Create Admin User if not exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@coffeestoreq8.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12);
      await prisma.user.create({
        data: {
          name: "Admin User",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        },
      });
    }

    return NextResponse.json({ message: "Seeded successfully" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
