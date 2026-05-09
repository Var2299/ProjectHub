"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import Empty from "@/components/Empty";
import Modal from "@/components/Modal";
import { StatusBadge } from "@/components/Badges";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  owner: { _id: string; name: string };
  members: { _id: string; name: string }[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [p, u, m] = await Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setProjects(p.projects || []);
    setUsers(u.users || []);
    setMe(m.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, members: memberIds }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setErr(data.error || "Failed to create");
    setShowModal(false);
    setName("");
    setDesc("");
    setMemberIds([]);
    load();
  }

  if (loading) return <Loader />;

  const canCreate = me?.role === "admin" || me?.role === "manager";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">All projects you can access</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <Empty title="No projects yet" message={canCreate ? "Create your first project" : "Wait to be added to a project"} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p._id} href={`/projects/${p._id}`} className="card hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-gray-900">{p.name}</div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                {p.description || "No description"}
              </p>
              <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                <span>By {p.owner?.name}</span>
                <span>{p.members.length} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New project">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="label">Members</label>
            <select
              multiple
              className="input h-32"
              value={memberIds}
              onChange={(e) =>
                setMemberIds(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
            >
              {users.filter((u) => u._id !== me?.id).map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          {err && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{err}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
