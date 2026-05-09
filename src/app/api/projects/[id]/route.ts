import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on-hold"]).optional(),
  members: z.array(z.string()).optional(),
});

function canEdit(user: any, project: any) {
  return user.role === "admin" || project.owner.toString() === user.id;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    const project = await Project.findById(params.id)
      .populate("owner", "name email")
      .populate("members", "name email");
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember =
      project.owner._id.toString() === user!.id ||
      project.members.some((m: any) => m._id.toString() === user!.id);
    if (user!.role !== "admin" && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    const project = await Project.findById(params.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canEdit(user, project)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = updateSchema.parse(await req.json());
    Object.assign(project, data);
    await project.save();
    return NextResponse.json({ project });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    const project = await Project.findById(params.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canEdit(user, project)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
