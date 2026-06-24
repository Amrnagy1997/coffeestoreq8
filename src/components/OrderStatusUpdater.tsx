"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update status");
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Something went wrong while updating status");
      // Revert select input value to current status
      e.target.value = status;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {isUpdating && (
        <span className="absolute -left-6 top-1/2 -translate-y-1/2">
          <Loader2 size={14} className="animate-spin text-primary" />
        </span>
      )}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className="bg-gray-100 dark:bg-zinc-800 border-none px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors focus:ring-1 focus:ring-primary outline-none cursor-pointer disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
