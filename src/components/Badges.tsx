export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    todo: "bg-gray-100 text-gray-700",
    "in-progress": "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    "on-hold": "bg-yellow-100 text-yellow-700",
  };
  return <span className={`badge ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return <span className={`badge ${map[priority] || "bg-gray-100 text-gray-700"}`}>{priority}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-indigo-100 text-indigo-700",
    member: "bg-gray-100 text-gray-700",
  };
  return <span className={`badge ${map[role] || "bg-gray-100 text-gray-700"}`}>{role}</span>;
}
