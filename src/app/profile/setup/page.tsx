"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

const ERA_OPTIONS = ["バロック", "古典派", "ロマン派", "近代", "現代"];

const MOOD_OPTIONS = [
  "透明",
  "祈り",
  "静謐",
  "陽光",
  "焦燥",
  "深呼吸",
  "夜想",
  "凛然",
  "軽やか",
  "余韻",
];

const MAX_MOOD_SELECTION = 3;

export default function ProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          プロフィールを読み込んでいます…
        </div>
      }
    >
      <ProfileSetupContent />
    </Suspense>
  );
}

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCallSign = searchParams.get("callSign") ?? "";
  const initialEmail = searchParams.get("email") ?? "";

  const [callSign, setCallSign] = useState(initialCallSign);
  const [email, setEmail] = useState(initialEmail);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [intro, setIntro] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const moodCount = selectedMoods.length;
    return (
      callSign.trim().length > 0 &&
      email.trim().length > 0 &&
      selectedEras.length > 0 &&
      moodCount > 0 &&
      moodCount <= MAX_MOOD_SELECTION &&
      agreed &&
      !loading
    );
  }, [callSign, email, selectedEras, selectedMoods, agreed, loading]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | {
              status?: string;
              profile?: {
                email?: string;
                callSign?: string;
                eras?: string[];
                moods?: string[];
                intro?: string;
                agreed?: boolean;
              };
            }
          | null;

        if (
          !active ||
          !data ||
          data.status !== "ok" ||
          !data.profile
        ) {
          return;
        }

        const profile = data.profile;

        setCallSign(profile.callSign ?? "");
        setEmail(profile.email ?? "");
        setSelectedEras(
          Array.isArray(profile.eras)
            ? profile.eras.filter(
                (item): item is string => typeof item === "string"
              )
            : []
        );
        setSelectedMoods(
          Array.isArray(profile.moods)
            ? profile.moods
                .filter((item): item is string => typeof item === "string")
                .slice(0, MAX_MOOD_SELECTION)
            : []
        );
        setIntro(profile.intro ?? "");
        setAgreed(Boolean(profile.agreed));
      } catch (error) {
        console.error("Failed to preload profile", error);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const toggleEra = (era: string) => {
    setSelectedEras((prev) =>
      prev.includes(era) ? prev.filter((item) => item !== era) : [...prev, era]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood)) {
        return prev.filter((item) => item !== mood);
      }
      if (prev.length >= MAX_MOOD_SELECTION) {
        return prev;
      }
      return [...prev, mood];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setServerMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          callSign: callSign.trim(),
          eras: selectedEras,
          moods: selectedMoods,
          intro: intro.trim(),
          agreed,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | { status?: string }
        | null;

      if (!response.ok) {
        const message =
          data && "message" in data && data.message
            ? data.message
            : "プロフィールの保存に失敗しました。時間をおいて再度お試しください。";
        setServerMessage(message);
      } else {
        setSuccessMessage(
          "プロフィールを保存しました。静かな時間の準備が整いました。"
        );
        window.setTimeout(() => {
          router.push("/member");
        }, 1600);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      setServerMessage(
        "サーバーに接続できません。ネットワーク状態を確認し、再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,197,138,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(at_20%_85%,rgba(236,72,153,0.14),transparent_45%,rgba(14,165,233,0.1),transparent_70%,rgba(74,222,128,0.12))]" />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-start px-6 pt-12 pb-20 md:px-12 md:pt-16 md:pb-24">
        <section className="space-y-8 rounded-[32px] border border-white/10 bg-slate-950/75 p-8 shadow-[0_70px_140px_-70px_rgba(9,9,11,0.9)] backdrop-blur-xl sm:p-12">
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              落ち着きのある譜面に仕上げます。
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">
              呼び名と静かな約束、最初の感情タグを整えたら、ホームの静寂へそっと送り出します。
            </p>
          </div>

          {serverMessage && (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {serverMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </p>
          )}

          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-200">
                呼び名
                <input
                  type="text"
                  value={callSign}
                  onChange={(event) => setCallSign(event.target.value)}
                  placeholder="例: 夜のアリア"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                  maxLength={40}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                メールアドレス
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="あなたのメールアドレス"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                  required
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  好きな時代（複数選択可）
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ERA_OPTIONS.map((era) => {
                    const active = selectedEras.includes(era);
                    return (
                      <button
                        key={era}
                        type="button"
                        onClick={() => toggleEra(era)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
                            : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                        }`}
                        aria-pressed={active}
                      >
                        {era}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  初期感情タグ（1〜{MAX_MOOD_SELECTION} 個）
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  音の鳴くままに今の感情を 1〜3 語選んでください。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => {
                    const active = selectedMoods.includes(mood);
                    const disabled =
                      !active && selectedMoods.length >= MAX_MOOD_SELECTION;
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => toggleMood(mood)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          active
                            ? "border-sky-300/70 bg-sky-300/20 text-sky-100"
                            : disabled
                            ? "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                            : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                        }`}
                        aria-pressed={active}
                        disabled={disabled}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                ひとこと自己紹介（任意）
                <textarea
                  value={intro}
                  onChange={(event) => setIntro(event.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="例: 弦楽四重奏の透明な響きに弱いです。夜更けに小さな曲を集めています。"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
                />
              </label>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-medium text-white">静かなコミュニティの約束</p>
              <ul className="space-y-1 text-xs text-slate-300">
                <li>・ 音に敬意を払い、作品を主語に語ります。</li>
                <li>・ 人には寛容に。個人攻撃や断定を避けましょう。</li>
                <li>・ 穏やかな場づくりに協力してください。</li>
              </ul>
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-300/40"
                  required
                />
                同意します
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
              disabled={!canSubmit}
            >
              {loading ? "保存中..." : "プロフィールを保存する"}
            </button>
          </form>

          <div className="text-sm text-slate-400">
            <Link
              href="/logout"
              className="text-emerald-300 transition hover:text-emerald-200"
            >
              ログアウト
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
