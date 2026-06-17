"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, CalendarClock } from "lucide-react";

export default function ProductTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "in-stock";

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl mb-8 w-fit mx-auto md:mx-0">
      <button
        onClick={() => handleTypeChange("in-stock")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-premium ${
          currentType === "in-stock"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-primary"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        <Package size={18} />
        In Stock
      </button>
      <button
        onClick={() => handleTypeChange("pre-order")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-premium ${
          currentType === "pre-order"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-amber-500"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        <CalendarClock size={18} />
        Pre-order
      </button>
    </div>
  );
}
