import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { streamChat } from "@/lib/streamChat";
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

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    setSpeaking(true);
    // Strip LaTeX for speech
    const clean = text
      .replace(/\$\$[\s\S]*?\$\$/g, "")
      .replace(/\$[^\$]*?\$/g, "")
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, fr ? "$1 sur $2" : "$1 over $2")
      .replace(/\\sqrt\{([^}]*)\}/g, fr ? "racine carrée de $1" : "square root of $1")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/[{}]/g, "")
      .replace(/→/g, "")
      .replace(/\n+/g, ". ")
      .substring(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    // Prefer Cameroonian locale, fallback to general FR/EN
    u.lang = fr ? "fr-CM" : "en-CM";
    u.rate = 0.85;
    u.pitch = 1.05;

    const voices = speechSynthesis.getVoices();
    // Try to find a voice matching Cameroonian locale first, then general
    const v = fr
      ? voices.find((v) => v.lang === "fr-CM") ||
        voices.find((v) => v.lang === "fr-FR" && v.name.includes("Google")) ||
        voices.find((v) => v.lang.startsWith("fr"))
      : voices.find((v) => v.lang === "en-CM") ||
        voices.find((v) => v.lang === "en-NG") ||
        voices.find((v) => v.lang === "en-GH") ||
        voices.find((v) => v.lang === "en-ZA") ||
        voices.find((v) => v.lang === "en-GB" && v.name.includes("Google")) ||
        voices.find((v) => v.lang.startsWith("en"));
    if (v) u.voice = v;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
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

    // Build messages for API
    const apiMessages = msgs
      .filter((m) => !m.loading)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));
    apiMessages.push({ role: "user", content: text });

    let assistantText = "";

    await streamChat({
      messages: apiMessages,
      level: profile?.level || "Form 5",
      lang,
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
    r.interimResults = true;
    r.onresult = (e: any) => {
      let final = "", interim = "";
      for (let x = e.resultIndex; x < e.results.length; x++) {
        if (e.results[x].isFinal) final += e.results[x][0].transcript;
        else interim += e.results[x][0].transcript;
      }
      setInput(final || interim);
    };
    r.onend = () => {
      setRec(false);
      setInput((v) => { if (v.trim()) setTimeout(() => send(v), 50); return v; });
    };
    r.onerror = () => setRec(false);
    r.start();
    recRef.current = r;
    setRec(true);
  }

  const QUICK = fr
    ? ["Comment résoudre $x^2 + 3x - 4 = 0$ ?", "Théorème de Pythagore", "Qu'est-ce que $\\frac{d}{dx}(x^n)$ ?", "Probabilité d'un dé"]
    : ["How to solve $x^2 + 3x - 4 = 0$?", "Explain Pythagorean theorem", "What is $\\frac{d}{dx}(x^n)$?", "Probability of a dice"];

  const status = busy ? (fr ? "⏳ Réfléchit…" : "⏳ Thinking…")
    : speaking ? (fr ? "🔊 Parle…" : "🔊 Speaking…")
    : (fr ? "En ligne • IA + Voix" : "Online • AI + Voice");

  return (
    <div className="absolute inset-0 flex gap-0 md:gap-3 overflow-hidden p-0 md:p-3">
      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card md:border md:border-border md:rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border">
          <div className="w-9 h-9 rounded-full flex-shrink-0 relative bg-gradient-to-br from-secondary to-emerald flex items-center justify-center text-base">
            🤖
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${busy ? "bg-primary" : "bg-emerald"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Clair — AI Math Tutor</p>
            <p className="text-[0.69rem] text-muted-foreground">{status}</p>
          </div>
          {speaking && (
            <button onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }}
              className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold cursor-pointer">
              ⏹ Stop
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-3.5 flex flex-col gap-3">
          {msgs.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`msg-enter flex gap-2 ${isUser ? "self-end flex-row-reverse" : "self-start"}`} style={{ maxWidth: "90%" }}>
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
                    ) : isUser ? <p>{m.text}</p> : <MathRenderer text={m.text} />}
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

        {/* Voice indicator */}
        {rec && (
          <div className="flex items-center gap-2 px-3 py-1.5 mx-3 bg-destructive/10 border border-destructive/30 rounded-full text-xs text-destructive flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-destructive inline-block voice-blink" />
            {fr ? "J'écoute… parlez" : "Listening… speak now"}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-t border-border">
          <button onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all ${
              rec ? "border-2 border-destructive bg-destructive/10 text-destructive" : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>🎤</button>
          <textarea ref={taRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={fr ? "Posez votre question maths…" : "Ask any math question…"}
            rows={1}
            className="flex-1 bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm resize-none outline-none min-h-[38px] max-h-[110px] leading-relaxed focus:border-secondary/50 transition-colors" />
          <button onClick={() => send()} disabled={busy}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base border-none cursor-pointer transition-all ${
              busy ? "bg-muted-foreground/50 text-foreground cursor-not-allowed opacity-50" : "bg-secondary text-secondary-foreground hover:brightness-110"
            }`}>➤</button>
        </div>
      </div>

      {/* Side panel - hidden on mobile */}
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
