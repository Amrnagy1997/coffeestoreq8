import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { SlidersHorizontal } from "lucide-react";
import SearchInput from "./SearchInput";
import CategoryFilter from "./CategoryFilter";
import ProductTypeFilter from "./ProductTypeFilter";
import { Suspense } from "react";

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
    const type = typeof searchParams.type === 'string' ? searchParams.type : 'in-stock';

    const where: any = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (q) {
      where.name = { contains: q };
    }
    
    // Filter by type
    where.isPreOrder = type === 'pre-order';

    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      _id: p.id,
      images: p.images.map((img) => img.url),
    }));
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const products = await getProducts(resolvedSearchParams);
  const categories = ["All", "Limited Edition", "Seasonal", "Core Collection", "Region Specific"];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl font-outfit font-bold mb-4">
                {resolvedSearchParams.type === 'pre-order' ? 'Pre-order Collection' : 'In Stock Collection'}
              </h1>
              <p className="text-gray-500">
                {resolvedSearchParams.type === 'pre-order' 
                  ? 'Reserve the most exclusive upcoming releases.' 
                  : 'Browse through our premium items available for immediate delivery.'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Suspense fallback={<div className="w-64 h-12 bg-gray-100 rounded-2xl animate-pulse" />}>
                <SearchInput />
              </Suspense>
              <button className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-5 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Type Toggle & Categories Bar */}
          <div className="flex flex-col gap-2">
            <Suspense fallback={<div className="w-48 h-12 bg-gray-100 rounded-2xl animate-pulse mb-8" />}>
              <ProductTypeFilter />
            </Suspense>
            
            <Suspense fallback={<div className="flex gap-2 overflow-x-auto pb-4 mb-10"><div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" /></div>}>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40">
              <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <SlidersHorizontal size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
