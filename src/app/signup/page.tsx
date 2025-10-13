"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CODE_LENGTH = 6;

type Step = "form" | "code";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [penName, setPenName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const [codeDigits, setCodeDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill("")
  );
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const codeValue = useMemo(() => codeDigits.join(""), [codeDigits]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(
    null
  );

  useEffect(() => {
    router.prefetch("/profile/setup");
  }, [router]);

  useEffect(() => {
    if (!pendingDestination) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const current = window.location.pathname + window.location.search;
      if (!current.startsWith("/profile/setup")) {
        window.location.href = pendingDestination;
      }
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingDestination]);

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!penName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    setLoading(true);
    setServerMessage(null);

    try {
      const response = await fetch("/api/signup/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          callSign: penName.trim(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        const message =
          data?.message ??
          "登録の事前確認に失敗しました。時間をおいて再度お試しください。";
        setServerMessage(message);
        alert(message);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Failed to validate signup", error);
      const message =
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。";
      setServerMessage(message);
      alert(message);
      setLoading(false);
      return;
    }

    const nextCode = Array.from({ length: CODE_LENGTH }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    setGeneratedCode(nextCode);
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    setStep("code");
    setLoading(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) {
      return;
    }

    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      codeInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (codeValue.length !== CODE_LENGTH) {
      return;
    }
    if (generatedCode && codeValue !== generatedCode) {
      alert("コードが一致しません。表示されているコードを入力してください。");
      return;
    }
    setLoading(true);
    setServerMessage(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          callSign: penName.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        const message =
          data?.message ??
          "登録処理に失敗しました。時間をおいて再度お試しください。";
        setServerMessage(message);
        alert(message);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Failed to complete signup", error);
      const message =
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。";
      setServerMessage(message);
      alert(message);
      setLoading(false);
      return;
    }

    const trimmedCallSign = penName.trim();
    const trimmedEmail = email.trim();
    setLoading(false);
    setRedirecting(true);
    const destination = `/profile/setup?callSign=${encodeURIComponent(trimmedCallSign)}&email=${encodeURIComponent(trimmedEmail)}`;
    setPendingDestination(destination);
    router.push(destination);
  };

  const handleResend = () => {
    const nextCode = Array.from({ length: CODE_LENGTH }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    setGeneratedCode(nextCode);
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    codeInputRefs.current[0]?.focus();
    alert("認証コードを再送しました（開発モード）。");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,197,138,0.18),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(at_20%_80%,rgba(99,102,241,0.14),transparent_45%,rgba(236,72,153,0.12),transparent_70%,rgba(56,189,248,0.16))]" />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1.5px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-start px-6 pt-12 pb-20 md:px-12 md:pt-16 md:pb-24">
        <section className="space-y-10 rounded-[32px] border border-white/10 bg-slate-950/75 p-8 shadow-[0_70px_140px_-70px_rgba(9,9,11,0.9)] backdrop-blur-xl sm:p-12">
          {redirecting ? (
            <div className="space-y-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
                Transition
              </p>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                プロフィール入力へご案内しています…
              </h1>
              <p className="text-sm text-slate-300 sm:text-base">
                そのままお待ちください。画面が切り替わらない場合はブラウザの更新をお試しください。
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  招待状にお書きください。席をご用意しております。
                </h1>
                <p className="text-sm text-slate-300 sm:text-base">
                  音の余韻を分かち合う静かな場です。呼び名と連絡先、パスワードを記入し、
                  認証コードで登録を仕上げましょう。
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/20 p-6 text-sm text-slate-300 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/70">
                  余韻メモ
                </p>
                <ul className="mt-3 space-y-2 text-slate-300">
                  <li>・ 気分タグを選ぶと、作品の提案が静かに届きます。</li>
                  <li>・ 250字のメモで感じた音の色彩を残せます。</li>
                  <li>・ 共鳴スタンプと通報仮非表示で穏やかな環境を保ちます。</li>
                </ul>
              </div>

              {serverMessage && (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {serverMessage}
                </p>
              )}

              {step === "form" ? (
                <form
                  className="space-y-6"
                  onSubmit={handleSignupSubmit}
                  noValidate
                >
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-200">
                      呼び名
                      <input
                        type="text"
                        value={penName}
                        onChange={(event) => {
                          setPenName(event.target.value);
                          if (serverMessage) {
                            setServerMessage(null);
                          }
                        }}
                        placeholder="例: 夜のアリア"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                        maxLength={40}
                        required
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-200">
                      メールアドレス
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (serverMessage) {
                            setServerMessage(null);
                          }
                        }}
                        placeholder="あなたのメールアドレス"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                        required
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-200">
                      パスワード
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          if (serverMessage) {
                            setServerMessage(null);
                          }
                        }}
                        placeholder="8文字以上を推奨"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                    disabled={
                      loading ||
                      !penName.trim() ||
                      !email.trim() ||
                      !password.trim()
                    }
                  >
                    {loading ? "送信中..." : "認証コードを送る"}
                  </button>
                </form>
              ) : (
                <form className="space-y-8" onSubmit={handleCodeSubmit} noValidate>
                  <div className="space-y-3 text-center md:text-left">
                    {generatedCode && (
                      <p className="font-mono text-sm text-emerald-300 sm:text-base">
                        開発メモ: 認証コードは {generatedCode}
                      </p>
                    )}
                    <p className="text-sm text-slate-200">
                      {email} に送信したコードを入力してください。
                    </p>
                    <div className="flex justify-center gap-3 md:justify-start">
                      {codeDigits.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(event) =>
                            handleCodeChange(index, event.target.value)
                          }
                          onKeyDown={(event) => handleCodeKeyDown(index, event)}
                          ref={(element) => {
                            codeInputRefs.current[index] = element;
                          }}
                          className="h-16 w-12 rounded-2xl border border-white/15 bg-slate-900/80 text-center text-2xl font-semibold text-white outline-none transition focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/30 sm:h-16 sm:w-14"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-sm text-emerald-300 transition hover:text-emerald-200"
                      disabled={loading}
                    >
                      コードを再送する
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                    disabled={loading || codeValue.length !== CODE_LENGTH}
                  >
                    {loading ? "確認中..." : "コードを確認する"}
                  </button>
                </form>
              )}

              <div className="space-y-3 text-sm text-slate-400">
                {step === "code" ? (
                  <p>
                    呼び名を修正する場合は{" "}
                    <button
                      type="button"
                      className="underline decoration-dotted underline-offset-4 transition hover:text-slate-200"
                      onClick={() => {
                        setStep("form");
                        setCodeDigits(Array(CODE_LENGTH).fill(""));
                        setLoading(false);
                        setGeneratedCode("");
                      }}
                    >
                      戻る
                    </button>{" "}
                    を押してください。
                  </p>
                ) : (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>すでにアカウントをお持ちですか？</span>
                    <Link
                      href="/login"
                      className="text-emerald-300 transition hover:text-emerald-200"
                    >
                      ログインはこちら
                    </Link>
                    <span className="text-slate-500">|</span>
                    <Link
                      href="/"
                      className="text-emerald-300 transition hover:text-emerald-200"
                    >
                      ホームに戻る
                    </Link>
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  登録を進めることで利用規約とプライバシーポリシーに同意したものと
                  みなされます。
                </p>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
