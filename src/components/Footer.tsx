import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-zinc-950 pt-16 pb-8 px-6 border-t border-gray-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Branding */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="CoffeeStore Q8" 
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight">
              CoffeeStore Q8
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            The world's most premium collection of lifestyle products. 
            Delivering excellence since 2024.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="https://www.instagram.com/coffeestoreq8/" className="w-10 h-10 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-premium">
              <Globe size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-premium">
              <Phone size={18} />
            </Link>
            <Link href="#" className="w-10 h-10 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-premium">
              <Mail size={18} />
            </Link>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold mb-6">Shop</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link href="/categories/limited" className="hover:text-primary transition-colors">Limited Edition</Link></li>
            <li><Link href="/categories/seasonal" className="hover:text-primary transition-colors">Seasonal</Link></li>
            <li><Link href="/categories/core" className="hover:text-primary transition-colors">Core Collection</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Customer Service</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
            <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold mb-6">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4">Subscribe to get notified about new limited releases.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400">
          © 2026 CoffeeStore Q8. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
