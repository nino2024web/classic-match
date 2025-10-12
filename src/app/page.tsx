import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="absolute inset-0 -z-20" aria-hidden>
        <div className="absolute inset-0 bg-[url('/landing-piano-sm.jpg')] bg-cover bg-center sm:bg-[url('/landing-piano-md.jpg')] lg:bg-[url('/landing-piano-lg.jpg')]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#120c07]/55 via-[#1d1120]/45 to-[#0b1224]/55 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,244,219,0.45),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(182,148,113,0.35),transparent_60%)]" />
      </div>
      <main className="mx-auto flex max-w-3xl flex-col px-6 py-36 sm:py-[180px]">
        <section className="space-y-10 rounded-[32px] border border-white/20 bg-[rgba(15,17,28,0.82)] p-12 text-center shadow-[0_45px_90px_-45px_rgba(12,13,24,0.75)] backdrop-blur-lg sm:p-16 sm:text-left">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500" aria-hidden />
            静寂の譜面台
          </p>
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl sm:leading-snug">
              クラシック作品に集中できる、静かなコミュニティ。
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 sm:mx-0 sm:text-base">
              気分に合う作品を提案し、短いメモと共鳴スタンプで静かにシェアする場所です。会員登録なしでも一部の作品情報を閲覧できます。
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-start sm:justify-start">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              会員登録（無料）
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/50 hover:bg-white/10"
            >
              ログインはこちら
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
