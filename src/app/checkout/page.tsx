"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/context/CurrencyContext";
import { 
  User, 
  Phone, 
  MapPin, 
  Copy, 
  Share2, 
  Check, 
  ArrowLeft, 
  ExternalLink,
  Info,
  Loader2
} from "lucide-react";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [step, setStep] = useState(1); // 1: Info, 2: Summary
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const generateMessage = () => {
    const items = cart.map(item => {
      const linePrice = item.price * item.quantity;
      if (currency !== "KWD") {
        const convertedLine = formatPrice(linePrice);
        const originalLine = `${(linePrice).toFixed(3)} د.ك`;
        return `• ${item.name} (x${item.quantity}) - ${convertedLine} (${originalLine})`;
      }
      return `• ${item.name} (x${item.quantity}) - ${formatPrice(linePrice)}`;
    }).join("\n");

    const deliveryFee = currency === "KWD" ? 2 : 12;
    const grandTotal = cartTotal + deliveryFee;

    const subtotalText = currency !== "KWD"
      ? `${formatPrice(cartTotal)} (${cartTotal.toFixed(3)} د.ك)`
      : formatPrice(cartTotal);

    const deliveryText = currency !== "KWD"
      ? `${formatPrice(deliveryFee)} (${deliveryFee.toFixed(3)} د.ك)`
      : formatPrice(deliveryFee);

    const grandTotalText = currency !== "KWD"
      ? `${formatPrice(grandTotal)} (${grandTotal.toFixed(3)} د.ك)`
      : formatPrice(grandTotal);

    const hasPreOrderItems = cart.some(item => item.isPreOrder);
    const preOrderNoticeText = hasPreOrderItems 
      ? "\n\n*تنبيه:* يحتوي الطلب على منتجات طلب مسبق تصل خلال 2 - 3 أسابيع." 
      : "";

    return `*New Order from CoffeeStore Q8*\n\n*Customer Info:*\n- Name: ${formData.name}\n- Phone: ${formData.phone}\n- Address: ${formData.address}\n\n*Order Details:*\n${items}\n\n*Subtotal:* ${subtotalText}\n*Delivery:* ${deliveryText}\n*Total Price:* ${grandTotalText}${preOrderNoticeText}\n\n_Generated via coffeestoreq8.com_`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInstagram = () => {
    setShowModal(true);
  };

  const confirmRedirect = async () => {
    setIsSubmitting(true);
    const deliveryFee = currency === "KWD" ? 2 : 12;
    try {
      const result = await createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        totalPrice: cartTotal + deliveryFee,
        instagramMessage: generateMessage(),
        items: cart.map(item => {
          if (!item.id) {
            console.warn("Item missing ID:", item);
          }
          return {
            productId: item.id || "unknown",
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId,
            variantName: item.variantName
          };
        })
      });

      if (result.success) {
        setOrderSuccess(true);
        clearCart();
        window.open("https://www.instagram.com/coffeestoreq8/", "_blank");
      } else {
        alert("Failed to save order. Please try again.");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-premium p-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} />
            </div>
            <h1 className="text-3xl font-outfit font-bold mb-4">Order Placed!</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your order has been saved. If you haven't been redirected to Instagram, click the button below to send us your order message.
            </p>
            <div className="space-y-4">
              <Link 
                href="https://www.instagram.com/coffeestoreq8/"
                target="_blank"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium"
              >
                Go to Instagram <ExternalLink size={18} />
              </Link>
              <Link 
                href="/products" 
                className="block py-4 text-sm font-bold text-gray-400 hover:text-primary transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link href="/products" className="text-primary font-bold">Return to shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-4 mb-10 text-sm font-bold text-gray-400">
            <span className={step === 1 ? "text-primary" : "text-green-500 flex items-center gap-1"}>
              {step === 2 && <Check size={14} />} 01 Customer Info
            </span>
            <div className="h-[2px] w-8 bg-gray-200 dark:bg-zinc-800" />
            <span className={step === 2 ? "text-primary" : ""}>02 Summary & Payment</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-premium overflow-hidden">
            {step === 1 ? (
              <div className="p-10">
                <h1 className="text-3xl font-outfit font-bold mb-8">Delivery Information</h1>
                <form onSubmit={handleNext} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. Abdullah Al-Sabah"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. +965 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                      <textarea
                        required
                        rows={4}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Block, Street, House Number, Area..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    Continue to Summary
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-10">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary mb-8"
                >
                  <ArrowLeft size={16} /> Edit Info
                </button>

                <h1 className="text-3xl font-outfit font-bold mb-8">Order Summary</h1>
                
                <div className="bg-gray-50 dark:bg-zinc-800 p-8 rounded-3xl mb-8 space-y-4">
                   <div className="flex justify-between items-start">
                     <span className="text-sm text-gray-500">Customer</span>
                     <span className="font-bold">{formData.name}</span>
                   </div>
                   <div className="flex justify-between items-start">
                     <span className="text-sm text-gray-500">Phone</span>
                     <span className="font-bold">{formData.phone}</span>
                   </div>
                   <div className="flex justify-between items-start">
                     <span className="text-sm text-gray-500">Address</span>
                     <span className="font-bold text-right max-w-[200px]">{formData.address}</span>
                   </div>
                   <div className="h-[1px] bg-gray-200 dark:bg-zinc-700 w-full" />
                   <div className="space-y-2">
                     <span className="text-sm text-gray-500 block mb-2">Products</span>
                     {cart.map(item => (
                       <div key={item.variantId ? `${item.id}__${item.variantId}` : item.id} className="flex justify-between text-sm">
                         <span>{item.name} (x{item.quantity})</span>
                         <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                       </div>
                     ))}
                   </div>
                   <div className="h-[1px] bg-gray-200 dark:bg-zinc-700 w-full" />
                   <div className="flex justify-between items-center text-sm pt-1">
                     <span className="text-gray-500">Subtotal</span>
                     <span className="font-bold">{formatPrice(cartTotal)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm pt-1">
                     <span className="text-gray-500">Delivery Fee</span>
                     <span className="font-bold text-primary">
                       {formatPrice(currency === "KWD" ? 2 : 12)}
                     </span>
                   </div>
                   <div className="h-[1px] bg-gray-200 dark:bg-zinc-700 w-full" />
                   <div className="flex justify-between items-center text-xl font-bold pt-2">
                     <span>Total Amount</span>
                     <span className="text-primary">{formatPrice(cartTotal + (currency === "KWD" ? 2 : 12))}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  {cart.some(item => item.isPreOrder) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl text-xs font-bold leading-relaxed">
                      ⚠️ تنبيه: يحتوي طلبك على منتجات طلب مسبق يستغرق توصيلها من 2 إلى 3 أسابيع.
                    </div>
                  )}
                  <button
                    onClick={handleCopy}
                    className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-premium border-2 ${
                      copied 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-primary text-primary hover:bg-primary/5"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={20} /> Message Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={20} /> Copy Order Message
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendInstagram}
                    className="w-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-premium shadow-xl"
                  >
                    <Share2 size={20} />
                    Send via Instagram
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Instagram Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Info size={32} />
              </div>
              
              <h2 className="text-2xl font-outfit font-bold mb-4">Complete Your Order</h2>
              
              <div className="space-y-6 text-gray-600 dark:text-gray-400 mb-10 text-sm leading-relaxed">
                <div className="flex gap-4 items-start text-left">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">1</div>
                  <p>We'll redirect you to our Instagram profile <strong>@coffeestoreq8</strong>.</p>
                </div>
                <div className="flex gap-4 items-start text-left">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">2</div>
                  <p>Click on the <strong>"Message"</strong> button in our profile.</p>
                </div>
                <div className="flex gap-4 items-start text-left">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1">3</div>
                  <p><strong>Paste</strong> the copied message and send it to us. We will confirm your order immediately.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmRedirect}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving Order...
                    </>
                  ) : (
                    <>
                      Continue to Instagram
                      <ExternalLink size={18} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
