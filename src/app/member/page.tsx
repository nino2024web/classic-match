import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { query } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  validateSessionCookie,
} from "@/lib/session";

type SignupRow = {
  call_sign: string;
};

export const dynamic = "force-dynamic";

export default async function MemberPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status === "expired") {
    redirect("/session-expired?next=/");
  }

  if (validation.status !== "valid") {
    redirect("/login");
  }

  const session = validation.session;

  if (!session) {
    redirect("/login");
  }

  let callSign = "";

  try {
    const result = await query<SignupRow>(
      `
        SELECT call_sign
        FROM beta_signups
        WHERE id = $1
        LIMIT 1
      `,
      [session.signupId]
    );
    callSign = result.rows[0]?.call_sign ?? "";
  } catch (error) {
    console.error("Failed to load member profile", error);
  }

  if (!callSign) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
        <div className="space-y-8 rounded-[32px] border border-white/10 bg-slate-950/75 p-10 shadow-[0_60px_120px_-60px_rgba(9,9,11,0.85)] backdrop-blur-xl sm:p-12">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              Member Lounge
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              ようこそ、{callSign} さん。
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              現在の会員ページはプレースホルダーです。追加機能の準備が整うまで、ログアウトリンクのみを提供しています。
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href="/logout"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
            >
              ログアウト
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
