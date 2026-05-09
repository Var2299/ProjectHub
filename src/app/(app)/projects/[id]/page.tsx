"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Empty from "@/components/Empty";
import Modal from "@/components/Modal";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: User | null;
  dueDate: string | null;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  owner: User;
  members: User[];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tAssignee, setTAssignee] = useState("");
  const [tStatus, setTStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [tPriority, setTPriority] = useState<"low" | "medium" | "high">("medium");
  const [tDue, setTDue] = useState("");
  const [tErr, setTErr] = useState("");
  const [tSaving, setTSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  async function suggestDesc() {
    if (!tTitle.trim()) {
      setTErr("Enter a title first");
      return;
    }
    setAiLoading(true);
    setTErr("");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: tTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.description) setTDesc(data.description);
    } catch (e: any) {
      setTErr(e.message || "AI suggest failed");
    } finally {
      setAiLoading(false);
    }
  }

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pStatus, setPStatus] = useState("active");
  const [pMembers, setPMembers] = useState<string[]>([]);
  const [pErr, setPErr] = useState("");

  async function load() {
    const [p, t, u, m] = await Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/tasks?projectId=${id}`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    if (p.error) {
      router.push("/projects");
      return;
    }
    setProject(p.project);
    setTasks(t.tasks || []);
    setUsers(u.users || []);
    setMe(m.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  function openNewTask() {
    setEditingTask(null);
    setTTitle("");
    setTDesc("");
    setTAssignee("");
    setTStatus("todo");
    setTPriority("medium");
    setTDue("");
    setTErr("");
    setShowTaskModal(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTTitle(task.title);
    setTDesc(task.description);
    setTAssignee(task.assignee?._id || "");
    setTStatus(task.status);
    setTPriority(task.priority);
    setTDue(task.dueDate ? task.dueDate.split("T")[0] : "");
    setTErr("");
    setShowTaskModal(true);
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();
    setTErr("");
    setTSaving(true);
    const body: any = {
      title: tTitle,
      description: tDesc,
      assignee: tAssignee || null,
      status: tStatus,
      priority: tPriority,
      dueDate: tDue || null,
    };
    let res;
    if (editingTask) {
      res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      body.project = id;
      res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    const data = await res.json();
    setTSaving(false);
    if (!res.ok) return setTErr(data.error || "Failed to save");
    setShowTaskModal(false);
    load();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    load();
  }

  async function quickStatus(task: Task, status: Task["status"]) {
    await fetch(`/api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  function openEditProject() {
    if (!project) return;
    setPName(project.name);
    setPDesc(project.description);
    setPStatus(project.status);
    setPMembers(project.members.map((m) => m._id));
    setPErr("");
    setShowProjectModal(true);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pName, description: pDesc, status: pStatus, members: pMembers }),
    });
    const data = await res.json();
    if (!res.ok) return setPErr(data.error || "Failed");
    setShowProjectModal(false);
    load();
  }

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  }

  if (loading) return <Loader />;
  if (!project) return null;

  const isOwner = me?.id === project.owner._id;
  const isAdmin = me?.role === "admin";
  const canManage = isAdmin || isOwner;
  const canCreateTasks = isAdmin || (me?.role === "manager" && isOwner);

  const grouped = {
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-gray-600">{project.description || "No description"}</p>
          <div className="text-xs text-gray-500 mt-2">
            Owner: {project.owner.name} · {project.members.length} members
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <>
              <button onClick={openEditProject} className="btn-secondary">Edit</button>
              <button onClick={deleteProject} className="btn-danger">Delete</button>
            </>
          )}
          {canCreateTasks && (
            <button onClick={openNewTask} className="btn-primary">+ Task</button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <Empty title="No tasks yet" message={canCreateTasks ? "Create your first task" : ""} />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {(["todo", "in-progress", "done"] as const).map((col) => (
            <div key={col} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="font-medium text-sm text-gray-700 capitalize">
                  {col.replace("-", " ")}
                </div>
                <span className="text-xs text-gray-500">{grouped[col].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col].map((task) => {
                  const canEditFully = isAdmin || isOwner;
                  const isAssignee = task.assignee?._id === me?.id;
                  return (
                    <div key={task._id} className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm text-gray-900">{task.title}</div>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {task.description && (
                      <textarea
                      readOnly
                      value={task.description}
                      className="mt-1 w-full min-h-[70px] resize-y overflow-auto rounded-md border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-500 focus:outline-none"
                       />
                       )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{task.assignee?.name || "Unassigned"}</span>
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      {(canEditFully || isAssignee) && (
                        <div className="flex items-center gap-2 mt-2">
                          <select
                            value={task.status}
                            onChange={(e) => quickStatus(task, e.target.value as Task["status"])}
                            className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          {canEditFully && (
                            <>
                              <button
                                onClick={() => openEditTask(task)}
                                className="text-xs text-indigo-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task._id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Del
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? "Edit task" : "New task"}
      >
        <form onSubmit={saveTask} className="space-y-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={tTitle} onChange={(e) => setTTitle(e.target.value)} required />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Description</label>
              <button
                type="button"
                onClick={suggestDesc}
                disabled={aiLoading}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
              >
                {aiLoading ? "Generating..." : "AI Suggest"}
              </button>
            </div>
            <textarea className="input" value={tDesc} onChange={(e) => setTDesc(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={tStatus} onChange={(e) => setTStatus(e.target.value as any)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={tPriority} onChange={(e) => setTPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assignee</label>
              <select className="input" value={tAssignee} onChange={(e) => setTAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {[project.owner, ...project.members].map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due date</label>
              <input className="input" type="date" value={tDue} onChange={(e) => setTDue(e.target.value)} />
            </div>
          </div>
          {tErr && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{tErr}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={tSaving}>
              {tSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showProjectModal} onClose={() => setShowProjectModal(false)} title="Edit project">
        <form onSubmit={saveProject} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={pName} onChange={(e) => setPName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={pStatus} onChange={(e) => setPStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Members</label>
            <select
              multiple
              className="input h-32"
              value={pMembers}
              onChange={(e) => setPMembers(Array.from(e.target.selectedOptions).map((o) => o.value))}
            >
              {users.filter((u) => u._id !== project.owner._id).map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          {pErr && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{pErr}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
