"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save, 
  Loader2, 
  Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Core Collection",
    stock: "10",
    featured: false,
    sku: "",
  });

  const handleAddImage = () => {
    if (imageInput && images.length < 4) {
      setImages([...images, imageInput]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please add at least one image URL");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images,
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-outfit font-bold">Add New Product</h1>
          <p className="text-gray-500 mt-1">Fill in the details to list a new product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. Japan Sakura 2024 Edition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Description</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Detailed description of the product, materials, and origin..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Price (KWD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium space-y-6">
            <h3 className="font-bold text-lg">Inventory & Organization</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                >
                  <option>Core Collection</option>
                  <option>Limited Edition</option>
                  <option>Seasonal</option>
                  <option>Region Specific</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">SKU (Optional)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="SBUX-MUG-001"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <label htmlFor="featured" className="text-sm font-bold cursor-pointer">Show on Featured Homepage</label>
            </div>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium space-y-6">
            <h3 className="font-bold text-lg">Product Images</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-gray-50 dark:bg-zinc-800 rounded-2xl overflow-hidden group">
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <div className="aspect-square bg-gray-50 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={32} strokeWidth={1} />
                  <span className="text-[10px] mt-2">Max 4 images</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Add Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="flex-grow bg-gray-50 dark:bg-zinc-800 border-none rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="https://example.com/mug.jpg"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={24} />
                Save Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
