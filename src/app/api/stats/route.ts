import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();

    const isAdmin = user!.role === "admin";
    const projectFilter = isAdmin
      ? {}
      : { $or: [{ owner: user!.id }, { members: user!.id }] };

    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map((p) => p._id);

    const taskFilter = isAdmin ? {} : { project: { $in: projectIds } };

    const [projectCount, totalTasks, todo, inProgress, done, userCount] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "todo" }),
      Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      Task.countDocuments({ ...taskFilter, status: "done" }),
      isAdmin ? User.countDocuments() : 0,
    ]);

    return NextResponse.json({
      stats: { projectCount, totalTasks, todo, inProgress, done, userCount },
    });
  } catch (err) {
    return handleError(err);
  }
}
