"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import Empty from "@/components/Empty";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

interface Task {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: { _id: string; name: string } | null;
  project: { _id: string; name: string };
  dueDate: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine" | "todo" | "in-progress" | "done">("all");
  const [me, setMe] = useState<any>(null);

  async function load() {
    const [t, m] = await Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setTasks(t.tasks || []);
    setMe(m.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "mine") return tasks.filter((t) => t.assignee?._id === me?.id);
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter, me]);

  async function changeStatus(task: Task, status: Task["status"]) {
    await fetch(`/api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">All tasks across your projects</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "mine", "todo", "in-progress", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
              filter === f
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {f === "mine" ? "Assigned to me" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty title="No tasks here" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${t.project._id}`} className="text-indigo-600 hover:underline">
                      {t.project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.assignee?.name || "—"}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3">
                    {t.assignee?._id === me?.id || me?.role === "admin" ? (
                      <select
                        value={t.status}
                        onChange={(e) => changeStatus(t, e.target.value as Task["status"])}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <StatusBadge status={t.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
