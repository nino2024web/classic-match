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

type View = "login" | "request" | "reset";

const CODE_LENGTH = 6;

export default function LoginView() {
  const router = useRouter();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeDigits, setCodeDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill("")
  );
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const codeValue = useMemo(() => codeDigits.join(""), [codeDigits]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    router.prefetch("/member");
    router.prefetch("/signup");
    router.prefetch("/admin");
  }, [router]);

  useEffect(() => {
    if (view === "reset") {
      codeInputRefs.current[0]?.focus();
    }
  }, [view]);

  const resetCodeInputs = () => {
    setCodeDigits(Array(CODE_LENGTH).fill(""));
  };

  const switchView = (nextView: View) => {
    setView(nextView);
    setMessage(null);
    setSuccessMessage(null);
    setLoading(false);
    if (nextView === "login") {
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setGeneratedCode(null);
      resetCodeInputs();
    }
    if (nextView === "request") {
      setGeneratedCode(null);
      setNewPassword("");
      setConfirmPassword("");
      resetCodeInputs();
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    if (!email.trim() || !password.trim()) {
      setMessage("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        callSign?: string;
      } | null;

      if (response.ok) {
        setLoading(false);
        router.push("/member");
        return;
      }

      const fallbackMessage =
        data?.message ??
        "ログインに失敗しました。時間をおいて再度お試しください。";

      const adminResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const adminData = (await adminResponse.json().catch(() => null)) as
        | { status?: string; message?: string }
        | null;

      if (adminResponse.ok && adminData?.status === "ok") {
        setLoading(false);
        router.push("/admin");
        return;
      }

      const adminMessage =
        adminData?.message ?? fallbackMessage;
      setMessage(adminMessage);
      setLoading(false);
    } catch (error) {
      console.error("Failed to login", error);
      setMessage(
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。"
      );
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    if (!email.trim()) {
      setMessage("メールアドレスを入力してください。");
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        code?: string;
        expiresAt?: string;
      } | null;

      if (!response.ok) {
        const errorMessage =
          data?.message ??
          "パスワード再設定コードの発行に失敗しました。時間をおいて再度お試しください。";
        setMessage(errorMessage);
        setLoading(false);
        return;
      }

      const nextCode = data?.code ?? "";
      setGeneratedCode(nextCode);
      resetCodeInputs();
      setLoading(false);
      setSuccessMessage(
        "認証コードを画面に表示しました。6桁のコードと新しいパスワードを入力してください。"
      );
      setView("reset");
    } catch (error) {
      console.error("Failed to request password reset", error);
      setMessage(
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。"
      );
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    if (codeValue.length !== CODE_LENGTH) {
      setMessage("6桁の認証コードを入力してください。");
      return;
    }

    if (!newPassword.trim()) {
      setMessage("新しいパスワードを入力してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("確認用パスワードが一致しません。");
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: codeValue,
          password: newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        callSign?: string;
      } | null;

      if (!response.ok) {
        const errorMessage =
          data?.message ??
          "パスワードの再設定に失敗しました。時間をおいて再度お試しください。";
        setMessage(errorMessage);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/member");
    } catch (error) {
      console.error("Failed to reset password", error);
      setMessage(
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。"
      );
      setLoading(false);
    }
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
      event.preventDefault();
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(at_25%_80%,rgba(236,72,153,0.14),transparent_40%,rgba(45,212,191,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-start px-6 pt-12 pb-20 md:px-12 md:pt-16 md:pb-24">
        <section className="space-y-8 rounded-[32px] border border-white/10 bg-slate-950/75 p-8 shadow-[0_70px_140px_-70px_rgba(9,9,11,0.9)] backdrop-blur-xl sm:p-12">
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              開演前の最終調整です。もう一度深呼吸しましょう。
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              会員の方はメールアドレスとパスワードでログインできます。パスワードを忘れた場合は、6桁のコードで再発行してください。
            </p>
          </div>

          {message && (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {message}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </p>
          )}

          {view === "login" && (
            <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-200">
                  メールアドレス
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="あなたのメールアドレス"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-300/30"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  パスワード
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-300/30"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "処理中..." : "ログインする"}
              </button>
            </form>
          )}

          {view === "login" && (
            <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => switchView("request")}
                className="text-sky-300 transition hover:text-sky-200"
              >
                パスワードをお忘れの方はこちら
              </button>
              <div>
                まだ登録がお済みでない方は{" "}
                <Link
                  href="/signup"
                  className="text-emerald-300 transition hover:text-emerald-200"
                >
                  無料会員登録
                </Link>
              </div>
            </div>
          )}

          {view === "request" && (
            <form
              className="space-y-6"
              onSubmit={handleRequestSubmit}
              noValidate
            >
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  登録済みのメールアドレスに対して、6桁の認証コードを発行します。開発中はコードをこの画面に直接表示します。
                </p>
                <label className="block text-sm font-medium text-slate-200">
                  メールアドレス
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="あなたのメールアドレス"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-300/30"
                    required
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
                >
                  ログインに戻る
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "発行中..." : "コードを発行する"}
                </button>
              </div>
            </form>
          )}

          {view === "reset" && (
            <form className="space-y-8" onSubmit={handleResetSubmit} noValidate>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="font-medium text-white">
                  認証コードを入力し、新しいパスワードを設定してください。
                </p>
                {generatedCode && (
                  <p className="text-xs text-emerald-200">
                    開発用コード:{" "}
                    <span className="font-mono text-base">{generatedCode}</span>
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-3">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        codeInputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleCodeChange(index, event.currentTarget.value)
                      }
                      onKeyDown={(event) => handleCodeKeyDown(index, event)}
                      className="h-12 w-12 rounded-2xl border border-white/15 bg-slate-900/70 text-center text-lg font-semibold text-white outline-none transition focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/30"
                    />
                  ))}
                </div>

                <label className="block text-sm font-medium text-slate-200">
                  新しいパスワード
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="新しいパスワード"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-300/30"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  新しいパスワード（確認）
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="確認のため再入力してください"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-300/30"
                    required
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => switchView("request")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
                >
                  コードを再発行する
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "更新中..." : "パスワードを更新する"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
