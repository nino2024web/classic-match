import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { query } from "@/lib/db";
import {
  PRIVACY_SECTIONS,
  TERMS_CONTACT,
  TERMS_SECTIONS,
} from "@/lib/legal";
import {
  SESSION_COOKIE_NAME,
  validateSessionCookie,
} from "@/lib/session";

type SignupRow = {
  call_sign: string;
};

export const dynamic = "force-dynamic";

const quickActions = [
  {
    title: "プロフィールを整える",
    description: "呼び名や気分タグを更新してレコメンドの精度を高めましょう。",
    href: "/profile/setup",
  },
  {
    title: "作品ディスカバリー（準備中）",
    description: "気分タグから作品を提案する画面をまもなく公開します。",
    href: null,
  },
  {
    title: "静かなメモ（準備中）",
    description: "作品ごとのメモを記録・共有できるノート機能を開発中です。",
    href: null,
  },
];

const communityUpdates = [
  {
    title: "作曲家ラウンジ",
    status: "開発中",
    body: "作曲家ごとにテーマを分けたスレッドを準備中です。静かな質問や発見を共有できます。",
  },
  {
    title: "共鳴スタンプ",
    status: "調整中",
    body: "感じた響きを気軽に残せるリアクションを設計しています。お気に入りの作品を讃えましょう。",
  },
  {
    title: "小部屋セッション",
    status: "構想中",
    body: "4〜6人で期間限定の深掘りを行う小部屋機能を企画しています。完成まで少々お待ちください。",
  },
];

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,197,94,0.18),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(at_20%_80%,rgba(168,85,247,0.14),transparent_45%,rgba(14,165,233,0.1),transparent_70%,rgba(20,184,166,0.12))]" />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2.5px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-16 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-6 rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_60px_120px_-55px_rgba(9,9,11,0.9)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
              Member Lounge
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              静寂のラウンジへようこそ、{callSign} さん。
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              作品と向き合うための準備が整いました。近日公開予定の各機能を先行してご案内します。
              穏やかな場づくりにご協力いただきつつ、少しずつ広がるコンテンツをお楽しみください。
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/profile/setup"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300/50 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-300/10"
            >
              プロフィールを編集
            </Link>
            <Link
              href="/logout"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
            >
              ログアウト
            </Link>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-400/25 bg-emerald-400/10 p-6 text-slate-50 shadow-[0_35px_70px_-45px_rgba(16,185,129,0.65)]">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Current Status
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              ベータ体験へのご参加ありがとうございます。
            </h2>
            <p className="mt-3 text-sm text-emerald-100/80">
              現在、記録・共有・レコメンドの各機能を順次クローズドテスト中です。最新のリリースが完了次第、
              メールにて優先案内をお届けします。
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-200">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Quick Memo
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              開発ロードマップ
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>・ 作品ページの公開と匿名メモ投稿（Phase 0）</li>
              <li>・ 作曲家ラウンジとスローモード運用（Phase 1）</li>
              <li>・ 気分検索と近縁曲レコメンド（Phase 2）</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                クイックアクション
              </h2>
              <p className="text-sm text-slate-400">
                現在ご利用いただける項目と、まもなく開放予定の機能です。
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-200"
              >
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {action.description}
                  </p>
                </div>
                {action.href ? (
                  <Link
                    href={action.href}
                    className="mt-auto inline-flex items-center justify-center rounded-full border border-emerald-300/50 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-300/10"
                  >
                    開く
                  </Link>
                ) : (
                  <span className="mt-auto inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-400">
                    近日公開
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              開発アップデート
            </h2>
            <p className="text-sm text-slate-400">
              コミュニティを安心して楽しめるよう、段階的に機能を開放予定です。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {communityUpdates.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
                  {item.status}
                </p>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              利用規約とプライバシー
            </h2>
            <p className="text-sm text-slate-400">
              会員登録時に同意いただいた内容を、ラウンジ内でも確認できるようご用意しています。
            </p>
          </div>
          <div className="space-y-4">
            <details className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 open:ring-1 open:ring-emerald-300/30">
              <summary className="cursor-pointer list-none text-base font-semibold text-white">
                利用規約
              </summary>
              <div className="mt-4 space-y-6">
                {TERMS_SECTIONS.map((section) => (
                  <section key={section.title} className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">
                      {section.title}
                    </h3>
                    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
                      {section.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
                <div className="space-y-1 text-xs text-slate-400">
                  {TERMS_CONTACT.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>
            </details>

            <details className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 open:ring-1 open:ring-emerald-300/30">
              <summary className="cursor-pointer list-none text-base font-semibold text-white">
                プライバシーポリシー
              </summary>
              <div className="mt-4 space-y-6">
                {PRIVACY_SECTIONS.map((section) => (
                  <section key={section.title} className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">
                      {section.title}
                    </h3>
                    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
                      {section.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </details>
          </div>
        </section>

        <footer className="mb-10 text-sm text-slate-500">
          ご質問やフィードバックは{" "}
          <a
            href="mailto:support@classic-match.example"
            className="text-emerald-300 transition hover:text-emerald-200"
          >
            support@classic-match.example
          </a>{" "}
          までお気軽にお寄せください。
        </footer>
      </main>
    </div>
  );
}
