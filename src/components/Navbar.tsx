"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Me {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
}

export default function Navbar() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .finally(() => setLoading(false));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return null;
  if (!me) return null;

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        pathname.startsWith(href)
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-700">
            ProjectHub
          </Link>
          <div className="hidden sm:flex gap-1">
            {link("/dashboard", "Dashboard")}
            {link("/projects", "Projects")}
            {link("/tasks", "Tasks")}
            {me.role === "admin" && link("/users", "Users")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-800">{me.name}</div>
            <div className="text-xs text-gray-500 capitalize">{me.role}</div>
          </div>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
      <div className="sm:hidden border-t border-gray-200 px-4 py-2 flex gap-1 overflow-x-auto">
        {link("/dashboard", "Dashboard")}
        {link("/projects", "Projects")}
        {link("/tasks", "Tasks")}
        {me.role === "admin" && link("/users", "Users")}
      </div>
    </nav>
  );
}
