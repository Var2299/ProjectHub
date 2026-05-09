import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: err.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const message = err instanceof Error ? err.message : "Server error";
  console.error(err);
  return NextResponse.json({ error: message }, { status: 500 });
}
