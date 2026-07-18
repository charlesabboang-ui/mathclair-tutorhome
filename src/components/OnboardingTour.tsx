import { useEffect, useState, useLayoutEffect } from "react";

interface Step {
  selector: string;
  titleEn: string; titleFr: string;
  bodyEn: string; bodyFr: string;
}

const STEPS: Step[] = [
  {
    selector: "[data-tour='nav-tutor']",
    titleEn: "Meet Clair — your Voice Tutor",
    titleFr: "Découvrez Clair — votre Tuteur Vocal",
    bodyEn: "This is the main feature. Tap here to open the voice tutor and ask any math question by voice, text or photo.",
    bodyFr: "C'est la fonction principale. Appuyez ici pour ouvrir le tuteur vocal et poser toute question de maths par la voix, le texte ou une photo.",
  },
  {
    selector: "[data-tour='mic-btn']",
    titleEn: "Speak your question",
    titleFr: "Parlez votre question",
    bodyEn: "Tap the microphone and ask out loud in English or French. Clair listens and answers by voice.",
    bodyFr: "Appuyez sur le micro et parlez en français ou anglais. Clair écoute et répond à voix haute.",
  },
  {
    selector: "[data-tour='transcript-btn']",
    titleEn: "Transcript & Playback",
    titleFr: "Transcription & Lecture",
    bodyEn: "Open the transcript panel to review everything that was said, replay any answer, pause, or change the reading speed.",
    bodyFr: "Ouvrez la transcription pour relire les échanges, réécouter une réponse, mettre en pause ou changer la vitesse.",
  },
  {
    selector: "[data-tour='video-btn']",
    titleEn: "AI Video Explainer",
    titleFr: "Vidéo Explicative IA",
    bodyEn: "For every answer, generate a 1-minute animated video explanation with voiceover — perfect for revision.",
    bodyFr: "Pour chaque réponse, générez une vidéo animée d'1 minute avec voix-off — idéal pour réviser.",
  },
];

const KEY = "mathclair.onboarding.done.v1";

export default function OnboardingTour({ fr, onGoTutor }: { fr: boolean; onGoTutor: () => void }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setActive(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  useLayoutEffect(() => {
    if (!active) return;
    const findTarget = () => {
      const el = document.querySelector(STEPS[step].selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };
    findTarget();
    const id = setInterval(findTarget, 400);
    window.addEventListener("resize", findTarget);
    return () => { clearInterval(id); window.removeEventListener("resize", findTarget); };
  }, [step, active]);

  if (!active) return null;

  const s = STEPS[step];
  const finish = (skip = false) => {
    localStorage.setItem(KEY, skip ? "skipped" : "done");
    setActive(false);
  };
  const next = () => {
    // Auto-navigate to tutor at step 1
    if (step === 0) onGoTutor();
    if (step === STEPS.length - 1) finish();
    else setStep(step + 1);
  };

  const pad = 8;
  const tipStyle: React.CSSProperties = rect ? {
    top: Math.min(rect.bottom + pad + 4, window.innerHeight - 240),
    left: Math.max(12, Math.min(rect.left, window.innerWidth - 340)),
  } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Dim */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={() => finish(true)} />
      {/* Highlight ring */}
      {rect && (
        <div
          className="absolute rounded-xl pointer-events-none border-2 border-primary shadow-[0_0_0_9999px_hsl(var(--background)/0.7)] transition-all"
          style={{
            top: rect.top - pad, left: rect.left - pad,
            width: rect.width + pad * 2, height: rect.height + pad * 2,
          }}
        />
      )}
      {/* Tooltip */}
      <div
        className="absolute w-[320px] max-w-[92vw] bg-card border border-border rounded-xl p-4 shadow-2xl"
        style={tipStyle}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.65rem] uppercase tracking-wider text-primary font-bold">
            {fr ? "Bienvenue" : "Welcome"} · {step + 1}/{STEPS.length}
          </span>
          <button onClick={() => finish(true)} aria-label={fr ? "Passer" : "Skip"} className="text-muted-foreground text-xs hover:text-foreground">✕</button>
        </div>
        <h3 id="tour-title" className="font-display text-base mb-1.5">{fr ? s.titleFr : s.titleEn}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{fr ? s.bodyFr : s.bodyEn}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => finish(true)} className="text-[0.7rem] text-muted-foreground hover:text-foreground px-2 py-1.5">
            {fr ? "Passer" : "Skip"}
          </button>
          <div className="flex-1 flex justify-center gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="text-[0.7rem] px-3 py-1.5 rounded-full border border-border">
              ←
            </button>
          )}
          <button onClick={next} className="text-[0.72rem] font-bold px-4 py-1.5 rounded-full bg-primary text-primary-foreground">
            {step === STEPS.length - 1 ? (fr ? "Terminer" : "Finish") : (fr ? "Suivant" : "Next")}
          </button>
        </div>
      </div>
    </div>
  );
}
