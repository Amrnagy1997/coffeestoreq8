import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Truck, Coffee, Heart, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About | CoffeeStore Q8",
  description: "Learn about CoffeeStore Q8 — Kuwait's premier destination for authentic, limited-edition Starbucks collector mugs.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Every single item in our collection is verified authentic merchandise, sourced directly from Starbucks locations worldwide.",
  },
  {
    icon: Coffee,
    title: "Curated Collection",
    description: "We hand-pick the most rare and sought-after pieces from exclusive markets — Japan, Korea, Europe, and more.",
  },
  {
    icon: Truck,
    title: "Fast & Safe Delivery",
    description: "Your precious mugs are carefully packaged and delivered quickly across Kuwait and internationally.",
  },
  {
    icon: Heart,
    title: "Collector Community",
    description: "We're more than a store — we're a community of passionate collectors who share a love for coffee culture.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        {/* Hero */}
        <section className="px-6 mb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Coffee size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Story</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-outfit font-bold leading-tight">
                Born From a{" "}
                <span className="text-primary italic">Passion</span> for Coffee Culture
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                CoffeeStore Q8 started as a personal obsession — hunting down the rarest, most
                beautiful Starbucks collector mugs from around the globe. Today, we bring that
                same passion directly to collectors across Kuwait and beyond.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Every mug tells a story of a place, a season, a moment in time. We believe that
                collecting isn't just about owning objects — it's about curating memories.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 group"
              >
                Explore Collection
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative aspect-square max-w-[500px] mx-auto lg:mx-0 w-full">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-3 scale-95 z-0" />
              <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-mugs.jpg"
                  alt="Our curated mug collection"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="px-6 py-20 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-outfit font-bold mb-4">What We Stand For</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Our principles guide everything we do — from selecting each piece to packaging your order.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-zinc-700 hover:border-primary/30 transition-premium group"
                  >
                    <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary rounded-2xl flex items-center justify-center mb-6 transition-colors">
                      <Icon size={26} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-outfit font-bold text-lg mb-3">{value.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary rounded-[3rem] p-12 md:p-16 text-white grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "500+", label: "Unique Pieces" },
                { number: "2.5k+", label: "Happy Collectors" },
                { number: "30+", label: "Countries Sourced" },
                { number: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-outfit font-bold mb-2">{stat.number}</p>
                  <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / CTA */}
        <section className="px-6 py-20 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-outfit font-bold mb-6">Get In Touch</h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              Have a question about a specific mug, want to request a particular edition, or just
              want to connect with fellow collectors? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://www.instagram.com/coffeestoreq8/"
                target="_blank"
                className="flex items-center justify-center gap-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-premium shadow-xl"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                @coffeestoreq8
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-8 py-4 rounded-2xl hover:bg-primary/5 transition-premium"
              >
                Browse Shop
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
