import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const where: any = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (q) {
      where.name = { contains: q }; // Prisma uses 'contains' for regex-like search
    }

    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    // Flatten images for consistency with frontend
    const formattedProducts = products.map((p) => ({
      ...p,
      images: p.images.map((img) => img.url),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "admin") {
      // return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { images, ...body } = await req.json();

    const newProduct = await prisma.product.create({
      data: {
        ...body,
        images: {
          create: images.map((url: string) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: error.message || "Error creating product" }, { status: 500 });
  }
}
