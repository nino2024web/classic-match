"use client";

import { FormEvent, useState } from "react";

const SUBJECT_OPTIONS = [
  "サービスの使い方について",
  "不具合の報告",
  "アカウントやログインに関するご相談",
  "コラボレーションや取材のご依頼",
  "その他のお問い合わせ",
];

export default function ContactForm() {
  const defaultSubject = SUBJECT_OPTIONS[0];
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });

      const data = (await response.json().catch(() => null)) as
        | { status?: string; message?: string }
        | null;

      if (response.ok && data?.status === "ok") {
        setFeedback("お問い合わせを受け付けました。折り返しまでしばらくお待ちください。");
        setSubject(defaultSubject);
        setMessage("");
      } else {
        setFeedback(
          data?.message ??
            "お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。"
        );
      }
    } catch (error) {
      console.error("Failed to send contact request", error);
      setFeedback("サーバーに接続できませんでした。通信状況をご確認ください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-slate-200">
        お問い合わせ内容
        <select
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option} value={option} className="bg-slate-900 text-white">
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-200">
        詳細
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          maxLength={2000}
          required
          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30 min-h-[220px]"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "送信中..." : "送信"}
        </button>
      </div>

      {feedback && (
        <p className="text-sm text-emerald-200">{feedback}</p>
      )}
    </form>
  );
}
