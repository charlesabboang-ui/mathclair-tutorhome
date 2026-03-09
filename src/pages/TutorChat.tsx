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
  image?: string;
}

export default function TutorChat({ lang, fr, tutorMsg }: Props) {
  const { profile } = useAuth();
  const [msgs, setMsgs] = useState<Message[]>([{
    id: 0, role: "assistant",
    text: fr
      ? `Bonjour ${profile?.name?.split(" ")[0] || ""} ! 🎓 Je suis Clair, votre tuteur en mathématiques à domicile. Posez votre question par texte, par voix, ou envoyez une photo de votre exercice !`
      : `Hello ${profile?.name?.split(" ")[0] || ""}! 🎓 I'm Clair, your math tutor at Home. Ask any question by text, voice, or send a photo of your exercise!`,
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [rec, setRec] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (tutorMsg) setInput(tutorMsg); }, [tutorMsg]);

  // Ensure voices are loaded (mobile needs this)
  useEffect(() => {
    const loadVoices = () => speechSynthesis.getVoices();
    loadVoices();
    speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
  }, []);

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // CRITICAL: On mobile, we must start speech IMMEDIATELY in the user gesture context
    // Create the first utterance right away before any processing
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

    const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
    
    // Get voices once
    const voices = speechSynthesis.getVoices();
    const isFemale = voiceGender === "female";
    
    // African locale preferences
    const africanLocales = ["cm", "ng", "za", "ke", "gh"];
    const femaleHints = ["female", "woman", "fiona", "zira", "amaka", "chioma", "adaeze", "ngozi", "aisha"];
    const maleHints = ["male", "man", "chidi", "emeka", "kwame", "kofi", "mandela", "david"];
    
    const matchesGender = (v: SpeechSynthesisVoice) => {
      const n = v.name.toLowerCase();
      return isFemale ? femaleHints.some(h => n.includes(h)) : maleHints.some(h => n.includes(h));
    };

    const isAfrican = (v: SpeechSynthesisVoice) => {
      const locale = v.lang.toLowerCase();
      return africanLocales.some(loc => locale.includes(loc));
    };

    const langCode = fr ? "fr" : "en";
    const allLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));
    const africanVoices = allLangVoices.filter(isAfrican);
    const africanGenderMatch = africanVoices.filter(matchesGender);
    const genderMatch = allLangVoices.filter(matchesGender);
    
    const selectedVoice = africanGenderMatch[0] || africanVoices[0] || genderMatch[0] || allLangVoices[0];

    // MOBILE FIX: Speak the first sentence IMMEDIATELY in user gesture context
    const firstSentence = sentences[0]?.trim();
    if (!firstSentence) { setSpeaking(false); return; }
    
    const firstUtterance = new SpeechSynthesisUtterance(firstSentence);
    firstUtterance.lang = fr ? "fr-FR" : "en-US"; // Use more widely supported locales
    firstUtterance.rate = 0.92;
    firstUtterance.pitch = 1.0;
    firstUtterance.volume = 1.0;
    if (selectedVoice) firstUtterance.voice = selectedVoice;
    
    let idx = 1; // Start from second sentence
    
    const speakNext = () => {
      if (idx >= sentences.length) { setSpeaking(false); return; }
      const sentence = sentences[idx]?.trim();
      idx++;
      if (!sentence) { speakNext(); return; }

      const u = new SpeechSynthesisUtterance(sentence);
      u.lang = fr ? "fr-FR" : "en-US";
      u.rate = 0.92;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (selectedVoice) u.voice = selectedVoice;

      u.onend = () => setTimeout(speakNext, 150);
      u.onerror = () => { setSpeaking(false); };
      speechSynthesis.speak(u);
    };
    
    firstUtterance.onend = () => setTimeout(speakNext, 150);
    firstUtterance.onerror = () => { setSpeaking(false); };
    
    // Speak immediately - this happens in user gesture context
    speechSynthesis.speak(firstUtterance);
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
        // Auto-speak removed: mobile browsers block speechSynthesis after async ops.
        // Users can tap the "Listen" button on each message instead.
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
    r.lang = fr ? "fr-CM" : "en-NG";
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === "image") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const id = Date.now();
        setMsgs((m) => [...m, { 
          id, 
          role: "user", 
          text: fr ? "📷 J'ai envoyé une photo de mon exercice" : "📷 I sent a photo of my exercise",
          image: dataUrl 
        }]);
        // For now, just acknowledge - image analysis would need vision API
        setTimeout(() => {
          setMsgs((m) => [...m, {
            id: id + 1,
            role: "assistant",
            text: fr 
              ? "📸 J'ai bien reçu ta photo ! Pour l'instant, décris-moi ce que tu vois sur l'exercice et je t'aiderai à le résoudre étape par étape."
              : "📸 I received your photo! For now, describe what you see on the exercise and I'll help you solve it step by step."
          }]);
        }, 500);
      };
      reader.readAsDataURL(file);
    } else {
      const id = Date.now();
      setMsgs((m) => [...m, { 
        id, 
        role: "user", 
        text: fr ? `📄 J'ai envoyé un PDF: ${file.name}` : `📄 I sent a PDF: ${file.name}` 
      }]);
      setTimeout(() => {
        setMsgs((m) => [...m, {
          id: id + 1,
          role: "assistant",
          text: fr
            ? "📄 J'ai bien reçu ton fichier PDF ! Dis-moi quelle page ou quel exercice tu veux qu'on travaille ensemble."
            : "📄 I received your PDF file! Tell me which page or exercise you want us to work on together."
        }]);
      }, 500);
    }
    setShowAttach(false);
  }

  const QUICK = fr
    ? ["Comment résoudre $x^2 + 3x - 4 = 0$ ?", "Théorème de Pythagore", "Qu'est-ce que $\\frac{d}{dx}(x^n)$ ?", "Probabilité d'un dé"]
    : ["How to solve $x^2 + 3x - 4 = 0$?", "Explain Pythagorean theorem", "What is $\\frac{d}{dx}(x^n)$?", "Probability of a dice"];

  const status = busy ? (fr ? "⏳ Réfléchit…" : "⏳ Thinking…")
    : speaking ? (fr ? "🔊 Parle…" : "🔊 Speaking…")
    : (fr ? "En ligne • IA + Voix 🇨🇲" : "Online • AI + Voice 🇨🇲");

  return (
    <div className="absolute inset-0 flex gap-0 md:gap-3 overflow-hidden p-0 md:p-3">
      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileSelect(e, "pdf")} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />

      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card md:border md:border-border md:rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border">
          <div className="w-9 h-9 rounded-full flex-shrink-0 relative bg-gradient-to-br from-secondary to-emerald flex items-center justify-center text-base">
            🤖
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${busy ? "bg-primary" : "bg-emerald"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{fr ? "Clair — Tuteur Maths à Domicile" : "Clair — Math Tutor at Home"}</p>
            <p className="text-[0.69rem] text-muted-foreground">{status}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex bg-muted rounded-full p-0.5 gap-0.5">
              {(["female", "male"] as const).map((g) => (
                <button key={g} onClick={() => setVoiceGender(g)}
                  className={`px-2 py-1 rounded-full text-[0.68rem] font-bold cursor-pointer border-none transition-all ${
                    voiceGender === g ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                  }`}>
                  {g === "female" ? "👩🏿" : "👨🏿"} {g === "female" ? (fr ? "Voix F" : "Female") : (fr ? "Voix M" : "Male")}
                </button>
              ))}
            </div>
            {speaking && (
              <button onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }}
                className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold cursor-pointer">
                ⏹ Stop
              </button>
            )}
          </div>
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
                  {isUser ? "🧑🏿" : "🤖"}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  {m.image && (
                    <img src={m.image} alt="Exercise" className="max-w-[200px] rounded-lg border border-border" />
                  )}
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

        {/* Attachment menu */}
        {showAttach && (
          <div className="flex items-center gap-2 px-3 py-2 mx-3 mb-1 bg-muted border border-border rounded-xl flex-shrink-0 animate-fade-in">
            <button onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-secondary/10 transition-colors">
              📷 {fr ? "Photo" : "Photo"}
            </button>
            <button onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = (e) => handleFileSelect(e as any, "image"); inp.click(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-secondary/10 transition-colors">
              🖼️ {fr ? "Image" : "Image"}
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-secondary/10 transition-colors">
              📄 PDF
            </button>
            <button onClick={() => setShowAttach(false)}
              className="ml-auto px-2 py-1 text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-t border-border">
          <button onClick={() => setShowAttach(!showAttach)}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg cursor-pointer transition-all border ${
              showAttach ? "border-secondary bg-secondary/20 text-secondary" : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>+</button>
          <button onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all ${
              rec ? "border-2 border-destructive bg-destructive/10 text-destructive" : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>🎤</button>
          <textarea ref={taRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={fr ? "Posez votre question ou envoyez une photo…" : "Ask any question or send a photo…"}
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
        <div className="bg-card border border-border rounded-xl p-3.5 flex-shrink-0">
          <p className="font-display text-sm mb-2">📎 {fr ? "Envoyer un fichier" : "Send a file"}</p>
          <p className="text-[0.70rem] text-muted-foreground mb-2.5">{fr ? "Prends en photo ton exercice ou envoie un PDF" : "Take a photo of your exercise or send a PDF"}</p>
          <div className="flex gap-2">
            <button onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted border border-border rounded-lg text-xs font-medium hover:bg-secondary/10 transition-colors">
              📷 {fr ? "Photo" : "Photo"}
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted border border-border rounded-lg text-xs font-medium hover:bg-secondary/10 transition-colors">
              📄 PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
