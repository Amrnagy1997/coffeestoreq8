import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { notFound } from "next/navigation";

async function getCollectionProducts(slug: string) {
  try {
    const category = decodeURIComponent(slug);
    const products = await prisma.product.findMany({
      where: { isPreOrder: true, category },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      category,
      products: products.map((p) => ({
        ...p,
        _id: p.id,
        images: p.images.map((img) => img.url),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch collection products", error);
    return null;
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const data = await getCollectionProducts(collection);

  if (!data || data.products.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <Link
            href="/pre-order"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            All Pre-order Collections
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Pre-order Collection
              </div>
              <h1 className="text-4xl md:text-5xl font-outfit font-bold">
                {data.category}
              </h1>
              <p className="text-gray-500 mt-2">
                {data.products.length}{" "}
                {data.products.length === 1 ? "exclusive piece" : "exclusive pieces"} available for pre-order
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-5 py-3">
              <CalendarClock size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  Reserve now
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
