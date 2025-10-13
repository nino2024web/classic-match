"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionExpiredViewProps = {
  next: string;
};

const REDIRECT_DELAY_MS = 5000;

export default function SessionExpiredView({ next }: SessionExpiredViewProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(
    Math.floor(REDIRECT_DELAY_MS / 1000)
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.push(next);
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [next, router]);

  useEffect(() => {
    window.alert(
      "セッションの有効期限が切れました。5秒後にログイン前のページへ戻ります。"
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(248,113,113,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(34,211,238,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
        <div className="space-y-8 rounded-[32px] border border-white/10 bg-slate-950/75 p-10 shadow-[0_60px_120px_-60px_rgba(9,9,11,0.85)] backdrop-blur-xl sm:p-12">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              Session Timeout
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              セッションの有効期限が切れました。
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              安全のためログイン状態をリセットしました。{secondsLeft} 秒後に元のページへ移動します。
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <p>
              まだ移動しない場合は、下のボタンから今すぐ戻ることもできます。続けてご利用の際は、再度ログインしてください。
            </p>
            <div className="flex items-center justify-center">
              <Link
                href={next}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
              >
                今すぐ移動する
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
