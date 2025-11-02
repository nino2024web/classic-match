import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SESSION_COOKIE_CANDIDATES = [
  "classic-match-session",
  "classic-match-refresh",
  "classicMatchSession",
  "classicMatchRefreshToken",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function GET(request: Request) {
  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  for (const name of SESSION_COOKIE_CANDIDATES) {
    response.cookies.delete({ name, path: "/" });
  }

  return response;
}

export function POST(request: Request) {
  return GET(request);
}
