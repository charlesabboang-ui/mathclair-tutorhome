import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { streamClaude } from "@/lib/streamClaude";
import MathRenderer from "@/components/MathRenderer";

interface Props {
  lang: "en" | "fr";
  fr: boolean;
  tutorMsg: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

export default function TutorChat({ lang, fr, tutorMsg }: Props) {
  const { profile } = useAuth();
  const [msgs, setMsgs] = useState<Message[]>([{
    id: 0, role: "assistant",
    text: fr
      ? `Bonjour ${profile?.name?.split(" ")[0] || ""} ! 🎓 Je suis Clair, votre tuteur en mathématiques à domicile. Posez votre question par texte ou par voix !`
      : `Hello ${profile?.name?.split(" ")[0] || ""}! 🎓 I'm Clair, your math tutor at Home. Ask any question by text or voice!`,
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (tutorMsg) setInput(tutorMsg); }, [tutorMsg]);

  // Ensure voices are loaded (critical for mobile)
  useEffect(() => {
    const loadVoices = () => speechSynthesis?.getVoices();
    loadVoices();
    speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);
    return () => speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
  }, []);

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    setSpeaking(true);

    // Clean LaTeX and markdown for natural speech
    const clean = text
      .replace(/\$\$[\s\S]*?\$\$/g, (m) => {
        return m.replace(/\$\$/g, "").replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, fr ? "$1 sur $2" : "$1 over $2")
          .replace(/\\sqrt\{([^}]*)\}/g, fr ? "racine carrée de $1" : "square root of $1")
          .replace(/\\(times|cdot)/g, fr ? " fois " : " times ")
          .replace(/\\(pm)/g, fr ? " plus ou moins " : " plus or minus ")
          .replace(/\\(leq|le)/g, fr ? " inférieur ou égal à " : " less than or equal to ")
          .replace(/\\(geq|ge)/g, fr ? " supérieur ou égal à " : " greater than or equal to ")
          .replace(/\\(neq|ne)/g, fr ? " différent de " : " not equal to ")
          .replace(/\\(approx)/g, fr ? " environ " : " approximately ")
          .replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim();
      })
      .replace(/\$([^\$]*?)\$/g, (_m, inner) => {
        return inner
          .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, fr ? "$1 sur $2" : "$1 over $2")
          .replace(/\\sqrt\{([^}]*)\}/g, fr ? "racine carrée de $1" : "square root of $1")
          .replace(/\\(times|cdot)/g, fr ? " fois " : " times ")
          .replace(/\\(pm)/g, fr ? " plus ou moins " : " plus or minus ")
          .replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim();
      })
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,3}\s*/g, "")
      .replace(/→/g, fr ? " donne " : " gives ")
      .replace(/\n{2,}/g, "... ")
      .replace(/\n/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .substring(0, 800);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const sentences = isMobile
      ? clean.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.reduce((acc: string[], s, i) => {
          if (i % 2 === 0) acc.push(s.trim());
          else acc[acc.length - 1] += " " + s.trim();
          return acc;
        }, []) || [clean]
      : clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];

    let idx = 0;
    const speakNext = () => {
      if (idx >= sentences.length) { setSpeaking(false); return; }
      const sentence = sentences[idx].trim();
      idx++;
      if (!sentence) { speakNext(); return; }

      const u = new SpeechSynthesisUtterance(sentence);
      u.lang = fr ? "fr-FR" : "en-GB";
      u.rate = 0.92;
      u.pitch = 1.0;
      u.volume = 1.0;

      const voices = speechSynthesis.getVoices();
      const v = fr
        ? voices.find((v) => v.lang === "fr-CM") ||
          voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("google")) ||
          voices.find((v) => v.lang === "fr-FR") ||
          voices.find((v) => v.lang.startsWith("fr"))
        : voices.find((v) => v.lang === "en-CM") ||
          voices.find((v) => v.lang === "en-GB" && v.name.toLowerCase().includes("google")) ||
          voices.find((v) => v.lang === "en-GB") ||
          voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("google")) ||
          voices.find((v) => v.lang.startsWith("en"));
      if (v) u.voice = v;

      u.onend = () => { setTimeout(speakNext, isMobile ? 200 : 150); };
      u.onerror = () => { setSpeaking(false); };
      speechSynthesis.speak(u);
    };

    if (isMobile) setTimeout(speakNext, 50); else speakNext();
  }

  async function send(txt?: string) {
    const text = (txt || input).trim();
    if (!text || busy) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    const id = Date.now();
    const userMsg: Message = { id, role: "user", text };
    setMsgs((m) => [...m, userMsg, { id: id + 1, role: "assistant", text: "", loading: true }]);
    setBusy(true);

    const apiMessages = msgs
      .filter((m) => !m.loading)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));
    apiMessages.push({ role: "user", content: text });

    const level = profile?.level || "Form 5";
    const system = `You are Clair, an expert mathematics tutor for Cameroonian students. You specialize in the MINESEC (Francophone) and GCE (Anglophone) curricula.

STUDENT LEVEL: ${level}
LANGUAGE: ${fr ? "French" : "English"} — ALWAYS respond in this language.

RULES:
- Give clear, step-by-step explanations
- Use LaTeX notation for math: inline $...$ and display $$...$$
- Examples: $x^2 + 3x - 4 = 0$, $\\frac{-b \\pm \\sqrt{\\Delta}}{2a}$, $\\int_0^1 x^2 dx$
- Use \\sqrt{}, \\frac{}{}, \\sum, \\int, \\lim, \\sin, \\cos, \\tan etc.
- Reference Cameroon exams (BEPC, Probatoire, Baccalauréat, GCE O/A Level)
- Be encouraging and patient
- For exercises, show the solution step by step
- Keep responses concise but complete
- Use currency FCFA for any word problems involving money`;

    let assistantText = "";

    await streamClaude({
      messages: apiMessages,
      system,
      onDelta: (chunk) => {
        assistantText += chunk;
        setMsgs((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = { ...updated[lastIdx], text: assistantText, loading: false };
          return updated;
        });
      },
      onDone: () => {
        setBusy(false);
        if (assistantText) speak(assistantText);
      },
      onError: (err) => {
        setMsgs((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = { ...updated[lastIdx], text: `⚠️ ${err}`, loading: false };
          return updated;
        });
        setBusy(false);
      },
    });
  }

  function toggleMic() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert(fr ? "Utilisez Chrome pour la voix." : "Use Chrome for voice.");
      return;
    }
    if (rec) { recRef.current?.stop(); setRec(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = fr ? "fr-CM" : "en-GB";
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 1;

    let finalTranscript = "";

    r.onresult = (e: any) => {
      finalTranscript = "";
      for (let x = 0; x < e.results.length; x++) {
        if (e.results[x].isFinal) finalTranscript += e.results[x][0].transcript;
      }
      if (finalTranscript) setInput(finalTranscript);
    };
    r.onend = () => {
      setRec(false);
      if (finalTranscript.trim()) setTimeout(() => send(finalTranscript), 100);
    };
    r.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      setRec(false);
      if (e.error === "not-allowed") {
        alert(fr ? "Veuillez autoriser l'accès au microphone." : "Please allow microphone access.");
      }
    };
    r.start();
    recRef.current = r;
    setRec(true);
  }

  const QUICK = fr
    ? ["Comment résoudre $x^2 + 3x - 4 = 0$ ?", "Théorème de Pythagore", "Qu'est-ce que $\\frac{d}{dx}(x^n)$ ?", "Probabilité d'un dé"]
    : ["How to solve $x^2 + 3x - 4 = 0$?", "Explain Pythagorean theorem", "What is $\\frac{d}{dx}(x^n)$?", "Probability of a dice"];

  const status = busy ? (fr ? "⏳ Réfléchit…" : "⏳ Thinking…")
    : speaking ? (fr ? "🔊 Parle…" : "🔊 Speaking…")
    : (fr ? "En ligne • Claude + Voix" : "Online • Claude + Voice");

  // Show quick starters only when conversation hasn't started yet (just the greeting)
  const showQuickInline = msgs.length <= 1;

  return (
    <div className="absolute inset-0 flex gap-0 md:gap-3 overflow-hidden p-0 md:p-3">
      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card md:border md:border-border md:rounded-xl flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border">
          <div className="w-9 h-9 rounded-full flex-shrink-0 relative bg-gradient-to-br from-secondary to-emerald flex items-center justify-center text-base">
            🤖
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${busy ? "bg-primary" : "bg-emerald"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{fr ? "Clair — Tuteur Maths à Domicile" : "Clair — Math Tutor at Home"}</p>
            <p className="text-[0.69rem] text-muted-foreground truncate">{status}</p>
          </div>
          {speaking && (
            <button onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }}
              className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold cursor-pointer flex-shrink-0">
              ⏹ Stop
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 md:p-3.5 flex flex-col gap-3">
          {msgs.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`msg-enter flex gap-2 ${isUser ? "self-end flex-row-reverse" : "self-start"}`} style={{ maxWidth: "92%" }}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  isUser ? "bg-gradient-to-br from-primary to-destructive" : "bg-gradient-to-br from-secondary to-emerald"
                }`}>
                  {isUser ? "🧑" : "🤖"}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className={`px-3 py-2.5 text-sm leading-relaxed min-w-0 break-words ${
                    isUser ? "rounded-[13px_4px_13px_13px] bg-secondary" : "rounded-[4px_13px_13px_13px] bg-muted"
                  }`}>
                    {m.loading ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span key={d} className={`w-2 h-2 rounded-full bg-muted-foreground inline-block dot-${d}`} />
                        ))}
                      </div>
                    ) : isUser ? <p className="whitespace-pre-wrap">{m.text}</p> : <MathRenderer text={m.text} />}
                  </div>
                  {!isUser && !m.loading && m.text && (
                    <button onClick={() => speak(m.text)}
                      className="self-start bg-transparent border border-border text-muted-foreground rounded-full px-2.5 py-0.5 text-[0.70rem] cursor-pointer hover:bg-muted transition-colors">
                      🔊 {fr ? "Écouter" : "Listen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Mobile quick starters (horizontal scroll, only before first user message) */}
        {showQuickInline && (
          <div className="lg:hidden flex-shrink-0 px-3 pb-2 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="bg-muted border border-border rounded-full px-3 py-1.5 text-[0.70rem] text-muted-foreground whitespace-nowrap cursor-pointer hover:bg-secondary/10 hover:text-foreground transition-all">
                  <MathRenderer text={q} className="text-[0.70rem] inline" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice indicator */}
        {rec && (
          <div className="flex items-center gap-2 px-3 py-1.5 mx-3 mb-1 bg-destructive/10 border border-destructive/30 rounded-full text-xs text-destructive flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-destructive inline-block voice-blink" />
            {fr ? "J'écoute… parlez" : "Listening… speak now"}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 px-3 py-2.5 flex-shrink-0 border-t border-border bg-card" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
          <button onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all ${
              rec ? "border-2 border-destructive bg-destructive/10 text-destructive" : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>🎤</button>
          <textarea ref={taRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={fr ? "Posez votre question maths…" : "Ask any math question…"}
            rows={1}
            className="flex-1 min-w-0 bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm resize-none outline-none min-h-[40px] max-h-[110px] leading-relaxed focus:border-secondary/50 transition-colors" />
          <button onClick={() => send()} disabled={busy}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base border-none cursor-pointer transition-all ${
              busy ? "bg-muted-foreground/50 text-foreground cursor-not-allowed opacity-50" : "bg-secondary text-secondary-foreground hover:brightness-110"
            }`}>➤</button>
        </div>
      </div>

      {/* Side panel - desktop only */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 overflow-y-auto min-h-0">
        <div className="bg-card border border-border rounded-xl p-3.5 flex-shrink-0">
          <p className="font-display text-sm mb-2.5">💡 {fr ? "Questions rapides" : "Quick Starters"}</p>
          <div className="flex flex-col gap-1.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-left bg-muted border border-border rounded-lg px-2.5 py-2 text-xs text-muted2 cursor-pointer w-full font-body transition-all hover:bg-secondary/10 hover:text-foreground">
                <MathRenderer text={q} className="text-xs" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
