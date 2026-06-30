"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isPreOrder: boolean;
}

export default function CollectionListClient({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const handleAdd = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    });
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {products.map((product, idx) => {
        const productId = product.id;
        const isWishlisted = isInWishlist(productId);
        const isAdded = addedItems[productId] || false;

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
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="group flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-premium hover:shadow-premium-hover transition-premium"
          >
            {/* Image */}
            <div className="relative w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0">
              <Link href={`/products/${productId}`}>
                <Image
                  src={product.images[0] || "/placeholder-mug.jpg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 250px"
                  className="object-cover group-hover:scale-105 transition-premium"
                />
              </Link>

              {/* Wishlist Button (mobile overlay) */}
              <button
                onClick={toggleWishlist}
                className={cn(
                  "absolute top-4 right-4 md:hidden w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-white dark:bg-zinc-800 transition-colors",
                  isWishlisted ? "text-primary" : "text-gray-400 hover:text-primary"
                )}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 py-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {product.isPreOrder && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        Pre-order
                      </span>
                    )}
                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist Button (desktop side-aligned) */}
                  <button
                    onClick={toggleWishlist}
                    className={cn(
                      "hidden md:flex w-10 h-10 rounded-full items-center justify-center border border-gray-100 dark:border-zinc-800 hover:border-primary-light transition-colors",
                      isWishlisted ? "bg-primary-light text-primary border-primary-light" : "text-gray-400 hover:text-primary"
                    )}
                  >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                <Link href={`/products/${productId}`}>
                  <h3 className="font-outfit font-bold text-xl md:text-2xl group-hover:text-primary transition-colors leading-snug">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Add to Cart */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/50">
                <span className="text-primary font-bold text-2xl">
                  {formatPrice(product.price)}
                </span>

                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-premium shadow-md shadow-primary/10",
                    isAdded 
                      ? "bg-green-500 text-white" 
                      : "bg-primary hover:bg-primary-dark text-white"
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      تمت الإضافة
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      أضف إلى العربة
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
