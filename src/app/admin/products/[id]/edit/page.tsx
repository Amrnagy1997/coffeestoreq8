"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface VariantRow {
  name: string;
  price: string;
  stock: string;
  image: string;
  uploading: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Core Collection",
    stock: "0",
    featured: false,
    isPreOrder: false,
    sku: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((product) => {
        setFormData({
          name: product.name,
          description: product.description,
          price: String(product.price),
          category: product.category,
          stock: String(product.stock),
          featured: product.featured,
          isPreOrder: product.isPreOrder,
          sku: product.sku || "",
        });
        setImages(product.images || []);
        // Load existing variants
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v: any) => ({
              name: v.name,
              price: String(v.price),
              stock: String(v.stock),
              image: v.image,
              uploading: false,
            }))
          );
        }
        setIsLoading(false);
      })
      .catch(() => {
        alert("Failed to load product");
        router.push("/admin/products");
      });
  }, [id, router]);

  const handleAddImage = () => {
    if (imageInput && images.length < 4) {
      setImages([...images, imageInput]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- Variant Helpers ---
  const addVariantRow = () => {
    setVariants([...variants, { name: "", price: "", stock: "1", image: "", uploading: false }]);
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string | boolean) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    updateVariant(index, "uploading", true as any);
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (res.ok) {
        const data = await res.json();
        updateVariant(index, "image", data.url);
      } else {
        alert("Upload failed");
      }
    } catch {
      alert("Upload error");
    } finally {
      setVariants(prev => prev.map((v, i) => i === index ? { ...v, uploading: false } : v));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && variants.length === 0) {
      alert("Please add at least one image or variant");
      return;
    }

    // Validate variants
    const validVariants = variants.filter(v => v.name.trim() && v.image);
    if (variants.length > 0 && validVariants.length !== variants.length) {
      alert("Please fill in name and upload an image for each variant");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock),
          images,
          variants: validVariants.map(v => ({
            name: v.name,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
            image: v.image,
          })),
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update product");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-outfit font-bold">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update the product information below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
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
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Price (KWD)</label>
                <input
                  type="number"
                  step="0.01"
                  required={variants.length === 0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none transition-all"
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
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="featured" className="text-sm font-bold cursor-pointer">
                  Show on Featured Homepage
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPreOrder"
                  checked={formData.isPreOrder}
                  onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="isPreOrder" className="text-sm font-bold cursor-pointer">
                  Mark as Pre-Order
                </label>
              </div>
            </div>
          </div>

          {/* ===== VARIANTS SECTION ===== */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Product Variants / Options</h3>
                <p className="text-gray-400 text-xs mt-1">Add individual items inside this collection, each with its own image and price.</p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} /> Add Option
              </button>
            </div>

            {variants.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-8 text-center text-gray-400">
                <ImageIcon size={40} strokeWidth={1} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No variants yet</p>
                <p className="text-xs mt-1">Click &quot;Add Option&quot; to create items inside this collection</p>
              </div>
            )}

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5 space-y-4 relative group">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex gap-4 items-start">
                    {/* Variant Image Preview / Upload */}
                    <div className="shrink-0">
                      {variant.image ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-700">
                          <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => updateVariant(index, "image", "")}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-600 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                          {variant.uploading ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              <Upload size={18} />
                              <span className="text-[9px] mt-1">Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVariantImageUpload(index, file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Variant Fields */}
                    <div className="flex-grow grid grid-cols-3 gap-3">
                      <div className="col-span-3 sm:col-span-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="e.g. Black Cat Mug"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Price (KWD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium space-y-6">
            <h3 className="font-bold text-lg">Product Images</h3>

            <div className="grid grid-cols-2 gap-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-50 dark:bg-zinc-800 rounded-2xl overflow-hidden group"
                >
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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
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

            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-sm font-bold ml-1">Or Upload from Device</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const uploadData = new FormData();
                  uploadData.append("file", file);
                  
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: uploadData
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (images.length < 4) {
                        setImages([...images, data.url]);
                      } else {
                        alert("Max 4 images allowed");
                      }
                    } else {
                      alert("Upload failed");
                    }
                  } catch (err) {
                    alert("Upload error");
                  }
                }}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl py-2 px-3 text-sm focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={24} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
