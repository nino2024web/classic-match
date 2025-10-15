"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PUBLIC_CHAT_MAX_LENGTH } from "@/lib/constants";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
};

export default function PublicChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const latestTimestampRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/public-chat", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("failed");
      }

      const data = (await response.json()) as {
        status?: string;
        messages?: ChatMessage[];
      } | null;

      if (!data || data.status !== "ok" || !data.messages) {
        throw new Error("unexpected");
      }

      setMessages(data.messages);
      latestTimestampRef.current =
        data.messages.length > 0
          ? data.messages[data.messages.length - 1].createdAt
          : null;
      setError(null);
    } catch (err) {
      console.error("Failed to fetch public chat messages", err);
      setError(
        "メッセージの読み込みに失敗しました。しばらくしてから再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const timer = window.setInterval(fetchMessages, 3000);
    return () => {
      window.clearInterval(timer);
    };
  }, [fetchMessages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rawLength = input.length;
    const trimmed = input.trim();
    if (trimmed.length === 0 || rawLength > PUBLIC_CHAT_MAX_LENGTH) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        const message =
          data?.message ??
          "メッセージの送信に失敗しました。時間をおいて再度お試しください。";
        setError(message);
        return;
      }

      setInput("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to submit public chat message", err);
      setError(
        "メッセージの送信に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = input.length;
  const trimmedInput = input.trim();
  const isOverLimit = charCount > PUBLIC_CHAT_MAX_LENGTH;
  const canSubmit = trimmedInput.length > 0 && !isOverLimit;
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages]);

  return (
    <section className="space-y-6 rounded-[36px] border border-white/15 bg-slate-900/75 p-6 shadow-[0_60px_120px_-60px_rgba(9,9,11,0.9)]">
      <header className="space-y-2">
        <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
          メインラウンジ・チャット
        </h2>
        <div className="space-y-2 rounded-xl border border-white/15 bg-white/10 p-4 text-left text-sm text-slate-200">
          <p>作品の気分や今日の感想を気軽に書き込めるオープンチャットです。</p>
          <p>誰でも参加できるため、匿名にしてあります。</p>
        </div>
      </header>

      <form
        className="flex flex-col gap-3 text-sm text-slate-200 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
      >
        <label className="flex-1 space-y-1">
          <div className="relative">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className={`h-full w-full resize-none rounded-2xl border px-4 py-2 pr-14 text-sm outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30 ${
              isOverLimit
                ? "border-rose-400/70 bg-rose-400/10 text-rose-100"
                : "border-white/15 bg-white/10 text-white"
            }`}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.nativeEvent as KeyboardEvent).isComposing
              ) {
                return;
              }
              if (!event.shiftKey && event.key === "Enter") {
                event.preventDefault();
                (
                  event.currentTarget.form as HTMLFormElement | null
                )?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
              }
            }}
          />
            <span
              className={`pointer-events-none absolute bottom-2 right-3 text-base ${
                isOverLimit
                  ? "font-semibold text-rose-400"
                  : charCount === 0
                  ? "text-slate-500"
                  : "text-slate-300"
              }`}
            >
              ({charCount}/{PUBLIC_CHAT_MAX_LENGTH})
            </span>
          </div>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[2.25rem] sm:min-w-[88px]"
          disabled={submitting || !canSubmit}
        >
          {submitting ? "送信中..." : "送信"}
        </button>
      </form>

      {error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="overflow-y-auto text-sm text-slate-200 min-h-[720px] max-h-[720px]">
        {loading || sortedMessages.length === 0
          ? null
          : sortedMessages.map((message) => {
              const postedAt = new Date(message.createdAt).toLocaleString(
                "ja-JP",
                {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
              return (
                <article
                  key={message.id}
                  className="mb-3 flex items-start gap-3 last:mb-0"
                >
                  <time className="w-24 flex-shrink-0 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {postedAt}
                  </time>
                  <p className="whitespace-pre-wrap text-sm text-slate-100">
                    {message.content}
                  </p>
                </article>
              );
            })}
      </div>
    </section>
  );
}
