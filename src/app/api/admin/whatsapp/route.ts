import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalSessions = await prisma.whatsAppSession.count();
    const activeSessions = await prisma.whatsAppSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const totalWhatsAppOrders = await prisma.order.count({
      where: { instagramMessage: { contains: "بوت الواتساب" } },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        totalWhatsAppOrders,
      },
      sessions: activeSessions,
      webhookUrl: "/api/whatsapp/webhook",
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "coffeestore_verify_token_2026",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
