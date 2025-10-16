import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE_NAME,
  validateAdminSessionCookie,
} from "@/lib/adminSession";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!validateAdminSessionCookie(rawSession)) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-20 text-slate-100">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-[0_45px_90px_-45px_rgba(13,14,26,0.7)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">管理者ダッシュボード</h1>
        <p className="text-sm text-slate-300">
          ここに管理者向けの機能を配置してください。現在はプレースホルダーです。
        </p>
      </div>
    </main>
  );
}
