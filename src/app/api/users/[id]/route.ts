import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const schema = z.object({
  role: z.enum(["admin", "manager", "member"]),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    if (user!.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = schema.parse(await req.json());
    await connectDB();
    const target = await User.findById(params.id);
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    target.role = data.role;
    await target.save();
    return NextResponse.json({
      user: { id: target._id, name: target.name, email: target.email, role: target.role },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    if (user!.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (params.id === user!.id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
