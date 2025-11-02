import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";

export async function POST() {
  const response = NextResponse.json({ status: "ok" }, { status: 200 });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET() {
  return POST();
}
