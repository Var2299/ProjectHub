import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import User from "@/models/User";

const SECRET = process.env.JWT_SECRET || "dev_secret";
const COOKIE = "ph_token";

export type Role = "admin" | "manager" | "member";

export interface TokenData {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export function checkPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function signToken(data: TokenData) {
  return jwt.sign(data, SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie() {
  cookies().delete(COOKIE);
}

export async function getCurrentUser(): Promise<TokenData | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const data = jwt.verify(token, SECRET) as TokenData;
    return data;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  await connectDB();
  const exists = await User.findById(user.id).lean();
  if (!exists) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export function requireRole(user: TokenData, roles: Role[]) {
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
