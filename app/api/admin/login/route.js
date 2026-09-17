import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // Simple session cookie — good enough for a course project's admin view,
  // not meant to replace real authentication for a production store.
  res.cookies.set("threadline_admin", "granted", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8 // 8 hours
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("threadline_admin", "", { maxAge: 0 });
  return res;
}
