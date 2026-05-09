import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    const task = await Task.findById(params.id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const project = await Project.findById(task.project);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const data = updateSchema.parse(await req.json());

    const isAdmin = user!.role === "admin";
    const isOwner = project.owner.toString() === user!.id;
    const isAssignee = task.assignee && task.assignee.toString() === user!.id;

    if (!isAdmin && !isOwner) {
      // members can only update their own task status
      if (!isAssignee) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const allowed = ["status"];
      const keys = Object.keys(data);
      if (keys.some((k) => !allowed.includes(k))) {
        return NextResponse.json(
          { error: "You can only update status of your task" },
          { status: 403 }
        );
      }
    }

    Object.assign(task, {
      ...data,
      dueDate: data.dueDate === undefined ? task.dueDate : data.dueDate ? new Date(data.dueDate) : null,
    });
    await task.save();
    return NextResponse.json({ task });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    const task = await Task.findById(params.id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const project = await Project.findById(task.project);
    const isOwner = project && project.owner.toString() === user!.id;
    if (user!.role !== "admin" && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await task.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
