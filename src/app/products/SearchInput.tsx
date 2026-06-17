"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input 
        type="text" 
        placeholder="Search mugs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-gray-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-12 pr-4 w-full md:w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
      />
    </div>
  );
}
