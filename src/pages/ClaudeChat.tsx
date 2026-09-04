import { useState, useRef, useEffect } from "react";
import { streamClaude } from "@/lib/streamClaude";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import Seo from "@/components/Seo";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

export default function ClaudeChat() {
  const [msgs, setMsgs] = useState<Message[]>([
    { id: 0, role: "assistant", text: "Hello! I'm Claire. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    const id = Date.now();
    setMsgs((m) => [...m, { id, role: "user", text }, { id: id + 1, role: "assistant", text: "", loading: true }]);
    setBusy(true);

    const apiMessages = msgs
      .filter((m) => !m.loading)
      .map((m) => ({ role: m.role, content: m.text }));
    apiMessages.push({ role: "user", content: text });

    let assistantText = "";

    await streamClaude({
      messages: apiMessages,
      onDelta: (chunk) => {
        assistantText += chunk;
        setMsgs((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: assistantText, loading: false };
          return updated;
        });
      },
      onDone: () => setBusy(false),
      onError: (err) => {
        const isRate = /rate|429|limit/i.test(err);
        const isAuth = /unauth|401|sign/i.test(err);
        const isNet = /network|fetch|502|503|unavailable|timeout/i.test(err);
        const fallback = isAuth
          ? "⚠️ Your session has expired. Please sign in again."
          : isRate
          ? "⏱️ Too many requests. Please wait a few seconds and try again."
          : isNet
          ? "📶 Claire is temporarily unavailable. Check your connection and tap Retry below."
          : `⚠️ Something went wrong: ${err}. Tap Retry below.`;
        setMsgs((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: fallback, loading: false };
          return updated;
        });
        setBusy(false);
      },
    });
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <Seo page="tutor" lang="en" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          C
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Claire</p>
          <p className="text-[0.69rem] text-muted-foreground">
            {busy ? "⏳ Thinking…" : "Online • Anthropic"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 flex flex-col gap-3">
          {msgs.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                    C
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2.5 text-sm leading-relaxed break-words ${
                    isUser
                      ? "rounded-[13px_4px_13px_13px] bg-primary text-primary-foreground"
                      : "rounded-[4px_13px_13px_13px] bg-muted text-foreground"
                  }`}
                >
                  {m.loading ? (
                    <div className="flex gap-1">
                      {[1, 2, 3].map((d) => (
                        <span key={d} className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse inline-block" />
                      ))}
                    </div>
                  ) : isUser ? (
                    <p>{m.text}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-destructive flex-shrink-0 flex items-center justify-center text-xs">
                    🧑
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message Claire…"
          className="flex-1 bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={send}
          disabled={busy}
          aria-label="Send message"
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
