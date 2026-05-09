import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const schema = z.object({
  name: z.string().min(2, "Project name is too short"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on-hold"]).optional(),
  members: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();

    let query: any = {};
    if (user!.role !== "admin") {
      query = { $or: [{ owner: user!.id }, { members: user!.id }] };
    }
    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ projects });
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
    const project = await Project.create({
      ...data,
      owner: user!.id,
      members: data.members || [],
    });
    return NextResponse.json({ project });
  } catch (err) {
    return handleError(err);
  }
}
