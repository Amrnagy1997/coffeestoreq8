"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, User, Search, Menu, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Pre-order", href: "/pre-order", highlight: true },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-premium px-6 py-4",
        isScrolled ? "glass shadow-premium py-3" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png?v=2"
              alt="CoffeeStore Q8"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight hidden sm:block">
            CoffeeStore<span className="text-primary">Q8</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.highlight ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-amber-500 border border-amber-400 px-3 py-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex items-center gap-1"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ),
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Search size={20} />
          </button>

          <Link
            href="/wishlist"
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          {session ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium hidden lg:block">
                {session.user?.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-dark transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) =>
              link.highlight ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-amber-500 p-2 flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium p-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ),
            )}
            {!session && (
              <Link
                href="/login"
                className="text-center bg-primary text-white font-bold py-3 rounded-xl mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
