import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { streamClaude, type ClaudeBlock } from "@/lib/streamClaude";
import MathRenderer from "@/components/MathRenderer";
import TutorContent from "@/components/TutorContent";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  lang: "en" | "fr";
  fr: boolean;
  tutorMsg: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
  error?: boolean;
  retryText?: string;
  image?: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const MCP_URL = PROJECT_REF ? `https://${PROJECT_REF}.supabase.co/functions/v1/mcp` : "";

export default function TutorChat({ fr, tutorMsg }: Props) {
  const { user, profile } = useAuth();

  const greet = (): Message => ({
    id: "greet",
    role: "assistant",
    text: fr
      ? `Bonjour ${profile?.name?.split(" ")[0] || ""} ! 🎓 Je suis Clair, votre tuteur en mathématiques. Posez votre question par texte, voix ou photo !`
      : `Hello ${profile?.name?.split(" ")[0] || ""}! 🎓 I'm Clair, your math tutor. Ask any question by text, voice or photo!`,
  });

  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([greet()]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; base64: string; mediaType: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMcp, setShowMcp] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (tutorMsg) setInput(tutorMsg); }, [tutorMsg]);

  // Load conversation list
  const loadConvs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setConvs(data as Conversation[]);
  }, [user]);

  useEffect(() => { loadConvs(); }, [loadConvs]);

  // Ensure voices are loaded
  useEffect(() => {
    const loadVoices = () => speechSynthesis?.getVoices();
    loadVoices();
    speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);
    return () => speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
  }, []);

  async function openConversation(id: string) {
    setActiveConv(id);
    setSidebarOpen(false);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      setMsgs(data.map((r: any) => ({ id: r.id, role: r.role, text: r.content })));
    } else {
      setMsgs([greet()]);
    }
  }

  function newConversation() {
    setActiveConv(null);
    setMsgs([greet()]);
    setInput("");
    setPendingImage(null);
    setSidebarOpen(false);
  }

  async function deleteConversation(id: string) {
    if (!confirm(fr ? "Supprimer cette conversation ?" : "Delete this conversation?")) return;
    await supabase.from("conversations").delete().eq("id", id);
    if (activeConv === id) newConversation();
    loadConvs();
  }

  async function ensureConversation(firstText: string): Promise<string | null> {
    if (activeConv) return activeConv;
    if (!user) return null;
    const title = firstText.slice(0, 60).trim() || (fr ? "Nouvelle discussion" : "New chat");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) return null;
    setActiveConv(data.id);
    loadConvs();
    return data.id;
  }

  async function persistMessage(convId: string, role: "user" | "assistant", content: string) {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id, conversation_id: convId, role, content,
    });
    // bump conversation timestamp
    await supabase.from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    setSpeaking(true);

    const clean = text
      .replace(/\$\$[\s\S]*?\$\$/g, (m) => m.replace(/\$\$/g, "").replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim())
      .replace(/\$([^\$]*?)\$/g, (_m, inner) => inner.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, " ").trim())
      .replace(/<\/?(u|b|strong|em|i)>/gi, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,3}\s*/g, "")
      .replace(/\n{2,}/g, "... ")
      .replace(/\n/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .substring(0, 800);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
    let idx = 0;
    const speakNext = () => {
      if (idx >= sentences.length) { setSpeaking(false); return; }
      const sentence = sentences[idx].trim(); idx++;
      if (!sentence) { speakNext(); return; }
      const u = new SpeechSynthesisUtterance(sentence);
      u.lang = fr ? "fr-FR" : "en-GB";
      u.rate = 0.92;
      const voices = speechSynthesis.getVoices();
      const v = fr
        ? voices.find((v) => v.lang.startsWith("fr"))
        : voices.find((v) => v.lang.startsWith("en"));
      if (v) u.voice = v;
      u.onend = () => setTimeout(speakNext, isMobile ? 200 : 150);
      u.onerror = () => setSpeaking(false);
      speechSynthesis.speak(u);
    };
    if (isMobile) setTimeout(speakNext, 50); else speakNext();
  }

  async function fetchWebContext(query: string): Promise<string> {
    try {
      const { data } = await supabase.functions.invoke("math-web-context", { body: { query } });
      const snippets: string[] = data?.snippets || [];
      if (!snippets.length) return "";
      return `\n\nRELATED PUBLIC REFERENCES (from Mathos.ai and Qwen.ai — use for inspiration, cite briefly if helpful):\n${snippets.slice(0, 5).map((s) => `- ${s}`).join("\n")}`;
    } catch { return ""; }
  }

  async function send(txt?: string) {
    const text = (txt || input).trim();
    const img = pendingImage;
    if ((!text && !img) || busy) return;
    setInput("");
    setPendingImage(null);
    if (fileRef.current) fileRef.current.value = "";
    if (taRef.current) taRef.current.style.height = "auto";

    const promptText = text || (fr ? "Explique cet exercice étape par étape." : "Explain this exercise step by step.");

    const tempUserId = "u-" + Date.now();
    const tempAssistantId = "a-" + Date.now();
    const userMsg: Message = { id: tempUserId, role: "user", text: promptText, image: img?.dataUrl };
    setMsgs((m) => [...m, userMsg, { id: tempAssistantId, role: "assistant", text: "", loading: true }]);
    setBusy(true);

    // Ensure DB conversation exists and persist user turn
    const convId = await ensureConversation(promptText);
    if (convId) await persistMessage(convId, "user", promptText);

    const priorHistory = msgs
      .filter((m) => !m.loading && m.id !== "greet")
      .map((m) => ({ role: m.role, content: m.text }));

    const apiMessages: { role: "user" | "assistant"; content: string | ClaudeBlock[] }[] = [...priorHistory];

    if (img) {
      apiMessages.push({
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } },
          { type: "text", text: promptText },
        ],
      });
    } else {
      apiMessages.push({ role: "user", content: promptText });
    }

    const webCtx = await fetchWebContext(promptText);

    const level = profile?.level || "Form 5";
    const system = `You are Clair, an expert mathematics tutor for Cameroonian students (MINESEC / GCE curricula). You teach with the SOCRATIC METHOD.

STUDENT LEVEL: ${level}
LANGUAGE: ${fr ? "French" : "English"} — ALWAYS respond in this language.

SOCRATIC METHOD (STRICT):
- Do NOT immediately give the full solution. Instead, ask ONE guiding question at a time to help the student discover the answer.
- Begin by checking what they already know or what they've tried.
- After each of the student's replies, acknowledge briefly then ask the next small question.
- Only reveal the full worked solution when the student explicitly asks ("show me the answer", "solve it", "je donne ma langue au chat") OR after they have answered several guiding questions correctly.
- Encourage the student and celebrate small wins.
- If the student sends a photo of an exercise, first ask them what part they're stuck on before diving in.

FORMATTING RULES (STRICT — the app renders HTML):
- DO NOT use Markdown headings (no lines starting with # or ##).
- DO NOT use asterisks for emphasis (no **bold**, no *italic*).
- For emphasis use HTML tags directly: <b>key term</b> for bold, <u>important idea</u> for underline.
- Use numbered steps written as "Step 1:", "Step 2:" (or "Étape 1:", "Étape 2:" in French) — plain text.
- Use LaTeX for math: inline $...$ and display $$...$$. Examples: $x^2 + 3x - 4 = 0$, $\\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.

VISUAL TOOLS (embed only when it genuinely helps):
- To display a graph, add on its own line: [[geogebra: y = x^2 - 2x + 1]]  (multiple formulas: separate with |)
- To invite the student to sketch (geometry, diagrams), add on its own line: [[tldraw]]
- Use these SPARINGLY — only when a picture is more useful than words (functions, geometry figures, statistics).

- Reference Cameroon exams when useful (BEPC, Probatoire, Baccalauréat, GCE O/A Level).
- Currency in FCFA for money problems.
- Draw on the spirit of Mathos.ai and Qwen.ai solvers: clear, incremental, learner-first.${webCtx}`;

    let assistantText = "";

    await streamClaude({
      messages: apiMessages,
      system,
      onDelta: (chunk) => {
        assistantText += chunk;
        setMsgs((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: assistantText, loading: false };
          return updated;
        });
      },
      onDone: async () => {
        setBusy(false);
        if (assistantText) {
          if (convId) await persistMessage(convId, "assistant", assistantText);
          speak(assistantText);
        }
      },
      onError: (err) => {
        const isRate = /rate|429|limit/i.test(err);
        const isAuth = /unauth|401|sign/i.test(err);
        const isNet = /network|fetch|502|503|unavailable|timeout/i.test(err);
        const fallback = fr
          ? (isAuth ? "⚠️ Session expirée. Reconnectez-vous."
             : isRate ? "⏱️ Trop de requêtes. Patientez quelques secondes."
             : isNet ? "📶 Tuteur momentanément indisponible. Vérifiez la connexion et réessayez."
             : `⚠️ Erreur : ${err}. Appuyez sur 🔄 Réessayer.`)
          : (isAuth ? "⚠️ Session expired. Please sign in again."
             : isRate ? "⏱️ Too many requests. Wait a few seconds and try again."
             : isNet ? "📶 Tutor temporarily unavailable. Check your connection and retry."
             : `⚠️ Something went wrong: ${err}. Tap 🔄 Retry below.`);
        setMsgs((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: fallback, loading: false, error: true, retryText: promptText };
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
      for (let x = 0; x < e.results.length; x++) if (e.results[x].isFinal) finalTranscript += e.results[x][0].transcript;
      if (finalTranscript) setInput(finalTranscript);
    };
    r.onend = () => { setRec(false); if (finalTranscript.trim()) setTimeout(() => send(finalTranscript), 100); };
    r.onerror = (e: any) => {
      setRec(false);
      if (e.error === "not-allowed") alert(fr ? "Autorisez le microphone." : "Please allow microphone access.");
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
    : (fr ? "En ligne • Claude + Voix + MCP" : "Online • Claude + Voice + MCP");

  const showQuickInline = msgs.length <= 1;

  const Sidebar = (
    <aside className="w-full md:w-[240px] flex-shrink-0 bg-card md:border md:border-border md:rounded-xl flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <button onClick={newConversation}
          className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold cursor-pointer hover:brightness-110">
          + {fr ? "Nouvelle discussion" : "New chat"}
        </button>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden px-2 py-2 rounded-lg border border-border text-muted-foreground text-xs">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {convs.length === 0 && (
          <p className="text-[0.7rem] text-muted-foreground px-2 py-3">
            {fr ? "Aucune conversation. Commencez à discuter !" : "No chats yet. Start a conversation!"}
          </p>
        )}
        {convs.map((c) => (
          <div key={c.id} className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 cursor-pointer text-xs transition-colors ${
            activeConv === c.id ? "bg-secondary/20 text-foreground" : "hover:bg-muted text-muted-foreground"
          }`}>
            <button onClick={() => openConversation(c.id)} className="flex-1 min-w-0 text-left truncate">
              💬 {c.title || (fr ? "Sans titre" : "Untitled")}
            </button>
            <button onClick={() => deleteConversation(c.id)}
              className="opacity-0 group-hover:opacity-100 text-destructive text-[0.7rem] px-1"
              aria-label="Delete">🗑</button>
          </div>
        ))}
      </div>
      {/* MCP panel */}
      <div className="border-t border-border p-3">
        <button onClick={() => setShowMcp((v) => !v)} className="w-full text-left text-[0.72rem] font-bold text-muted-foreground flex items-center justify-between">
          🔌 {fr ? "Agent MCP" : "MCP Agent"} <span>{showMcp ? "▾" : "▸"}</span>
        </button>
        {showMcp && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-[0.65rem] text-muted-foreground leading-snug">
              {fr
                ? "Connectez ChatGPT / Claude / Cursor à MathClair via MCP pour lire votre profil, votre progrès et enregistrer vos sessions."
                : "Connect ChatGPT / Claude / Cursor to MathClair via MCP to read your profile, progress and log study sessions."}
            </p>
            <div className="flex items-center gap-1">
              <code className="flex-1 min-w-0 truncate text-[0.6rem] bg-muted rounded px-2 py-1 border border-border">{MCP_URL}</code>
              <button onClick={() => { navigator.clipboard.writeText(MCP_URL); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[0.6rem] font-bold">
                {copied ? "✓" : (fr ? "Copier" : "Copy")}
              </button>
            </div>
            <p className="text-[0.6rem] text-muted-foreground">
              {fr ? "Outils : get_profile, get_progress, log_study_session" : "Tools: get_profile, get_progress, log_study_session"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="absolute inset-0 flex gap-0 md:gap-3 overflow-hidden p-0 md:p-3">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 flex">
          <div className="w-[85%] max-w-[300px] h-full flex flex-col bg-card">{Sidebar}</div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card md:border md:border-border md:rounded-xl flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border">
          <h1 className="sr-only">{fr ? "Tuteur Vocal — Clair" : "Voice Tutor — Clair"}</h1>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-base" aria-label="Chats">☰</button>
          <div className="w-9 h-9 rounded-full flex-shrink-0 relative bg-gradient-to-br from-secondary to-emerald flex items-center justify-center text-base">
            🤖
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${busy ? "bg-primary" : "bg-emerald"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{fr ? "Clair — Tuteur Maths" : "Clair — Math Tutor"}</p>
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
                    {m.image && (
                      <img src={m.image} alt="uploaded exercise" className="max-w-[240px] max-h-[240px] rounded-lg mb-2 border border-border" />
                    )}
                    {m.loading ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span key={d} className={`w-2 h-2 rounded-full bg-muted-foreground inline-block dot-${d}`} />
                        ))}
                      </div>
                    ) : isUser ? <p className="whitespace-pre-wrap">{m.text}</p> : <TutorContent text={m.text} />}
                  </div>
                  {!isUser && !m.loading && m.text && !m.error && (
                    <button onClick={() => speak(m.text)}
                      className="self-start bg-transparent border border-border text-muted-foreground rounded-full px-2.5 py-0.5 text-[0.70rem] cursor-pointer hover:bg-muted transition-colors">
                      🔊 {fr ? "Écouter" : "Listen"}
                    </button>
                  )}
                  {!isUser && m.error && m.retryText && (
                    <button
                      onClick={() => { setMsgs((prev) => prev.slice(0, -2)); send(m.retryText!); }}
                      disabled={busy}
                      className="self-start bg-secondary/10 border border-secondary/40 text-secondary rounded-full px-3 py-1 text-[0.72rem] font-semibold cursor-pointer hover:bg-secondary/20 transition-colors disabled:opacity-50">
                      🔄 {fr ? "Réessayer" : "Retry"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showQuickInline && (
          <div className="flex-shrink-0 px-3 pb-2 overflow-x-auto">
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

        {rec && (
          <div className="flex items-center gap-2 px-3 py-1.5 mx-3 mb-1 bg-destructive/10 border border-destructive/30 rounded-full text-xs text-destructive flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-destructive inline-block voice-blink" />
            {fr ? "J'écoute… parlez" : "Listening… speak now"}
          </div>
        )}

        {pendingImage && (
          <div className="flex items-center gap-2 px-3 pb-1 flex-shrink-0">
            <div className="relative">
              <img src={pendingImage.dataUrl} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-border" />
              <button
                onClick={() => { setPendingImage(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center border border-card"
                aria-label="Remove photo">✕</button>
            </div>
            <span className="text-[0.7rem] text-muted-foreground">{fr ? "Photo prête — envoyez" : "Photo attached — send"}</span>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 px-3 py-2.5 flex-shrink-0 border-t border-border bg-card" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 5 * 1024 * 1024) {
                alert(fr ? "Photo trop grande (max 5 Mo)." : "Photo too large (max 5 MB).");
                e.target.value = "";
                return;
              }
              const dataUrl = await new Promise<string>((res, rej) => {
                const r = new FileReader();
                r.onload = () => res(r.result as string);
                r.onerror = () => rej(new Error("read fail"));
                r.readAsDataURL(f);
              });
              const [meta, base64] = dataUrl.split(",");
              const mediaType = meta.match(/data:([^;]+)/)?.[1] || f.type || "image/jpeg";
              setPendingImage({ dataUrl, base64, mediaType });
            }}
          />
          <button onClick={() => fileRef.current?.click()} disabled={busy}
            title={fr ? "Envoyer une photo" : "Send a photo"}
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all border border-border bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50">
            📷
          </button>
          <button onClick={toggleMic} aria-label={rec ? (fr ? "Arrêter l'écoute" : "Stop listening") : (fr ? "Parler au micro" : "Speak to microphone")}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all ${
              rec ? "border-2 border-destructive bg-destructive/10 text-destructive" : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>🎤</button>
          <textarea ref={taRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={fr ? "Posez votre question ou joignez une photo…" : "Ask a question or attach a photo…"}
            rows={1}
            className="flex-1 min-w-0 bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm resize-none outline-none min-h-[40px] max-h-[110px] leading-relaxed focus:border-secondary/50 transition-colors" />
          <button onClick={() => send()} disabled={busy || (!input.trim() && !pendingImage)} aria-label={fr ? "Envoyer le message" : "Send message"}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base border-none cursor-pointer transition-all ${
              busy ? "bg-muted-foreground/50 text-foreground cursor-not-allowed opacity-50" : "bg-secondary text-secondary-foreground hover:brightness-110"
            }`}>➤</button>
        </div>
      </div>
    </div>
  );
}
