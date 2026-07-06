"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCurrency, currencies, CurrencyCode } from "@/context/CurrencyContext";
import { ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CurrencySelectorProps {
  className?: string;
  isMobile?: boolean;
}

export default function CurrencySelector({ className = "", isMobile = false }: CurrencySelectorProps) {
  const { currency, setCurrency, currentCurrencyInfo } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className={`space-y-2 px-2 py-3 border-t border-gray-100 dark:border-zinc-800 ${className}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Globe size={14} />
          العملة / Currency
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(currencies) as CurrencyCode[]).map((code) => {
            const info = currencies[code];
            const isSelected = currency === code;
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`py-2.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-primary/50"
                }`}
              >
                <span className="text-lg leading-none">{info.flag}</span>
                <span className="text-xs font-bold font-outfit">{info.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/60 dark:border-zinc-800 rounded-full transition-all duration-300 shadow-sm"
      >
        <span className="text-base leading-none">{currentCurrencyInfo.flag}</span>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 font-outfit">
          {currentCurrencyInfo.code}
        </span>
        <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 dark:border-zinc-800 pl-1.5 rtl:pr-1.5 rtl:pl-0">
          {currentCurrencyInfo.symbol}
        </span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
          >
            {(Object.keys(currencies) as CurrencyCode[]).map((code) => {
              const info = currencies[code];
              const isSelected = currency === code;
              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors text-left text-sm ${
                    isSelected ? "text-primary font-bold bg-primary-light/10 dark:bg-primary-dark/10" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{info.flag}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs font-outfit">{info.code}</span>
                      <span className="text-[10px] text-gray-400">{info.nameAr}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{info.symbol}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
