import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/prisma";
import { CalendarClock, ChevronRight, Layers } from "lucide-react";
import { formatPrice } from "@/lib/utils";

async function getCollections() {
  try {
    const products = await prisma.product.findMany({
      where: { isPreOrder: true },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    // Group by category (each category = one collection)
    const collectionsMap = new Map<
      string,
      {
        name: string;
        slug: string;
        items: typeof products;
        previewImages: string[];
        minPrice: number;
        maxPrice: number;
      }
    >();

    for (const product of products) {
      const key = product.category;
      if (!collectionsMap.has(key)) {
        collectionsMap.set(key, {
          name: key,
          slug: encodeURIComponent(key),
          items: [],
          previewImages: [],
          minPrice: product.price,
          maxPrice: product.price,
        });
      }
      const col = collectionsMap.get(key)!;
      col.items.push(product);
      if (product.images[0] && col.previewImages.length < 4) {
        col.previewImages.push(product.images[0].url);
      }
      col.minPrice = Math.min(col.minPrice, product.price);
      col.maxPrice = Math.max(col.maxPrice, product.price);
    }

    return Array.from(collectionsMap.values());
  } catch (error) {
    console.error("Failed to fetch collections", error);
    return [];
  }
}

export default async function PreOrderPage() {
  const collections = await getCollections();

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
              Each collection is a curated set of limited-edition pieces.
            </p>
          </div>

          {/* Collections Grid */}
          {collections.length === 0 ? (
            <div className="text-center py-40">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarClock size={32} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                No collections yet
              </h2>
              <p className="text-gray-500">
                Check back soon for exclusive pre-order drops.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collections.map((col) => (
                <Link
                  key={col.name}
                  href={`/pre-order/${col.slug}`}
                  className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-transparent hover:border-amber-300 dark:hover:border-amber-500/40"
                >
                  {/* Image mosaic */}
                  <div className="relative h-72 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    {col.previewImages.length >= 4 ? (
                      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                        {col.previewImages.slice(0, 4).map((img, i) => (
                          <div key={i} className="relative overflow-hidden">
                            <Image
                              src={img}
                              alt={col.name}
                              fill
                              sizes="50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ))}
                      </div>
                    ) : col.previewImages.length >= 2 ? (
                      <div className="grid grid-cols-2 h-full gap-0.5">
                        {col.previewImages.slice(0, 2).map((img, i) => (
                          <div key={i} className="relative overflow-hidden">
                            <Image
                              src={img}
                              alt={col.name}
                              fill
                              sizes="50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ))}
                      </div>
                    ) : col.previewImages.length === 1 ? (
                      <Image
                        src={col.previewImages[0]}
                        alt={col.name}
                        fill
                        sizes="100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Layers size={48} className="text-gray-300" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Pre-order
                      </span>
                    </div>

                    {/* Item count */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full">
                        {col.items.length}{" "}
                        {col.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-outfit font-bold text-2xl group-hover:text-amber-500 transition-colors">
                        {col.name}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        {col.minPrice === col.maxPrice
                          ? formatPrice(col.minPrice)
                          : `${formatPrice(col.minPrice)} – ${formatPrice(col.maxPrice)}`}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors duration-300">
                      <ChevronRight
                        size={22}
                        className="text-amber-500 group-hover:text-white transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
