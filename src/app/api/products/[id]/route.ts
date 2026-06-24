import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...product,
      images: product.images.map((img) => img.url),
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { images, ...body } = await req.json();

    // Delete old images and create new ones
    await prisma.productImage.deleteMany({ where: { productId: id } });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        images: {
          create: images.map((url: string) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: error.message || "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: error.message || "Error deleting product" },
      { status: 500 }
    );
  }
}
