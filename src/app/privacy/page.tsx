import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PRIVACY_SECTIONS } from "@/lib/legal";
import { SESSION_COOKIE_NAME, validateSessionCookie } from "@/lib/session";

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status === "valid") {
    redirect("/member");
  }

  if (validation.status !== "valid") {
    redirect("/signup?next=/privacy");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Privacy Policy
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Classic Match が取得する情報とその利用目的について説明します。
          </p>
        </header>

        <article className="space-y-8 rounded-[28px] border border-white/10 bg-white/5 p-8 text-sm leading-relaxed text-slate-200 sm:p-10 sm:text-base">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <footer className="text-center text-sm text-slate-400">
          <Link
            href="/"
            className="text-emerald-300 transition hover:text-emerald-200"
          >
            ホームへ戻る
          </Link>
        </footer>
      </main>
    </div>
  );
}
