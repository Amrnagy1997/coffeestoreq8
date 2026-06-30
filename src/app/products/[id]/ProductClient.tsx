"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Check, Heart } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface ProductClientProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    variants: Variant[];
    isPreOrder: boolean;
  };
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? product.variants[0] : null
  );

  // Current displayed image & price depend on selected variant
  const displayImage = selectedVariant
    ? selectedVariant.image
    : product.images[0] || "/placeholder-mug.jpg";
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.price;
  const displayName = selectedVariant
    ? `${product.name} - ${selectedVariant.name}`
    : product.name;

  const handleAdd = () => {
    addToCart({
      id: product._id,
      name: displayName,
      price: displayPrice,
      image: displayImage,
      quantity: 1,
      ...(selectedVariant
        ? { variantId: selectedVariant.id, variantName: selectedVariant.name }
        : {}),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      {/* Image Gallery */}
      <div className="space-y-6">
        <div
          className="relative aspect-square bg-gray-100 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-premium"
          style={{ position: "relative" }}
        >
          <Image
            src={displayImage}
            alt={displayName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-all duration-500"
          />
        </div>

        {/* Thumbnails: show product images + variant images */}
        <div className="grid grid-cols-4 gap-4">
          {/* Main product images */}
          {product.images.map((img: string, i: number) => (
            <button
              key={`img-${i}`}
              type="button"
              onClick={() => setSelectedVariant(null)}
              className={`relative aspect-square bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
                !selectedVariant && displayImage === img
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              }`}
              style={{ position: "relative" }}
            >
              <Image
                src={img}
                alt={`${product.name} ${i}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-8">
        <div>
          <span className="text-primary font-bold text-sm uppercase tracking-widest mb-2 block">
            {product.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-outfit font-bold mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(displayPrice)}
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
          {product.description}
        </p>

        {/* ===== VARIANT SELECTOR ===== */}
        {hasVariants && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">
              Choose Option
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 group ${
                    selectedVariant?.id === variant.id
                      ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "border-gray-200 dark:border-zinc-700 hover:border-primary/50"
                  }`}
                >
                  {/* Variant Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      fill
                      sizes="150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Selected Checkmark */}
                    {selectedVariant?.id === variant.id && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                  {/* Variant Info */}
                  <div className="p-3 bg-white dark:bg-zinc-900 text-left">
                    <p className="font-bold text-sm line-clamp-1">{variant.name}</p>
                    <p className="text-primary font-bold text-sm mt-0.5">
                      {formatPrice(variant.price)}
                    </p>
                    {variant.stock <= 3 && variant.stock > 0 && (
                      <p className="text-[10px] text-amber-500 font-medium mt-1">
                        Only {variant.stock} left
                      </p>
                    )}
                    {variant.stock === 0 && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">
                        Out of stock
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAdd}
              disabled={selectedVariant?.stock === 0}
              className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-premium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {added ? (
                <>
                  <Check size={20} />
                  تمت الإضافة
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  أضف إلى العربة
                </>
              )}
            </button>
            <button className="flex-1 border border-gray-200 dark:border-zinc-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-premium">
              <Heart size={20} />
              Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
