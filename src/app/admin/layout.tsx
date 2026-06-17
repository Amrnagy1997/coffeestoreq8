"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-outfit font-bold text-xl">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-premium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-premium"
          >
            <Home size={20} />
            Storefront
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-premium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-grow overflow-auto p-10">
        {children}
      </main>
    </div>
  );
}
