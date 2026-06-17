"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
      {categories.map((cat) => (
        <button 
          key={cat}
          onClick={() => handleCategoryChange(cat)}
          className={`whitespace-nowrap px-6 py-2 rounded-full font-medium text-sm transition-premium ${
            currentCategory === cat
              ? "bg-primary text-white" 
              : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
