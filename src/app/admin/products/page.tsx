import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, MoreVertical, Edit2, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/DeleteProductButton";

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    
    return products.map((p) => ({
      ...p,
      images: p.images.map((img) => img.url),
    }));
  } catch (error) {
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-bold">Products Management</h1>
          <p className="text-gray-500 mt-2">Manage your inventory, prices and product details.</p>
        </div>
        <Link 
          href="/admin/products/add"
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-premium shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-premium overflow-hidden border border-gray-100 dark:border-zinc-800">
        <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
           <div className="relative w-full max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search products..."
               className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-primary outline-none transition-all"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {products.length > 0 ? products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">{product.sku || 'NO SKU'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="px-8 py-4 font-bold text-sm">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-8 py-4 text-sm">
                    {product.stock} pcs
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium">{product.stock > 0 ? 'Active' : 'Out of Stock'}</span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Link 
                         href={`/admin/products/${product.id}/edit`}
                         className="p-2 text-gray-400 hover:text-primary transition-colors"
                         title="Edit Product"
                       >
                         <Edit2 size={18} />
                       </Link>
                       <DeleteProductButton productId={product.id} productName={product.name} />
                       <Link href={`/products/${product.id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                         <ExternalLink size={18} />
                       </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No products found in the inventory.
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
