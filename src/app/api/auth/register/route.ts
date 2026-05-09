import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "member";

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role,
    });

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });
    setAuthCookie(token);

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return handleError(err);
  }
}
