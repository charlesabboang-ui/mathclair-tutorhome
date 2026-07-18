import { useEffect, useMemo, useRef, useState } from "react";
import MathRenderer from "./MathRenderer";

interface Props {
  open: boolean;
  onClose: () => void;
  text: string;
  question?: string;
  fr: boolean;
}

/** Split answer into scenes of roughly equal spoken length. Target ~60s total. */
function buildScenes(text: string, fr: boolean): { title: string; body: string; speak: string }[] {
  const clean = text
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/<\/?(u|b|strong|em|i)>/gi, "")
    .trim();

  // Split on numbered steps / paragraph breaks / sentence boundaries
  const stepRe = /(?:^|\n)\s*(?:Step|Étape)\s*\d+\s*[:.\-]/gi;
  let parts: string[] = [];
  if (stepRe.test(clean)) {
    parts = clean.split(stepRe).map((s) => s.trim()).filter(Boolean);
  } else {
    parts = clean.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (parts.length < 3) parts = clean.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  }

  // Group into 6-8 scenes
  const target = Math.min(8, Math.max(4, parts.length));
  const scenes: string[] = [];
  const chunk = Math.ceil(parts.length / target);
  for (let i = 0; i < parts.length; i += chunk) scenes.push(parts.slice(i, i + chunk).join(" "));

  return scenes.map((s, i) => {
    const title = `${fr ? "Étape" : "Step"} ${i + 1}`;
    const speakText = s
      .replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => inner.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " "))
      .replace(/\$([^$]*?)\$/g, (_m, inner) => inner.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " "))
      .replace(/\s{2,}/g, " ")
      .trim();
    return { title, body: s, speak: speakText };
  });
}

export default function VideoExplainerModal({ open, onClose, text, question, fr }: Props) {
  const scenes = useMemo(() => (open ? buildScenes(text, fr) : []), [open, text, fr]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalTargetSec = 60;
  const perScene = scenes.length ? totalTargetSec / scenes.length : 6;

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sceneStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      stop();
      setIdx(0); setElapsed(0);
    }
  }, [open]);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - elapsed * 1000;
    const tick = () => {
      setElapsed((performance.now() - start) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  function speakScene(i: number) {
    if (!scenes[i] || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(scenes[i].speak.slice(0, 600));
    u.lang = fr ? "fr-FR" : "en-GB";
    u.rate = 0.95;
    const voices = speechSynthesis.getVoices();
    const v = fr
      ? voices.find((v) => v.lang.startsWith("fr-CM")) || voices.find((v) => v.lang.startsWith("fr"))
      : voices.find((v) => v.lang.startsWith("en-CM")) || voices.find((v) => v.lang.startsWith("en"));
    if (v) u.voice = v;
    u.onend = () => {
      // Advance to next scene when TTS finishes (only if still playing)
      if (!utterRef.current) return;
      if (i + 1 < scenes.length) {
        setIdx(i + 1);
        sceneStartRef.current = performance.now();
        speakScene(i + 1);
      } else {
        setPlaying(false);
      }
    };
    utterRef.current = u;
    speechSynthesis.speak(u);
  }

  function play() {
    if (!scenes.length) return;
    setPlaying(true);
    sceneStartRef.current = performance.now();
    speakScene(idx);
  }
  function pause() {
    speechSynthesis.pause();
    setPlaying(false);
  }
  function resume() {
    speechSynthesis.resume();
    setPlaying(true);
  }
  function stop() {
    speechSynthesis.cancel();
    utterRef.current = null;
    setPlaying(false);
  }
  function restart() {
    stop();
    setIdx(0);
    setElapsed(0);
    setTimeout(play, 100);
  }

  if (!open) return null;

  const scene = scenes[idx];
  const progressPct = scenes.length ? ((idx + Math.min(1, (performance.now() - sceneStartRef.current) / 1000 / perScene)) / scenes.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/90 backdrop-blur-sm p-3" role="dialog" aria-modal="true" aria-label={fr ? "Vidéo explicative" : "Video explainer"}>
      <div className="w-full max-w-3xl bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
          <span className="text-xs uppercase tracking-wider font-bold text-primary">🎬 {fr ? "Vidéo Explicative IA" : "AI Video Explainer"}</span>
          <span className="text-[0.65rem] text-muted-foreground">~{Math.round(perScene * scenes.length)}s</span>
          <div className="flex-1" />
          <button onClick={() => { stop(); onClose(); }} aria-label={fr ? "Fermer" : "Close"} className="text-lg text-muted-foreground hover:text-foreground px-2">✕</button>
        </header>

        {/* Stage */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-background via-card to-muted overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.4), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)/0.4), transparent 40%)" }} />
          {question && (
            <div className="absolute top-3 left-3 right-3 text-[0.7rem] text-muted-foreground truncate">
              ❓ {question}
            </div>
          )}
          <div key={idx} className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 msg-enter">
            <div className="text-primary text-xs uppercase tracking-[0.3em] font-bold mb-3">{scene?.title || "—"}</div>
            <div className="max-w-2xl text-center text-foreground text-base md:text-xl leading-relaxed">
              {scene && <MathRenderer text={scene.body} />}
            </div>
            <div className="absolute bottom-3 right-3 text-[0.6rem] text-muted-foreground">
              {idx + 1} / {scenes.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted flex-shrink-0" aria-hidden="true">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <button onClick={restart} className="px-3 py-1.5 rounded-full border border-border text-xs" aria-label={fr ? "Recommencer" : "Restart"}>↺</button>
          {!playing ? (
            <button onClick={idx === 0 && !utterRef.current ? play : resume}
              className="px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold" aria-label={fr ? "Lire" : "Play"}>
              ▶ {fr ? "Lire" : "Play"}
            </button>
          ) : (
            <button onClick={pause} className="px-5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-bold" aria-label={fr ? "Pause" : "Pause"}>
              ⏸ Pause
            </button>
          )}
          <button onClick={() => { const i = Math.max(0, idx - 1); stop(); setIdx(i); }} className="px-3 py-1.5 rounded-full border border-border text-xs" aria-label={fr ? "Précédent" : "Previous"}>◀</button>
          <button onClick={() => { const i = Math.min(scenes.length - 1, idx + 1); stop(); setIdx(i); }} className="px-3 py-1.5 rounded-full border border-border text-xs" aria-label={fr ? "Suivant" : "Next"}>▶</button>
          <div className="flex-1" />
          <span className="text-[0.65rem] text-muted-foreground">{elapsed.toFixed(1)}s / ~{Math.round(perScene * scenes.length)}s</span>
        </div>
        <p className="text-[0.6rem] text-muted-foreground px-4 pb-2 leading-snug">
          {fr
            ? "Vidéo générée à partir de la réponse : animation synchronisée avec la voix de Clair (voix camerounaise si disponible)."
            : "Generated from the answer: animation synced with Clair's voice (Cameroonian voice when available)."}
        </p>
      </div>
    </div>
  );
}
