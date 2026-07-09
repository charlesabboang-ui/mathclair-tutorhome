import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  mode: "student" | "parent";
  onBack: () => void;
  lang: "en" | "fr";
}

export default function AuthScreen({ mode, onBack, lang }: Props) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Form 5");
  const [school, setSchool] = useState("");
  const [childName, setChildName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const fr = lang === "fr";
  const isStudent = mode === "student";

  async function submit() {
    if (!phone.trim() || !password.trim()) {
      setErr(fr ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
      return;
    }
    if (isSignUp && !name.trim()) {
      setErr(fr ? "Veuillez entrer votre nom." : "Please enter your name.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setErr(fr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      if (isSignUp) {
        const formattedPhone = phone.startsWith("+") ? phone : `+237${phone}`;
        const result = await signUp(formattedPhone, password, name, mode === "parent", {
          level: isStudent ? level : "",
          school: isStudent ? school : "",
          childName: !isStudent ? childName : "",
        });
        setLoading(false);
        if (result.error) {
          setErr(result.error);
        } else {
          setSuccess(fr ? "Compte créé ! Connexion en cours…" : "Account created! Signing in…");
        }
      } else {
        const formattedPhone = phone.startsWith("+") ? phone : `+237${phone}`;
        const result = await signIn(formattedPhone, password);
        setLoading(false);
        if (result.error) {
          setErr(result.error);
        }
      }
    } catch (e: any) {
      setLoading(false);
      setErr(e?.message || (fr ? "Une erreur est survenue." : "An error occurred."));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) submit();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-5 overflow-auto">
      <div className="fixed inset-0 pointer-events-none grid-bg" />
      <div className="fixed pointer-events-none rounded-full"
        style={{
          top: "30%", left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400,
          background: isStudent
            ? "radial-gradient(circle, hsla(239,84%,67%,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, hsla(38,92%,50%,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in" onKeyDown={handleKeyDown}>
        <div className={`bg-card rounded-2xl overflow-hidden border-[1.5px] ${isStudent ? "border-border" : "border-gold/30"}`}
          style={{ boxShadow: isStudent ? "0 40px 80px hsla(239,84%,67%,0.12)" : "0 40px 80px hsla(38,92%,50%,0.10)" }}>
          <div className="h-1" style={{
            background: isStudent
              ? "linear-gradient(90deg, hsl(var(--purple)), #a5b4fc)"
              : "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)))"
          }} />

          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <p className="font-display text-2xl">
                Math<span className="text-primary">Clair</span>
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full text-xs font-bold ${
                isStudent ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-primary/10 border border-primary/30 text-primary"
              }`}>
                {isStudent ? `🎓 ${fr ? "Espace Élève" : "Student"}` : `👨‍👩‍👧 ${fr ? "Espace Parent" : "Parent"}`}
              </div>
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="flex bg-muted rounded-full p-0.5 gap-0.5 mb-5">
              <button onClick={() => { setIsSignUp(false); setErr(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-full text-xs font-bold cursor-pointer border-none transition-all ${
                  !isSignUp ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                }`}>{fr ? "Connexion" : "Sign In"}</button>
              <button onClick={() => { setIsSignUp(true); setErr(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-full text-xs font-bold cursor-pointer border-none transition-all ${
                  isSignUp ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                }`}>{fr ? "Inscription" : "Sign Up"}</button>
            </div>

            {isSignUp && (
              <>
                <label className="block text-[0.74rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
                  {fr ? "Nom complet" : "Full Name"}
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={fr ? "Votre nom" : "Your name"}
                  className="w-full bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm outline-none mb-3 focus:border-secondary/50 transition-colors" />
              </>
            )}

            <label className="block text-[0.74rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              {fr ? "Numéro de téléphone" : "Phone number"}
            </label>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">📱</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder={fr ? "6XXXXXXXX" : "6XXXXXXXX"}
                className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-3 text-foreground text-sm outline-none focus:border-secondary/50 transition-colors" />
            </div>

            <label className="block text-[0.74rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              {fr ? "Mot de passe" : "Password"}
            </label>
            <div className="relative mb-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🔒</span>
              <input type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={fr ? "Min. 6 caractères" : "Min. 6 characters"}
                className={`w-full bg-muted border rounded-xl py-2.5 pl-10 pr-3 text-foreground text-sm outline-none transition-colors ${
                  err ? "border-destructive" : "border-border focus:border-secondary/50"
                }`} />
            </div>
            <button onClick={() => setShowPw((s) => !s)}
              className="bg-transparent border-none text-muted-foreground text-xs cursor-pointer mt-1 mb-3 font-body">
              {showPw ? (fr ? "Masquer" : "Hide") : (fr ? "Afficher" : "Show")} {fr ? "le mot de passe" : "password"}
            </button>

            {isSignUp && isStudent && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1">{fr ? "Niveau" : "Level"}</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg py-2 px-2 text-foreground text-xs outline-none font-body">
                    <option>Form 3 / 4ème</option>
                    <option>Form 5 / 3ème</option>
                    <option>Probatoire / 1ère</option>
                    <option>Terminale / Upper Sixth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1">{fr ? "École" : "School"}</label>
                  <input type="text" value={school} onChange={(e) => setSchool(e.target.value)}
                    placeholder="GHS Buea"
                    className="w-full bg-muted border border-border rounded-lg py-2 px-2 text-foreground text-xs outline-none" />
                </div>
              </div>
            )}

            {isSignUp && !isStudent && (
              <div className="mb-3">
                <label className="block text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1">{fr ? "Nom de l'enfant" : "Child's name"}</label>
                <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)}
                  placeholder={fr ? "Nom de l'enfant" : "Child's name"}
                  className="w-full bg-muted border border-border rounded-lg py-2 px-2 text-foreground text-xs outline-none" />
              </div>
            )}

            {err && <p className="text-[0.71rem] text-destructive mb-3">⚠ {err}</p>}
            {success && <p className="text-[0.71rem] text-accent mb-3">✅ {success}</p>}

            <button onClick={submit} disabled={loading}
              className={`w-full py-3 rounded-full border-none font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                loading ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : isStudent ? "bg-secondary text-secondary-foreground" : "bg-gradient-to-r from-primary to-gold-light text-primary-foreground"
              }`}>
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent inline-block animate-spin-slow" />
                  {fr ? "Chargement…" : "Loading…"}
                </>
              ) : isSignUp ? (fr ? "Créer le compte →" : "Create Account →") : (fr ? "Se connecter →" : "Sign In →")}
            </button>

            <button onClick={onBack}
              className="w-full mt-3 bg-transparent border-none text-muted-foreground text-sm cursor-pointer font-body">
              ← {fr ? "Retour à l'accueil" : "Back to home"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
