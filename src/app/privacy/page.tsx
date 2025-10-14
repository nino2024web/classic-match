import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, validateSessionCookie } from "@/lib/session";

const sections = [
  {
    title: "1. 基本方針",
    body: [
      "Classic Match（以下、「本サービス」といいます。）は、ユーザーから取得する個人情報・データを適切に取り扱い、プライバシーの保護を最優先します。",
      "本ポリシーは、本サービスにおける個人情報の取得・利用・保存・開示に関する方針を定めるものです。",
    ],
  },
  {
    title: "2. 取得する情報",
    body: [
      "本サービスは、以下の情報を取得することがあります。",
      "1. 登録情報：メールアドレス、呼び名（ペンネーム）、設定したパスワードなど",
      "2. プロフィール情報：選択した時代や感情タグ、任意の自己紹介など",
      "3. 利用ログ：アクセス日時、IPアドレス、ブラウザ情報、操作履歴",
      "4. 通信内容：お問い合わせ内容など、本サービスへの連絡時に取得した情報",
    ],
  },
  {
    title: "3. 利用目的",
    body: [
      "取得した情報は、以下の目的で利用します。",
      "1. 本サービスの提供、運営、ユーザーサポートのため",
      "2. ユーザー本人確認、不正利用防止、セキュリティ向上のため",
      "3. サービス品質向上、新機能開発、利用状況の分析のため",
      "4. 規約改定等の重要な通知を行うため",
      "5. 事前に同意を得た目的の範囲で情報を使用するため",
    ],
  },
  {
    title: "4. 外部委託・第三者提供",
    body: [
      "運営は、上記利用目的の達成に必要な範囲で業務を委託する場合があります。この場合、適切な委託先を選定し、個人情報保護に関する契約を締結したうえで管理・監督を行います。",
      "法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。",
    ],
  },
  {
    title: "5. Cookie 等の利用",
    body: [
      "本サービスでは、セッション管理や利便性向上のため Cookie や類似の技術を利用することがあります。ブラウザ設定により Cookie の受け取りを拒否できますが、一部機能が利用できなくなる場合があります。",
    ],
  },
  {
    title: "6. 情報の保存期間",
    body: [
      "取得した情報は、利用目的の達成に必要な期間または法令で定められた期間保存します。保存期間が満了した情報は、適切な方法で削除または匿名化します。",
    ],
  },
  {
    title: "7. 安全管理",
    body: [
      "運営は、不正アクセス、個人情報の漏えい・改ざん・滅失を防止するため、必要かつ適切な安全管理措置を講じます。",
      "万が一事故が発生した場合は、速やかに原因究明と被害の拡大防止に努め、必要に応じてユーザーへの通知や公的機関への報告を行います。",
    ],
  },
  {
    title: "8. ユーザーの権利",
    body: [
      "ユーザーは、自己の個人情報について、開示・訂正・利用停止・削除を求めることができます。",
      "上記の請求を希望する場合は、本人確認のうえ、合理的な範囲で対応します。なお、法令上保存義務がある情報など、請求に応じられない場合があります。",
    ],
  },
  {
    title: "9. ポリシーの変更",
    body: [
      "本ポリシーの内容は、必要に応じて改定することがあります。変更後のポリシーは、本サービス上に掲示した時点で効力を生じます。",
      "重要な変更を行う場合には、ユーザーに個別通知またはサービス上で明示的に案内します。",
    ],
  },
  {
    title: "10. お問い合わせ",
    body: [
      "本ポリシーおよび個人情報の取り扱いに関するお問い合わせは、下記窓口までお願いいたします。",
      "【お問い合わせ】privacy@classic-match.example",
      "【制定日】2025年10月9日",
    ],
  },
];

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
          {sections.map((section) => (
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
