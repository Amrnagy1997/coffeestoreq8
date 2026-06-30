"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-premium shadow-lg shadow-primary/20 ${
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
  );
}
