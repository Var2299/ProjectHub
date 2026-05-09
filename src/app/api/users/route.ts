import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;
    await connectDB();
    // Everyone can see basic user list (needed for assigning), but only admin sees full data
    const users = await User.find().select("name email role").sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err) {
    return handleError(err);
  }
}
