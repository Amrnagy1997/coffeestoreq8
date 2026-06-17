import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  // Static stats for demonstration
  const stats = [
    { name: "Total Sales", value: 1250, change: "+12.5%", trending: "up", icon: TrendingUp, color: "bg-blue-500" },
    { name: "Total Orders", value: 48, change: "+5.2%", trending: "up", icon: ShoppingBag, color: "bg-primary" },
    { name: "Total Customers", value: 156, change: "-2.1%", trending: "down", icon: Users, color: "bg-purple-500" },
    { name: "Total Products", value: 24, change: "+3", trending: "up", icon: Package, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-outfit font-bold">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back to your administration panel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-premium border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.trending === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold mt-1">
                {stat.name === "Total Sales" ? formatPrice(stat.value) : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-zinc-800">
           <div className="flex justify-between items-center mb-8">
             <h3 className="font-bold text-xl">Sales Activity</h3>
             <select className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none">
               <option>Last 7 days</option>
               <option>Last 30 days</option>
             </select>
           </div>
           
           {/* Chart Placeholder */}
           <div className="h-64 w-full bg-gray-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-700">
              <p className="text-gray-400 font-medium">Sales Chart Visualization</p>
           </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-zinc-800">
           <h3 className="font-bold text-xl mb-8">Top Products</h3>
           <div className="space-y-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl shrink-0" />
                 <div className="flex-grow">
                   <h4 className="font-bold text-sm">Sakura Edition</h4>
                   <p className="text-xs text-gray-500">12 sales this week</p>
                 </div>
                 <p className="font-bold text-primary text-sm">{formatPrice(12.5)}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
