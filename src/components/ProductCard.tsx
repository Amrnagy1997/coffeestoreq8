"use client";

import React from "react";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    isPreOrder: boolean;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Handle both _id (from my mapping) and id (from Prisma default)
  const productId = product._id || (product as any).id;
  const isWishlisted = isInWishlist(productId);

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-premium border border-transparent hover:border-primary-light"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800" style={{ position: 'relative' }}>
        <Link href={`/products/${productId}`}>
          <Image
            src={product.images[0] || "/placeholder-mug.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-premium"
          />
        </Link>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-premium duration-500">
          <button 
            onClick={toggleWishlist}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors",
              isWishlisted ? "bg-primary text-white" : "bg-white dark:bg-zinc-800 hover:text-primary"
            )}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => addToCart({
              id: productId,
              name: product.name,
              price: product.price,
              image: product.images[0],
              quantity: 1
            })}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          {product.isPreOrder && (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-amber-400">
              Pre-order
            </span>
          )}
          <span className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <Link href={`/products/${productId}`}>
          <h3 className="font-outfit font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <p className="text-primary font-bold text-xl">
            {formatPrice(product.price)}
          </p>
          {product.isPreOrder ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-gray-500">Upcoming</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-[10px] font-medium text-gray-500">In Stock</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
