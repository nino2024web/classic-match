"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

import { ERA_COMPOSERS, EraKey } from "@/lib/composers";

type Message = {
  id: string;
  role: "user" | "system";
  content: string;
  era: EraKey;
  composer?: string;
  timestamp: number;
};

const eraLabels: { key: EraKey; description: string }[] = [
  { key: "バロック", description: "祈りと秩序が息づく古い響き" },
  { key: "古典派", description: "均整の取れた構築美と明澄な色彩" },
  { key: "ロマン派", description: "感情のうねりと物語の豊かさ" },
  { key: "近代", description: "色彩とリズムの冒険" },
  { key: "現代", description: "静寂と実験が交差する現在地" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function systemResponse(era: EraKey, composer: string | undefined, prompt: string) {
  const eraSnippet = eraLabels.find((item) => item.key === era)?.description ?? "";
  if (!composer) {
    return `【${era}】${eraSnippet}\n` + "作品の相談ありがとうございます。気になる作曲家を一人選ぶと、作品候補のお話が進めやすくなります。";
  }

  return `【${composer}】${eraSnippet}\n` + `「${prompt}」に合いそうな作品を次回リリース時にご案内できるようメモしました。`;
}

export default function MemberChat() {
  const [selectedEra, setSelectedEra] = useState<EraKey>("ロマン派");
  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const composerOptions = useMemo(() => ERA_COMPOSERS[selectedEra] ?? [], [selectedEra]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    const composer = activeComposer ?? undefined;
    const timestamp = Date.now();

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      era: selectedEra,
      composer,
      timestamp,
    };

    const systemMessage: Message = {
      id: generateId(),
      role: "system",
      content: systemResponse(selectedEra, composer, text),
      era: selectedEra,
      composer,
      timestamp: timestamp + 1,
    };

    setMessages((prev) => [...prev, userMessage, systemMessage]);
    setInput("");

    window.requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  };

  return (
    <section className="space-y-6 rounded-[36px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_60px_120px_-65px_rgba(9,9,11,0.9)]">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-white sm:text-xl">静かなディスカバリーチャット</h2>
        <p className="text-sm text-slate-400">
          気分に合う作品を見つけるための下書きスペースです。時代と作曲家を選び、思いついたフレーズや気分をメモしてみましょう。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {eraLabels.map((era) => {
          const active = selectedEra === era.key;
          return (
            <button
              key={era.key}
              type="button"
              onClick={() => {
                setSelectedEra(era.key);
                setActiveComposer(null);
              }}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100"
                  : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              {era.key}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">作曲家を選択</p>
        <div className="flex flex-wrap gap-2">
          {composerOptions.map((composer) => {
            const active = activeComposer === composer;
            return (
              <button
                key={composer}
                type="button"
                onClick={() =>
                  setActiveComposer((current) => (current === composer ? null : composer))
                }
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-sky-300/70 bg-sky-300/20 text-sky-100"
                    : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {composer}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-h-[320px] space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200"
      >
        {messages.length === 0 ? (
          <div className="space-y-2 text-sm text-slate-400">
            <p>まだメッセージはありません。</p>
            <p>例: 「静かな午後に似合うチェロの曲はありますか？」</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                  : "border-white/10 bg-white/8 text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                <span>{message.role === "user" ? "You" : "Classic Match"}</span>
                <span className="text-slate-500">/</span>
                <span>{message.era}</span>
                {message.composer ? (
                  <>
                    <span className="text-slate-500">/</span>
                    <span>{message.composer}</span>
                  </>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">
          メッセージを書く
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={1}
            placeholder="気分や聴きたいシチュエーションを書き留めてください。"
            className="mt-2 h-[2.75rem] w-full resize-none overflow-y-hidden rounded-3xl border border-white/10 bg-white/8 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70 focus:bg-slate-900/70 focus:ring-2 focus:ring-emerald-300/30"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!input.trim()}
          >
            送信（下書き保存）
          </button>
        </div>
      </form>

      <p className="text-xs text-slate-500">
        現在はローカル保存のみを行っています。正式な作品レコメンドは次期リリースで提供予定です。
      </p>
    </section>
  );
}
