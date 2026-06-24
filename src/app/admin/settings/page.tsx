"use client";

import React, { useState } from "react";
import { Save, Loader2, Bell, Lock, Globe, Palette } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "CoffeeStore Q8",
    storeEmail: "hello@coffeestoreq8.com",
    instagramHandle: "@coffeestoreq8",
    currency: "KWD",
    freeShippingThreshold: "5",
    allowGuestCheckout: true,
    emailNotifications: true,
    lowStockAlert: "5",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save
    await new Promise((res) => setTimeout(res, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    "w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all";

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-outfit font-bold">Store Settings</h1>
        <p className="text-gray-500 mt-2">
          Configure your store preferences and operational settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Globe size={20} className="text-primary" />
            </div>
            <h2 className="font-bold text-xl">General</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Instagram Handle</label>
              <input
                type="text"
                value={settings.instagramHandle}
                onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className={inputClass + " appearance-none"}
              >
                <option value="KWD">KWD - Kuwaiti Dinar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
          </div>
        </div>

        {/* Commerce Settings */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Palette size={20} className="text-blue-500" />
            </div>
            <h2 className="font-bold text-xl">Commerce</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Free Shipping Threshold (KWD)</label>
              <input
                type="number"
                step="0.5"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Low Stock Alert (units)</label>
              <input
                type="number"
                value={settings.lowStockAlert}
                onChange={(e) => setSettings({ ...settings, lowStockAlert: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.allowGuestCheckout}
                  onChange={(e) => setSettings({ ...settings, allowGuestCheckout: e.target.checked })}
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${settings.allowGuestCheckout ? "bg-primary" : "bg-gray-200 dark:bg-zinc-700"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${settings.allowGuestCheckout ? "translate-x-7" : "translate-x-1"}`}
                  />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Allow Guest Checkout</p>
                <p className="text-xs text-gray-500">Let users checkout without creating an account</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Bell size={20} className="text-amber-500" />
            </div>
            <h2 className="font-bold text-xl">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? "bg-primary" : "bg-gray-200 dark:bg-zinc-700"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${settings.emailNotifications ? "translate-x-7" : "translate-x-1"}`}
                  />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Email Notifications for New Orders</p>
                <p className="text-xs text-gray-500">Receive an email whenever a new order is placed</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Saving...
            </>
          ) : saved ? (
            "✓ Settings Saved!"
          ) : (
            <>
              <Save size={24} />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
