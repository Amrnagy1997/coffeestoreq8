import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-premium" style={{ position: 'relative' }}>
                <Image 
                  src={product.images[0] || "/placeholder-mug.jpg"} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors" style={{ position: 'relative' }}>
                    <Image src={img} alt={`${product.name} ${i}`} fill sizes="100px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <span className="text-primary font-bold text-sm uppercase tracking-widest mb-2 block">{product.category}</span>
                <h1 className="text-4xl md:text-5xl font-outfit font-bold mb-4">{product.name}</h1>
                <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {product.description}
              </p>

              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row gap-4">
                   <AddToCartButton product={product} />
                   <button className="flex-1 border border-gray-200 dark:border-zinc-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-premium">
                     <Heart size={20} />
                     Wishlist
                   </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
