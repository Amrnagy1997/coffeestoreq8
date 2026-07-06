"use client";

import React, { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface PriceTextProps {
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  className?: string;
}

export default function PriceText({ price, minPrice, maxPrice, className = "" }: PriceTextProps) {
  const { formatPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // SSR / Initial client render fallback (base KWD) to match server HTML exactly
    if (price !== undefined) {
      return <span className={className}>{price.toFixed(3)} د.ك</span>;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      if (minPrice === maxPrice) {
        return <span className={className}>{minPrice.toFixed(3)} د.ك</span>;
      }
      return <span className={className}>{minPrice.toFixed(3)} – {maxPrice.toFixed(3)} د.ك</span>;
    }
    return null;
  }

  if (price !== undefined) {
    return <span className={className}>{formatPrice(price)}</span>;
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    if (minPrice === maxPrice) {
      return <span className={className}>{formatPrice(minPrice)}</span>;
    }
    return (
      <span className={className}>
        {formatPrice(minPrice)} – {formatPrice(maxPrice)}
      </span>
    );
  }

  return null;
}
