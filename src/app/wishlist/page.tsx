"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h1 className="text-4xl font-outfit font-bold">My Wishlist</h1>
            <div className="bg-primary-light text-primary px-3 py-1 rounded-full text-sm font-bold">
              {wishlist.length} Items
            </div>
          </div>
          
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlist.map((item) => (
                <ProductCard 
                  key={item.id} 
                  product={{
                    _id: item.id,
                    name: item.name,
                    price: item.price,
                    images: [item.image],
                    category: "Saved"
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white dark:bg-zinc-900 rounded-3xl shadow-premium border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Heart size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-8">Save your favorite mugs here to buy them later.</p>
              <Link href="/products" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-premium inline-block">
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
