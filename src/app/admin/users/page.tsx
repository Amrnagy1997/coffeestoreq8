import React from "react";
import prisma from "@/lib/prisma";
import { User as UserIcon, Mail, Shield, MoreVertical, Trash2 } from "lucide-react";

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-outfit font-bold">User Management</h1>
        <p className="text-gray-500 mt-2">View and manage all registered customers and administrators.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-premium overflow-hidden border border-gray-100 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Joined Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {users.length > 0 ? users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                      user.role === 'admin' ? 'border-purple-500 text-purple-500 bg-purple-500/5' : 'border-gray-300 text-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No users found.
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
