import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

interface Message {
  id: number;
  role: "user" | "tutor";
  text: string;
  loading?: boolean;
}

function formatMathText(text: string) {
  return text.split("\n").map((ln, i) => {
    const t = ln.trim();
    if (!t) return null;
    if (t.startsWith("→") || /^Step\s*\d+/i.test(t) || /^Étape\s*\d+/i.test(t)) {
      return <div key={i} className="math-block">{t}</div>;
    }
    return <p key={i} className="my-0.5">{t}</p>;
  });
}

const TUTOR_RESPONSES: Record<string, { en: string; fr: string }> = {
  quadratic: {
    en: "Great question! Let me explain quadratic equations step by step.\n\nA quadratic equation has the form ax² + bx + c = 0\n\nStep 1: Identify coefficients a, b, and c\nStep 2: Calculate the discriminant Δ = b² − 4ac\nStep 3: If Δ > 0: two real solutions x = (−b ± √Δ) / 2a\n→ If Δ = 0: one double root x = −b / 2a\n→ If Δ < 0: no real solutions\n\nExample: Solve 2x² − 5x + 3 = 0\n→ a=2, b=−5, c=3\n→ Δ = 25 − 24 = 1\n→ x₁ = (5+1)/4 = 3/2\n→ x₂ = (5−1)/4 = 1\n\nWould you like to practice with more examples?",
    fr: "Excellente question ! Voici les équations du 2nd degré pas à pas.\n\nUne équation quadratique a la forme ax² + bx + c = 0\n\nÉtape 1: Identifier les coefficients a, b et c\nÉtape 2: Calculer le discriminant Δ = b² − 4ac\nÉtape 3: Si Δ > 0 : deux solutions réelles x = (−b ± √Δ) / 2a\n→ Si Δ = 0 : une racine double x = −b / 2a\n→ Si Δ < 0 : pas de solutions réelles\n\nExemple : Résoudre 2x² − 5x + 3 = 0\n→ a=2, b=−5, c=3\n→ Δ = 25 − 24 = 1\n→ x₁ = (5+1)/4 = 3/2\n→ x₂ = (5−1)/4 = 1\n\nVoulez-vous pratiquer avec d'autres exemples ?",
  },
  pythagoras: {
    en: "The Pythagorean theorem is fundamental in geometry!\n\nFor a right triangle with legs a, b and hypotenuse c:\n→ a² + b² = c²\n\nStep 1: Identify the right angle (90°)\nStep 2: The hypotenuse is opposite the right angle\nStep 3: Apply the formula\n\nExample: Triangle with AC=6, BC=8, ∠C=90°\n→ AB² = 6² + 8² = 36 + 64 = 100\n→ AB = √100 = 10 cm\n\nThis is a 3-4-5 triple scaled by 2!",
    fr: "Le théorème de Pythagore est fondamental en géométrie !\n\nPour un triangle rectangle de côtés a, b et hypoténuse c :\n→ a² + b² = c²\n\nÉtape 1: Identifier l'angle droit (90°)\nÉtape 2: L'hypoténuse est opposée à l'angle droit\nÉtape 3: Appliquer la formule\n\nExemple : Triangle avec AC=6, BC=8, ∠C=90°\n→ AB² = 6² + 8² = 36 + 64 = 100\n→ AB = √100 = 10 cm\n\nC'est un triplet pythagoricien 3-4-5 multiplié par 2 !",
  },
  derivative: {
    en: "Differentiation is key in calculus!\n\nThe derivative of f(x) measures the rate of change.\n\nBasic rules:\n→ d/dx(xⁿ) = n·xⁿ⁻¹\n→ d/dx(constant) = 0\n→ d/dx(sin x) = cos x\n→ d/dx(eˣ) = eˣ\n\nExample: f(x) = 3x⁴ − 2x² + 5x − 1\n→ f'(3x⁴) = 12x³\n→ f'(−2x²) = −4x\n→ f'(5x) = 5\n→ f'(−1) = 0\n→ f'(x) = 12x³ − 4x + 5",
    fr: "La dérivation est essentielle en analyse !\n\nLa dérivée de f(x) mesure le taux de variation.\n\nRègles de base :\n→ d/dx(xⁿ) = n·xⁿ⁻¹\n→ d/dx(constante) = 0\n→ d/dx(sin x) = cos x\n→ d/dx(eˣ) = eˣ\n\nExemple : f(x) = 3x⁴ − 2x² + 5x − 1\n→ f'(3x⁴) = 12x³\n→ f'(−2x²) = −4x\n→ f'(5x) = 5\n→ f'(−1) = 0\n→ f'(x) = 12x³ − 4x + 5",
  },
  probability: {
    en: "Probability measures how likely an event is to occur!\n\nP(event) = favorable outcomes / total outcomes\n\nStep 1: Count all possible outcomes\nStep 2: Count favorable outcomes\nStep 3: Divide\n\nExample: Rolling a fair die, P(even number) = ?\n→ Total outcomes: {1,2,3,4,5,6} = 6\n→ Even numbers: {2,4,6} = 3\n→ P(even) = 3/6 = 1/2 = 0.5\n\nKey rules:\n→ 0 ≤ P(A) ≤ 1\n→ P(A') = 1 − P(A)\n→ P(A∪B) = P(A) + P(B) − P(A∩B)",
    fr: "La probabilité mesure la chance qu'un événement se produise !\n\nP(événement) = cas favorables / cas possibles\n\nÉtape 1: Compter tous les résultats possibles\nÉtape 2: Compter les résultats favorables\nÉtape 3: Diviser\n\nExemple : Lancer un dé, P(nombre pair) = ?\n→ Résultats possibles : {1,2,3,4,5,6} = 6\n→ Nombres pairs : {2,4,6} = 3\n→ P(pair) = 3/6 = 1/2 = 0,5\n\nRègles clés :\n→ 0 ≤ P(A) ≤ 1\n→ P(A') = 1 − P(A)\n→ P(A∪B) = P(A) + P(B) − P(A∩B)",
  },
  integral: {
    en: "Integration is the reverse of differentiation!\n\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C (when n ≠ −1)\n\nExample: Calculate ∫₀² (x² + 1)dx\n\nStep 1: Find the antiderivative\n→ F(x) = x³/3 + x\n\nStep 2: Apply the fundamental theorem\n→ F(2) − F(0)\n→ = (8/3 + 2) − (0 + 0)\n→ = 8/3 + 2\n→ = 14/3 ≈ 4.67",
    fr: "L'intégration est l'inverse de la dérivation !\n\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C (quand n ≠ −1)\n\nExemple : Calculer ∫₀² (x² + 1)dx\n\nÉtape 1: Trouver la primitive\n→ F(x) = x³/3 + x\n\nÉtape 2: Appliquer le théorème fondamental\n→ F(2) − F(0)\n→ = (8/3 + 2) − (0 + 0)\n→ = 8/3 + 2\n→ = 14/3 ≈ 4,67",
  },
};

function getSmartResponse(text: string, lang: "en" | "fr"): string {
  const lower = text.toLowerCase();
  if (lower.includes("quadrat") || lower.includes("2nd degré") || lower.includes("second degré")) return TUTOR_RESPONSES.quadratic[lang];
  if (lower.includes("pythag") || lower.includes("triangle") || lower.includes("hypotenuse")) return TUTOR_RESPONSES.pythagoras[lang];
  if (lower.includes("deriv") || lower.includes("différent") || lower.includes("differentiat")) return TUTOR_RESPONSES.derivative[lang];
  if (lower.includes("probab") || lower.includes("chance") || lower.includes("dé") || lower.includes("dice")) return TUTOR_RESPONSES.probability[lang];
  if (lower.includes("integr") || lower.includes("intégr") || lower.includes("primitiv")) return TUTOR_RESPONSES.integral[lang];

  return lang === "fr"
    ? `Excellente question ! Voici comment aborder "${text.substring(0, 50)}" :\n\nÉtape 1: Identifier les données du problème\nÉtape 2: Choisir la méthode appropriée\n→ Appliquer les formules pertinentes\n→ Vérifier votre résultat\n\nVoulez-vous que j'approfondisse un aspect particulier ?`
    : `Great question! Here's how to approach "${text.substring(0, 50)}":\n\nStep 1: Identify the given information\nStep 2: Choose the appropriate method\n→ Apply relevant formulas\n→ Verify your result\n\nWould you like me to go deeper into any particular aspect?`;
}

export default function TutorChat() {
  const { lang, tutorMsg, user, fr } = useApp();
  const [msgs, setMsgs] = useState<Message[]>([{
    id: 0, role: "tutor",
    text: fr
      ? `Bonjour ${user?.name?.split(" ")[0] || ""} ! 🎓 Je suis Clair, votre tuteur en mathématiques avec conversation vocale. Posez votre question par texte ou par voix !`
      : `Hello ${user?.name?.split(" ")[0] || ""}! 🎓 I'm Clair, your math tutor with voice-to-voice chat. Ask any question by text or voice!`,
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(user?.level?.toLowerCase().replace(" ", "") || "form5");
  const [topic, setTopic] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (tutorMsg) setInput(tutorMsg); }, [tutorMsg]);

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    setSpeaking(true);
    const clean = text.replace(/→/g, "").replace(/[→∫∑√Δ]/g, "").replace(/\n+/g, ". ").substring(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = fr ? "fr-FR" : "en-GB";
    u.rate = 0.88;
    const voices = speechSynthesis.getVoices();
    const v = voices.find((v) =>
      fr ? v.lang.startsWith("fr") : v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha"))
    );
    if (v) u.voice = v;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }

  function send(txt?: string) {
    const text = (txt || input).trim();
    if (!text || busy) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    const id = Date.now();
    setMsgs((m) => [...m, { id, role: "user", text }, { id: id + 1, role: "tutor", text: "", loading: true }]);
    setBusy(true);

    // Simulate AI response with smart matching
    setTimeout(() => {
      const reply = getSmartResponse(text, lang);
      setMsgs((m) => m.filter((x) => !x.loading).concat({ id: id + 2, role: "tutor", text: reply }));
      setBusy(false);
      speak(reply); // Voice-to-voice: auto-speak response
    }, 1200);
  }

  function toggleMic() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert(fr ? "Utilisez Chrome pour la voix." : "Use Chrome for voice.");
      return;
    }
    if (rec) {
      recRef.current?.stop();
      setRec(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = fr ? "fr-FR" : "en-GB";
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
      setInput((v) => {
        if (v.trim()) setTimeout(() => send(v), 50);
        return v;
      });
    };
    r.onerror = () => setRec(false);
    r.start();
    recRef.current = r;
    setRec(true);
  }

  const QUICK = fr
    ? ["Comment résoudre une équation du 2nd degré ?", "Théorème de Pythagore", "Qu'est-ce que la dérivée ?", "Exemple de probabilité"]
    : ["How do I solve quadratic equations?", "Explain the Pythagorean theorem", "What is differentiation?", "Show a probability example"];

  const status = busy ? (fr ? "⏳ Réfléchit…" : "⏳ Thinking…")
    : speaking ? (fr ? "🔊 Parle…" : "🔊 Speaking…")
    : (fr ? "En ligne • Voix-à-Voix" : "Online • Voice-to-Voice");

  return (
    <div className="absolute inset-0 flex gap-3 overflow-hidden p-3">
      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
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
              className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold cursor-pointer border-none">
              ⏹ Stop
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          {msgs.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`msg-enter flex gap-2 ${isUser ? "self-end flex-row-reverse" : "self-start"}`} style={{ maxWidth: "88%" }}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  isUser ? "bg-gradient-to-br from-primary to-destructive" : "bg-gradient-to-br from-secondary to-emerald"
                }`}>
                  {isUser ? "🧑" : "🤖"}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className={`px-3.5 py-2.5 text-sm leading-relaxed min-w-0 break-words ${
                    isUser ? "rounded-[13px_4px_13px_13px] bg-secondary" : "rounded-[4px_13px_13px_13px] bg-muted"
                  }`}>
                    {m.loading ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span key={d} className={`w-2 h-2 rounded-full bg-muted-foreground inline-block dot-${d}`} />
                        ))}
                      </div>
                    ) : m.role === "tutor" ? formatMathText(m.text) : <p>{m.text}</p>}
                  </div>
                  {m.role === "tutor" && !m.loading && (
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
            placeholder={fr ? "Posez votre question…" : "Ask any math question…"}
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
          <p className="font-display text-sm mb-2.5">📚 {fr ? "Sujet & Niveau" : "Topic & Level"}</p>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg py-2 px-2.5 text-foreground text-sm outline-none mb-2 font-body">
            <option value="">{fr ? "— Choisir un sujet —" : "— Choose a topic —"}</option>
            <optgroup label="Algebra"><option>Quadratic Equations</option><option>Simultaneous Equations</option><option>Functions & Graphs</option></optgroup>
            <optgroup label="Geometry"><option>Triangles & Pythagoras</option><option>Circle Theorems</option><option>Trigonometry</option></optgroup>
            <optgroup label="Calculus"><option>Differentiation</option><option>Integration</option></optgroup>
            <optgroup label="Statistics"><option>Probability</option><option>Data & Statistics</option></optgroup>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg py-2 px-2.5 text-foreground text-sm outline-none font-body">
            <option value="form1">Form 1 / 6ème</option>
            <option value="form3">Form 3 / 4ème</option>
            <option value="form5">Form 5 / 3ème (BEPC)</option>
            <option value="probatoire">Probatoire / 1ère</option>
            <option value="terminale">Terminale / Upper Sixth (Bac)</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex-shrink-0">
          <p className="font-display text-sm mb-2.5">💡 {fr ? "Questions rapides" : "Quick Starters"}</p>
          <div className="flex flex-col gap-1.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-left bg-muted border border-border rounded-lg px-2.5 py-2 text-xs text-muted2 cursor-pointer w-full font-body transition-all hover:bg-secondary/10 hover:text-foreground">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
