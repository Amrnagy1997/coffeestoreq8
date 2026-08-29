"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendTelegramOrderNotification } from "@/lib/telegram";

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variantId?: string;
    variantName?: string;
  }[];
  instagramMessage: string;
}) {
  console.log("Creating order with data:", JSON.stringify(data, null, 2));
  try {
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        totalPrice: data.totalPrice,
        instagramMessage: data.instagramMessage,
        status: "pending",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log("Order created successfully:", order.id);

    // إرسال إشعار فوري إلى تيليجرام
    sendTelegramOrderNotification({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalPrice: order.totalPrice,
      instagramMessage: order.instagramMessage,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        variantName: i.variantName,
      })),
    }).catch((err) => console.error("Telegram notification async error:", err));

    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Failed to create order. Error details:", error);
    if (error.code) console.error("Prisma error code:", error.code);
    return { success: false, error: error.message || "Failed to save order to database" };
  }
}
