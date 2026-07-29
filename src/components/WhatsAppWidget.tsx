"use client";

import React, { useState } from "react";
import { MessageSquare, Bot, X, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start font-sans">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-[#111b21] border border-[#202c33] rounded-2xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#202c33]">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center font-bold text-sm">
                ☕
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">بوت CoffeeStore التفاعلي</h4>
                <p className="text-[11px] text-emerald-400">متصل الآن ⚡</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 my-3 leading-relaxed">
            أهلاً بك! يمكنك تصفح المنيو، طلب منتجاتك، ومتابعة حالة الطلب فورياً عبر الواتساب التفاعلي الذكي 💬☕
          </p>

          <div className="space-y-2">
            <Link
              href="/whatsapp-bot"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Bot className="w-4 h-4" /> تجربة البوت التفاعلي الآن
            </Link>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-[#25d366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        title="تحدث مع بوت الواتساب"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white animate-ping" />
        <MessageSquare className="w-6 h-6 fill-current" />
      </button>
    </div>
  );
}
