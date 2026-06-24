import React from "react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  ExternalLink,
  Search
} from "lucide-react";
import { OrderStatusUpdater } from "@/components/OrderStatusUpdater";

async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return orders;
  } catch (error) {
    return [];
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock size={14} className="text-amber-500" />;
      case "confirmed": return <CheckCircle2 size={14} className="text-blue-500" />;
      case "shipped": return <Truck size={14} className="text-purple-500" />;
      case "delivered": return <CheckCircle2 size={14} className="text-green-500" />;
      case "cancelled": return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold">Order Management</h1>
          <p className="text-gray-500 mt-2">Track and update customer orders and delivery status.</p>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders..."
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-premium overflow-hidden border border-gray-100 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {orders.length > 0 ? orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs font-bold">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.customerName}</span>
                      <span className="text-xs text-gray-400">{order.customerPhone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-8 py-5 font-bold text-sm text-primary">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-bold uppercase tracking-tighter">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
