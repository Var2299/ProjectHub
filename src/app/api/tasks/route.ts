import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const schema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().optional(),
  project: z.string().min(1, "Project is required"),
  assignee: z.string().nullable().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();

    const projectId = req.nextUrl.searchParams.get("projectId");
    let query: any = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      const isMember =
        project.owner.toString() === user!.id ||
        project.members.some((m: any) => m.toString() === user!.id);
      if (user!.role !== "admin" && !isMember) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      query.project = projectId;
    } else if (user!.role !== "admin") {
      const projects = await Project.find({
        $or: [{ owner: user!.id }, { members: user!.id }],
      }).select("_id");
      query.project = { $in: projects.map((p) => p._id) };
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ tasks });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    if (user!.role === "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = schema.parse(await req.json());
    await connectDB();
    const project = await Project.findById(data.project);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (user!.role !== "admin" && project.owner.toString() !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const task = await Task.create({
      ...data,
      assignee: data.assignee || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });
    return NextResponse.json({ task });
  } catch (err) {
    return handleError(err);
  }
}
