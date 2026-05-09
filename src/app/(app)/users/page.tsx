"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { RoleBadge } from "@/components/Badges";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [u, m] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    if (m.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    setUsers(u.users || []);
    setMe(m.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(user: User, role: User["role"]) {
    await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function removeUser(user: User) {
    if (!confirm(`Delete user ${user.name}?`)) return;
    await fetch(`/api/users/${user._id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members and roles</p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-700">{u.email}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-right">
                  {u._id === me.id ? (
                    <span className="text-xs text-gray-400">You</span>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value as User["role"])}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                      </select>
                      <button onClick={() => removeUser(u)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
