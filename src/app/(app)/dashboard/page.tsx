"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Link from "next/link";

interface Stats {
  projectCount: number;
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  userCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([s, u]) => {
      setStats(s.stats);
      setMe(u.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;
  if (!stats) return null;

  const cards = [
    { label: "Projects", value: stats.projectCount, color: "bg-indigo-50 text-indigo-700" },
    { label: "Total Tasks", value: stats.totalTasks, color: "bg-blue-50 text-blue-700" },
    { label: "To Do", value: stats.todo, color: "bg-gray-100 text-gray-700" },
    { label: "In Progress", value: stats.inProgress, color: "bg-yellow-50 text-yellow-700" },
    { label: "Done", value: stats.done, color: "bg-green-50 text-green-700" },
  ];
  if (me?.role === "admin") {
    cards.push({ label: "Users", value: stats.userCount, color: "bg-purple-50 text-purple-700" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {me?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Here is an overview of your work</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${c.color}`}>
              {c.label}
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-3">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/projects" className="card hover:shadow-md transition">
          <div className="font-semibold text-gray-900">Projects</div>
          <div className="text-sm text-gray-500 mt-1">View, create and manage projects</div>
        </Link>
        <Link href="/tasks" className="card hover:shadow-md transition">
          <div className="font-semibold text-gray-900">Tasks</div>
          <div className="text-sm text-gray-500 mt-1">Track and update task progress</div>
        </Link>
      </div>
    </div>
  );
}
