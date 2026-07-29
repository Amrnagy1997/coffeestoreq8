"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, RefreshCw, ShoppingBag, ArrowLeft, Check, CheckCheck, PhoneCall, Store, Info, Bot } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  timestamp: string;
  payload: {
    type: "text" | "interactive_buttons" | "interactive_list";
    text?: string;
    buttons?: { id: string; title: string }[];
    listTitle?: string;
    listButtonText?: string;
    sections?: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
  };
}

export default function WhatsAppBotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userPhone, setUserPhone] = useState("96590001122");
  const [showListModal, setShowListModal] = useState(false);
  const [activeListSection, setActiveListSection] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message
  useEffect(() => {
    handleSendMessage("مرحبا", "BTN_MAIN_MENU");
  }, []);

  const handleSendMessage = async (textToSend: string, buttonPayload?: string) => {
    if (!textToSend.trim() && !buttonPayload) return;

    const userMsgId = Date.now().toString();
    const timeStr = new Date().toLocaleTimeString("ar-KW", { hour: "2-digit", minute: "2-digit" });

    // Append User Message to UI (unless it's auto-init)
    if (messages.length > 0 || textToSend !== "مرحبا") {
      const userMessage: ChatMessage = {
        id: userMsgId,
        sender: "user",
        timestamp: timeStr,
        payload: {
          type: "text",
          text: textToSend,
        },
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/whatsapp/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userPhone,
          text: textToSend,
          buttonPayload: buttonPayload || undefined,
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success && data.botResponse) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("ar-KW", { hour: "2-digit", minute: "2-digit" }),
          payload: data.botResponse,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: timeStr,
          payload: {
            type: "text",
            text: "❌ عذراً، تعذر الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.",
          },
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      console.error("Error sending message:", error);
    }
  };

  const resetChat = () => {
    setMessages([]);
    handleSendMessage("إلغاء", "BTN_RESTART");
  };

  return (
    <div className="min-h-screen bg-[#090e11] text-gray-100 flex flex-col justify-between font-sans">
      {/* Top Header Nav */}
      <header className="bg-[#111b21] border-b border-[#222d34] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-[#202c33] text-gray-300 transition"
            title="العودة للموقع الرئيسي"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-500 flex items-center justify-center text-white font-bold shadow">
              ☕
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111b21]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <h1 className="font-semibold text-white text-base">CoffeeStore WhatsApp Bot</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> موثق
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              {isTyping ? "يكتب الآن..." : "متصل الآن - رد آلي تفاعلي 24/7"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-xs text-amber-400 border border-amber-500/30 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> إعادة المحادثة
          </button>
          <Link
            href="/admin/orders"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs text-white transition font-medium"
          >
            <Store className="w-3.5 h-3.5" /> لوحة الطلبات
          </Link>
        </div>
      </header>

      {/* Main WhatsApp Chat Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Chat Messages Area */}
        <div className="flex-1 bg-[#0b141a] rounded-2xl p-4 sm:p-6 overflow-y-auto border border-[#1f2c34] space-y-4 min-h-[500px] max-h-[72vh] shadow-2xl relative bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Welcome Info Banner */}
          <div className="bg-[#182229] border border-amber-500/20 rounded-xl p-3 text-center text-xs text-amber-200/90 max-w-lg mx-auto mb-4 shadow">
            💡 **محاكي محادثة الواتساب التفاعلي لـ CoffeeStore**: يمكنك تجربة طلب المنتجات، تصفح المنيو، وإجراء الشراء الحقيقي واختبار حالة الطلبات كأنك تستخدم الواتساب تماماً!
          </div>

          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? "items-start" : "items-end"} mb-3`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm shadow-md relative group transition ${
                    isBot
                      ? "bg-[#202c33] text-gray-100 rounded-tr-none border border-[#2a3942]"
                      : "bg-[#005c4b] text-white rounded-tl-none"
                  }`}
                >
                  {/* Sender Name tag for bot */}
                  {isBot && (
                    <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> CoffeeStore Bot
                    </div>
                  )}

                  {/* Main Text formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.payload.text}
                  </div>

                  {/* Interactive Quick Reply Buttons */}
                  {msg.payload.buttons && msg.payload.buttons.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                      {msg.payload.buttons.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => handleSendMessage(btn.title, btn.id)}
                          className="w-full sm:w-auto flex-1 bg-[#111b21] hover:bg-[#00a884] hover:text-black text-emerald-400 text-xs font-semibold py-2 px-3 rounded-xl border border-emerald-500/30 transition text-center shadow-sm"
                        >
                          {btn.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Interactive List Selection Button */}
                  {msg.payload.sections && msg.payload.sections.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setActiveListSection(msg.payload);
                          setShowListModal(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {msg.payload.listButtonText || "☕ تصفح واكتشف المنتجات"}
                      </button>
                    </div>
                  )}

                  {/* Message Timestamp */}
                  <div className="text-[10px] text-gray-400 text-left mt-1.5 flex items-center justify-end gap-1">
                    <span>{msg.timestamp}</span>
                    {!isBot && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-400 bg-[#202c33] py-2 px-4 rounded-2xl w-fit border border-[#2a3942]">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="mr-1 text-emerald-400 font-medium">CoffeeStore يكتب الآن...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="mt-3 bg-[#111b21] border border-[#202c33] rounded-2xl p-2 flex items-center gap-2 shadow-xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالة هنا... (مثلاً: المنيو، سلة، تتبع، مرحبا)"
            className="flex-1 bg-[#202c33] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-transparent placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-3 rounded-xl transition flex items-center justify-center shadow-lg"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </main>

      {/* Interactive Products List Modal */}
      {showListModal && activeListSection && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#202c33] rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
              <h2 className="font-bold text-emerald-400 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> {activeListSection.listTitle || "منيو CoffeeStore"}
              </h2>
              <button
                onClick={() => setShowListModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {activeListSection.sections?.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    {sec.title}
                  </h3>
                  <div className="space-y-2">
                    {sec.rows?.map((row: any) => (
                      <div
                        key={row.id}
                        onClick={() => {
                          setShowListModal(false);
                          handleSendMessage(row.title, row.id);
                        }}
                        className="p-3 bg-[#182229] hover:bg-[#202c33] border border-[#2a3942] rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-white group-hover:text-emerald-400 transition text-sm">
                            {row.title}
                          </div>
                          {row.description && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {row.description}
                            </div>
                          )}
                        </div>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black font-medium transition">
                          إضافة ➕
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#182229] border-t border-[#2a3942] text-center">
              <button
                onClick={() => setShowListModal(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                إغلاق القائمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
