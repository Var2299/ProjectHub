import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { checkPassword, signToken, setAuthCookie } from "@/lib/auth";
import { handleError } from "@/lib/handleError";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }
    const ok = await checkPassword(data.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

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
