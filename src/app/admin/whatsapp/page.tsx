"use client";

import React, { useEffect, useState } from "react";
import { Bot, RefreshCw, CheckCircle, Smartphone, ExternalLink, Settings, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

export default function AdminWhatsAppDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-emerald-600" /> لوحة إدارة بوت الواتساب التفاعلي
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            إدارة جلسات الواتساب، إعدادات Webhook، ومتابعة المبيعات التلقائية عبر الواتساب.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/whatsapp-bot"
            target="_blank"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Smartphone className="w-4 h-4" /> فتح محاكي الواتساب <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition text-gray-700 dark:text-zinc-300"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">إجمالي الجلسات النشطة</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {stats?.totalSessions ?? 0}
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> جلسات المحادثة المسجلة
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">طلبات الواتساب الآلية</span>
            <ShoppingCart className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {stats?.totalWhatsAppOrders ?? 0}
          </div>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> طلبات مكتملة تلقائياً
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">حالة الـ Webhook</span>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> جاهز للعمل 24/7
          </div>
          <p className="text-xs text-gray-400 mt-1">Meta Cloud API Ready</p>
        </div>
      </div>

      {/* Integration Guide Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-6 border border-zinc-800 space-y-4">
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Settings className="w-5 h-5" /> إعدادات Meta WhatsApp Cloud API (الإنتاج)
        </h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          لكي يعمل البوت على حساب الواتساب التجاري الخاص بمشروعك رسمياً، قم بربط بيانات الـ Webhook التالية في **Meta Developer Portal**:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-700">
            <span className="text-gray-400 font-sans text-xs block mb-1">Callback URL (عنوان الـ Webhook):</span>
            <code className="text-emerald-300 break-all select-all">https://coffeestoreq8.com/api/whatsapp/webhook</code>
          </div>
          <div className="bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-700">
            <span className="text-gray-400 font-sans text-xs block mb-1">Verify Token (رمز التحقق):</span>
            <code className="text-amber-300 break-all select-all">coffeestore_verify_token_2026</code>
          </div>
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-bold text-gray-900 dark:text-white flex items-center justify-between">
          <span>آخر جلسات المستخدمين على الواتساب</span>
          <span className="text-xs font-normal text-gray-500">محدث تلقائياً</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-gray-600 dark:text-zinc-300">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-400 font-semibold">
              <tr>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">الخطوة الحالية</th>
                <th className="p-3">الاسم المؤقت</th>
                <th className="p-3">العنوان</th>
                <th className="p-3">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    لا توجد جلسات مسجلة حتى الآن. جرب استخدام محاكي الواتساب!
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="p-3 font-mono dir-ltr text-right">{s.phone}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        {s.step}
                      </span>
                    </td>
                    <td className="p-3">{s.tempName || "-"}</td>
                    <td className="p-3">{s.tempAddress || "-"}</td>
                    <td className="p-3">{new Date(s.updatedAt).toLocaleString("ar-EG")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
