"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-outfit font-bold mb-10">Your Cart</h1>
          
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-premium flex items-center gap-6">
                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                        
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-premium sticky top-32">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="text-green-500 font-medium">Free</span>
                    </div>
                    <div className="h-[1px] bg-gray-100 dark:bg-zinc-800 w-full" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/checkout"
                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20"
                  >
                    Checkout
                    <ArrowRight size={20} />
                  </Link>
                  
                  <Link 
                    href="/products"
                    className="w-full mt-4 text-center text-sm font-bold text-gray-400 hover:text-primary transition-colors block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-40 bg-white dark:bg-zinc-900 rounded-3xl shadow-premium border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <ShoppingBag size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added any mugs yet.</p>
              <Link href="/products" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-premium inline-block">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
