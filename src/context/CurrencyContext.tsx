"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "KWD" | "USD" | "SAR" | "QAR" | "BHD" | "OMR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  nameAr: string;
  nameEn: string;
  rate: number; // 1 KWD = X currency
  decimals: number;
  flag: string;
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  KWD: { code: "KWD", symbol: "د.ك", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar", rate: 1.0, decimals: 3, flag: "🇰🇼" },
  USD: { code: "USD", symbol: "$", nameAr: "دولار أمريكي", nameEn: "US Dollar", rate: 3.26, decimals: 2, flag: "🇺🇸" },
  SAR: { code: "SAR", symbol: "ر.س", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", rate: 12.23, decimals: 2, flag: "🇸🇦" },
  QAR: { code: "QAR", symbol: "ر.ق", nameAr: "ريال قطري", nameEn: "Qatari Riyal", rate: 11.87, decimals: 2, flag: "🇶🇦" },
  BHD: { code: "BHD", symbol: "د.ب", nameAr: "دينار بحريني", nameEn: "Bahraini Dinar", rate: 1.23, decimals: 3, flag: "🇧🇭" },
  OMR: { code: "OMR", symbol: "ر.ع", nameAr: "ريال عماني", nameEn: "Omani Rial", rate: 1.25, decimals: 3, flag: "🇴🇲" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInKwd: number) => string;
  convertPrice: (priceInKwd: number) => number;
  currentCurrencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("KWD");

  useEffect(() => {
    const saved = localStorage.getItem("coffeestore_currency") as CurrencyCode;
    if (saved && currencies[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (currencies[code]) {
      setCurrencyState(code);
      localStorage.setItem("coffeestore_currency", code);
    }
  };

  const convertPrice = (priceInKwd: number): number => {
    const info = currencies[currency];
    return priceInKwd * info.rate;
  };

  const formatPrice = (priceInKwd: number): string => {
    const info = currencies[currency];
    const converted = priceInKwd * info.rate;
    // Format to fixed decimal places
    const formattedVal = converted.toFixed(info.decimals);
    // Return formatted string with symbol, prioritizing Arabic symbol direction
    if (currency === "USD") {
      return `${info.symbol}${formattedVal}`;
    }
    return `${formattedVal} ${info.symbol}`;
  };

  const currentCurrencyInfo = currencies[currency];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentCurrencyInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
