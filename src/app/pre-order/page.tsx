import React from "react";
export const dynamic = "force-dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/prisma";
import { CalendarClock } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

async function getPreOrderProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isPreOrder: true },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      _id: p.id,
      images: p.images.map((img) => img.url),
    }));
  } catch (error) {
    console.error("Failed to fetch pre-order products", error);
    return [];
  }
}

export default async function PreOrderPage() {
  const products = await getPreOrderProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Exclusive Pre-order
            </div>
            <h1 className="text-5xl font-outfit font-bold mb-4">
              Pre-order{" "}
              <span className="text-amber-500">Collections</span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Reserve the most exclusive upcoming releases before they sell out.
              Explore our limited-edition pieces.
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-40">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarClock size={32} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                No items available
              </h2>
              <p className="text-gray-500">
                Check back soon for exclusive pre-order drops.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
