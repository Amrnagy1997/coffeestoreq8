"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ShoppingCart, Check, Heart, Minus, Plus } from "lucide-react";

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
    stock: number;
  };
}
export default function ProductClient({ product }: ProductClientProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 when selected variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

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
    const finalQty = Math.min(quantity, maxStock);
    if (finalQty <= 0) return;

    addToCart({
      id: product._id,
      name: displayName,
      price: displayPrice,
      image: displayImage,
      quantity: finalQty,
      stock: maxStock ?? 999,
      isPreOrder: product.isPreOrder,
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
          {product.isPreOrder && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>طلب مسبق: يصل هذا المنتج خلال 2 - 3 أسابيع</span>
            </div>
          )}
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
                    <p className="font-bold text-sm leading-tight">{variant.name}</p>
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Quantity Selector */}
            {maxStock > 0 && (
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl border border-gray-200/40 dark:border-zinc-700 shadow-sm shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="p-1 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-base w-6 text-center select-none">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.min(maxStock, prev + 1))}
                  disabled={quantity >= maxStock}
                  className="p-1 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={maxStock === 0}
              className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-premium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
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
              ) : maxStock === 0 ? (
                <>
                  نفذت الكمية
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  أضف إلى العربة
                </>
              )}
            </button>
            <button className="flex-1 border border-gray-200 dark:border-zinc-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-premium w-full sm:w-auto">
              <Heart size={20} />
              Wishlist
            </button>
          </div>
          {quantity >= maxStock && maxStock > 0 && (
            <p className="text-xs text-amber-500 font-bold mt-2 text-left select-none">
              لقد وصلت للحد الأقصى المتاح في الاستوك ({maxStock})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
