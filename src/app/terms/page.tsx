import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, validateSessionCookie } from "@/lib/session";

const sections = [
  {
    title: "第1条（適用）",
    body: [
      "本利用規約（以下、「本規約」といいます。）は、Classic Match（以下、「本サービス」といいます。）の利用条件を定めるものです。",
      "本サービスを利用するすべての登録希望者および利用者（以下、「ユーザー」といいます。）は、本規約に同意したうえで本サービスを利用するものとします。",
    ],
  },
  {
    title: "第2条（利用登録）",
    body: [
      "利用希望者が本サービスの指定方法に従い必要事項を送信し、運営が承諾することで利用登録が成立します。",
      "運営は、以下の事由があると判断した場合、登録申請を承諾しないことがあります。",
      "1. 虚偽の事項を届け出た場合",
      "2. 過去に本サービスの利用停止等の処分を受けた者からの申請である場合",
      "3. その他、運営が不適切と判断した場合",
    ],
  },
  {
    title: "第3条（アカウント管理）",
    body: [
      "ユーザーは、自己の責任においてログイン情報を管理し、第三者に利用させてはなりません。",
      "ログイン情報を第三者に利用された場合でも、当該行為はユーザー本人による利用とみなします。",
    ],
  },
  {
    title: "第4条（禁止事項）",
    body: [
      "ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。",
      "1. 法令または公序良俗に違反する行為",
      "2. 本サービスの運営を妨害する行為",
      "3. 他ユーザーまたは第三者の知的財産権等を侵害する行為",
      "4. 差別的・誹謗中傷的な表現、過度に攻撃的な投稿",
      "5. 本サービスで許可していない営業・勧誘行為",
      "6. システムに過度の負荷を与える行為",
      "7. その他、運営が不適切と判断する行為",
    ],
  },
  {
    title: "第5条（サービスの提供・変更・停止）",
    body: [
      "運営は、ユーザーへの事前告知なく、本サービスの内容変更または提供の中断・終了を行うことがあります。",
      "運営は、本サービスの提供・変更・停止によりユーザーに生じた損害について、一切の責任を負いません。",
    ],
  },
  {
    title: "第6条（知的財産権）",
    body: [
      "本サービスに関する一切の知的財産権は運営または正当な権利者に帰属します。ユーザーは、本サービスを利用する権利のみを付与され、本サービスを構成するコンテンツなどの権利を取得するものではありません。",
      "ユーザーが投稿したコンテンツの著作権はユーザーまたは正当な権利者に帰属しますが、運営は当該コンテンツを本サービスの提供・運営・改善・広報の目的で利用できるものとします。",
    ],
  },
  {
    title: "第7条（利用制限・登録抹消）",
    body: [
      "運営は、ユーザーが本規約に違反したと判断した場合、事前通知なく投稿の削除、利用停止、登録抹消等を行うことができます。",
      "運営は、本条に基づく措置によりユーザーに生じた損害について責任を負いません。",
    ],
  },
  {
    title: "第8条（免責事項）",
    body: [
      "運営は、本サービスに関してユーザーと第三者の間で生じたトラブルについて、一切の責任を負いません。",
      "運営は、本サービスに関してユーザーに発生した損害につき、運営の故意または重過失がない限り、責任を負いません。",
      "運営が責任を負う場合でも、賠償額は過去12か月間にユーザーが運営に対して支払った利用料金の総額を上限とします。",
    ],
  },
  {
    title: "第9条（規約の変更）",
    body: [
      "運営は、本規約の内容を必要に応じて変更することができます。変更後の本規約は、本サービス上に掲示した時点から効力を生じるものとします。",
      "規約変更後にユーザーが本サービスを利用した場合、変更後の本規約に同意したものとみなします。",
    ],
  },
  {
    title: "第10条（準拠法・管轄）",
    body: [
      "本規約の解釈には日本法を準拠法とします。",
      "本サービスに関して紛争が生じた場合、運営の所在地を管轄する裁判所を専属的合意管轄とします。",
    ],
  },
];

const contact = [
  "【制定日】2025年10月9日",
  "【お問い合わせ】support@classic-match.example",
];

export default async function TermsPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status === "valid") {
    redirect("/member");
  }

  if (validation.status !== "valid") {
    redirect("/signup?next=/terms");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Terms of Service
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            利用規約
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Classic Match を安心してご利用いただくための基本ルールを記載しています。
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
          <section className="space-y-2">
            {contact.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </section>
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
