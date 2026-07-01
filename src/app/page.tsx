import React from "react";
import Image from "next/image";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, ShieldCheck, Truck, Coffee } from "lucide-react";
import prisma from "@/lib/prisma";

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: { images: true },
      take: 4,
    });
    
    return products.map((p) => ({
      ...p,
      _id: p.id,
      images: p.images.map((img) => img.url),
    }));
  } catch (error) {
    console.error("Failed to fetch featured products", error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-primary-light/30 dark:bg-primary-dark/20 z-0" />
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] z-0 animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] z-0" />
          
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">New Collection 2026</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-outfit font-bold leading-tight">
                Elevate Your <br />
                <span className="text-primary italic">Coffee Ritual</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Discover our curated collection of authentic, premium products sourced from exclusive locations worldwide. Quality for the ultimate collector.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/products" 
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 group"
                >
                  In Stock
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/pre-order" 
                  className="bg-transparent border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-premium group"
                >
                  Pre-Order
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-square w-full max-w-[500px] mx-auto lg:mx-0">
               <div className="absolute inset-0 bg-primary/20 rounded-[20%] rotate-6 scale-95 z-0" />
               <div className="absolute inset-0 rounded-[20%] -rotate-3 shadow-2xl z-10 overflow-hidden border border-primary/10">
                 <Image
                   src="/hero-mugs.jpg"
                   alt="Premium Coffee Store Q8 Mug Collection"
                   fill
                   sizes="(max-width: 1024px) 100vw, 500px"
                   className="object-cover"
                   priority
                 />
               </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Authentic Products</h3>
                <p className="text-sm text-gray-500">Every item is 100% authentic merchandise, sourced directly from verified suppliers.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center shrink-0">
                <Truck className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Fast Shipping</h3>
                <p className="text-sm text-gray-500">Secure packaging and fast delivery across Kuwait and worldwide.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center shrink-0">
                <Coffee className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Premium Quality</h3>
                <p className="text-sm text-gray-500">We inspect every single item to ensure it meets our high standards for collectors.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 px-6 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-outfit font-bold mb-4">Featured Collection</h2>
                <p className="text-gray-500">Hand-picked selections for the ultimate collector.</p>
              </div>
              <Link href="/products" className="text-primary font-bold flex items-center gap-2 hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700">
                <p className="text-gray-500 mb-4">No featured products yet.</p>
                <Link href="/admin/add-product" className="text-primary font-bold">Add some products in the Admin Dashboard</Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
