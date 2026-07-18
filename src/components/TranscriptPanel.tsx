import { useEffect, useRef, useState } from "react";
import MathRenderer from "./MathRenderer";

interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  messages: TranscriptMessage[];
  fr: boolean;
}

/** Strip LaTeX/HTML markup for TTS. */
function forSpeech(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => m.replace(/\$\$/g, "").replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim())
    .replace(/\$([^$]*?)\$/g, (_m, inner) => inner.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim())
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/<\/?(u|b|strong|em|i)>/gi, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function TranscriptPanel({ open, onClose, messages, fr }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(0.95);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [open, messages.length]);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  function stopAll() {
    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setPaused(false);
    utterRef.current = null;
  }

  function play(id: string, text: string) {
    if (!window.speechSynthesis) return;
    stopAll();
    const u = new SpeechSynthesisUtterance(forSpeech(text).slice(0, 4500));
    u.lang = fr ? "fr-FR" : "en-GB";
    u.rate = rate;
    const voices = speechSynthesis.getVoices();
    const v = fr
      ? voices.find((v) => v.lang.startsWith("fr-CM")) || voices.find((v) => v.lang.startsWith("fr"))
      : voices.find((v) => v.lang.startsWith("en-CM")) || voices.find((v) => v.lang.startsWith("en"));
    if (v) u.voice = v;
    u.onend = () => { setPlayingId(null); setPaused(false); };
    u.onerror = () => { setPlayingId(null); setPaused(false); };
    utterRef.current = u;
    speechSynthesis.speak(u);
    setPlayingId(id);
    setPaused(false);
  }

  function togglePause() {
    if (!playingId) return;
    if (paused) { speechSynthesis.resume(); setPaused(false); }
    else { speechSynthesis.pause(); setPaused(true); }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(forSpeech(text));
  }

  function downloadAll() {
    const lines = messages.map((m) => {
      const who = m.role === "user" ? (fr ? "Vous" : "You") : "Clair";
      return `[${who}]\n${forSpeech(m.text)}\n`;
    }).join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcript.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[90] w-full sm:w-[420px] bg-card border-l border-border shadow-2xl flex flex-col"
      role="complementary"
      aria-label={fr ? "Transcription de la conversation" : "Conversation transcript"}
    >
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="flex-1 font-display text-sm">📝 {fr ? "Transcription" : "Transcript"}</h2>
        <button onClick={downloadAll} title={fr ? "Télécharger" : "Download"}
          className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted" aria-label={fr ? "Télécharger la transcription" : "Download transcript"}>
          ⬇
        </button>
        <button onClick={onClose} aria-label={fr ? "Fermer" : "Close"}
          className="text-lg text-muted-foreground hover:text-foreground px-2">✕</button>
      </header>

      {/* Global controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-shrink-0 text-xs">
        <label htmlFor="tr-rate" className="text-muted-foreground">{fr ? "Vitesse" : "Speed"}</label>
        <input id="tr-rate" type="range" min={0.6} max={1.4} step={0.05} value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="flex-1 accent-primary" aria-label={fr ? "Vitesse de lecture" : "Playback speed"} />
        <span className="w-10 text-right tabular-nums">{rate.toFixed(2)}×</span>
        {playingId && (
          <>
            <button onClick={togglePause} className="px-2 py-1 rounded-full border border-border" aria-label={paused ? (fr ? "Reprendre" : "Resume") : (fr ? "Pause" : "Pause")}>
              {paused ? "▶" : "⏸"}
            </button>
            <button onClick={stopAll} className="px-2 py-1 rounded-full border border-destructive/40 text-destructive" aria-label={fr ? "Arrêter" : "Stop"}>
              ⏹
            </button>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">{fr ? "Aucun message." : "No messages yet."}</p>
        )}
        {messages.map((m) => {
          const active = playingId === m.id;
          return (
            <article key={m.id}
              className={`rounded-lg border p-2.5 text-sm ${active ? "border-primary bg-primary/5" : "border-border bg-muted/40"}`}>
              <header className="flex items-center gap-2 mb-1">
                <span className={`text-[0.62rem] uppercase tracking-wider font-bold ${m.role === "user" ? "text-primary" : "text-secondary"}`}>
                  {m.role === "user" ? (fr ? "Vous" : "You") : "Clair"}
                </span>
                <div className="flex-1" />
                <button onClick={() => play(m.id, m.text)} disabled={!m.text}
                  className="text-[0.66rem] px-2 py-0.5 rounded-full border border-border hover:bg-muted disabled:opacity-40"
                  aria-label={`${fr ? "Écouter" : "Play"} ${m.role === "user" ? (fr ? "message utilisateur" : "user message") : (fr ? "réponse Clair" : "Clair response")}`}>
                  {active && !paused ? "🔊" : "▶"}
                </button>
                <button onClick={() => copy(m.text)}
                  className="text-[0.66rem] px-2 py-0.5 rounded-full border border-border hover:bg-muted"
                  aria-label={fr ? "Copier" : "Copy"}>⧉</button>
              </header>
              <div className="text-xs leading-relaxed break-words">
                <MathRenderer text={m.text.slice(0, 800)} />
                {m.text.length > 800 && <span className="text-muted-foreground">…</span>}
              </div>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </aside>
  );
}
