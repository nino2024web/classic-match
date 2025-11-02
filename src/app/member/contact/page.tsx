import Link from "next/link";

import ContactForm from "@/components/member/ContactForm";

export default function MemberContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_45px_90px_-45px_rgba(13,14,26,0.7)] backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-white">お問い合わせ先</h1>
          <p className="text-sm text-slate-300">
            サービスに関するご質問や不具合のご報告は、下記フォームよりお送りください。
            内容により回答までにお時間をいただく場合があります。
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-sm text-slate-200">
         
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          <p>
            ※ 本ページは会員向けのお問い合わせ窓口です。返信には数営業日いただく場合があります。
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/member"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
          >
            メンバーラウンジへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
