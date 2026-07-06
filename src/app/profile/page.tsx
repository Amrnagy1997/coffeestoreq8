import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/prisma";
import PriceText from "@/components/PriceText";
import { 
  User as UserIcon, 
  ShoppingBag, 
  Package, 
  Settings, 
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";

async function getOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return [];
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const orders = await getOrders((session.user as any).id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium text-center">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 text-primary border-4 border-white dark:border-zinc-800 shadow-xl">
                <UserIcon size={40} />
              </div>
              <h2 className="font-outfit font-bold text-xl">{session.user?.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{session.user?.email}</p>
              
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Package size={18} className="text-gray-400 group-hover:text-primary" />
                    Orders
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Settings size={18} className="text-gray-400 group-hover:text-primary" />
                    Settings
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
                <Link 
                   href="/api/auth/signout"
                   className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-bold"
                >
                  <LogOut size={18} />
                  Logout
                </Link>
              </div>
            </div>

            {(session.user as any).role === "admin" && (
              <Link 
                href="/admin"
                className="block bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 p-6 rounded-[2rem] text-center font-bold hover:opacity-90 transition-opacity"
              >
                Go to Admin Dashboard
              </Link>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            <div>
              <h1 className="text-3xl font-outfit font-bold mb-2">Order History</h1>
              <p className="text-gray-500">View and track your previous orders.</p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-premium border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="p-8 flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-tighter">Order #{order.id.slice(-6)}</span>
                           <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                             order.status === 'delivered' ? 'border-green-500 text-green-500' : 'border-primary text-primary'
                           }`}>
                             {order.status}
                           </span>
                        </div>
                        <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        
                        <div className="flex gap-4">
                           {order.items.slice(0, 3).map((item: any, i: number) => (
                             <div key={i} className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                   {item.quantity}x
                                </div>
                             </div>
                           ))}
                           {order.items.length > 3 && (
                             <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                               +{order.items.length - 3}
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right">
                           <p className="text-sm text-gray-400">Total Amount</p>
                           <PriceText price={order.totalPrice} className="text-2xl font-bold text-primary block" />
                        </div>
                        <button className="bg-gray-100 dark:bg-zinc-800 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                          Order Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 py-20 rounded-[2.5rem] shadow-premium border border-dashed border-gray-200 dark:border-zinc-800 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-bold text-xl mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-8">When you buy your first mug, it will appear here.</p>
                <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
