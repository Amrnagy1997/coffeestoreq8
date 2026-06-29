import React from "react";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/prisma";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import ProductClient from "./ProductClient";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });
    
    if (!product) return null;

    return {
      ...product,
      _id: product.id,
      images: product.images.map((img) => img.url),
    };
  } catch (error) {
    console.error("Failed to fetch product", error);
    return null;
  }
}

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <a href="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Back to Shop</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ProductClient product={product} />

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 mt-16 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <Truck size={20} className="text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">Secure Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <RotateCcw size={20} className="text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">7 Day Returns</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
