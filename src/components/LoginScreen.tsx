import { useState } from "react";
import { useApp, ACCOUNTS } from "@/contexts/AppContext";

interface Props {
  mode: "student" | "parent";
}

export default function LoginScreen({ mode }: Props) {
  const { lang, setScreen, onLoginSuccess, fr } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isStudent = mode === "student";

  function submit() {
    if (!email.trim() || !password.trim()) {
      setErr(fr ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setErr("");
    setTimeout(() => {
      const list = ACCOUNTS[mode];
      const user = list.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password.trim()
      );
      setLoading(false);
      if (user) {
        onLoginSuccess(user, mode);
      } else {
        setErr(fr ? "Email ou mot de passe incorrect." : "Incorrect email or password.");
      }
    }, 900);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-5 overflow-auto">
      <div className="fixed inset-0 pointer-events-none grid-bg" />
      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          top: "30%", left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400,
          background: isStudent
            ? "radial-gradient(circle, hsla(239,84%,67%,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, hsla(38,92%,50%,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        <div className={`bg-card rounded-2xl overflow-hidden border-[1.5px] ${isStudent ? "border-border" : "border-gold/30"}`}
          style={{ boxShadow: isStudent ? "0 40px 80px hsla(239,84%,67%,0.12)" : "0 40px 80px hsla(38,92%,50%,0.10)" }}>
          <div className="h-1" style={{
            background: isStudent
              ? "linear-gradient(90deg, hsl(var(--purple)), #a5b4fc)"
              : "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)))"
          }} />

          <div className="p-8">
            <div className="text-center mb-7">
              <p className="font-display text-2xl">
                Math<span className="text-primary">Clair</span>
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full text-xs font-bold ${
                isStudent ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-primary/10 border border-primary/30 text-primary"
              }`}>
                {isStudent ? "🎓 Student Login" : "👨‍👩‍👧 Parent Login"}
              </div>
            </div>

            <label className="block text-[0.74rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              {fr ? "Adresse email" : "Email address"}
            </label>
            <div className="relative mb-3.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">📧</span>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={fr ? "votre@email.cm" : "your@email.cm"}
                className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-3 text-foreground text-sm outline-none focus:border-secondary/50 transition-colors"
              />
            </div>

            <label className="block text-[0.74rem] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              {fr ? "Mot de passe" : "Password"}
            </label>
            <div className="relative mb-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🔒</span>
              <input
                type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={fr ? "Votre mot de passe" : "Your password"}
                className={`w-full bg-muted border rounded-xl py-2.5 pl-10 pr-3 text-foreground text-sm outline-none transition-colors ${
                  err ? "border-destructive" : "border-border focus:border-secondary/50"
                }`}
              />
            </div>
            {err && <p className="text-[0.71rem] text-destructive mt-1">⚠ {err}</p>}

            <button onClick={() => setShowPw((s) => !s)}
              className="bg-transparent border-none text-muted-foreground text-xs cursor-pointer mt-1 mb-5 font-body">
              {showPw ? (fr ? "Masquer" : "Hide") : (fr ? "Afficher" : "Show")} {fr ? "le mot de passe" : "password"}
            </button>

            {/* Demo accounts */}
            <div className="bg-muted border border-border rounded-xl p-3 mb-5">
              <p className="text-[0.70rem] text-muted-foreground mb-2 font-semibold">
                🧪 {fr ? "Comptes de démonstration :" : "Demo accounts:"}
              </p>
              {ACCOUNTS[mode].map((u) => (
                <div key={u.id}
                  onClick={() => { setEmail(u.email); setPassword(u.password); setErr(""); }}
                  className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-foreground/5 transition-colors">
                  <span className="text-sm">{isStudent ? "🎓" : "👨‍👩‍👧"}</span>
                  <div>
                    <p className="text-[0.78rem] font-semibold">{u.name}</p>
                    <p className="text-[0.68rem] text-muted-foreground">{u.email} · {u.password}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={submit} disabled={loading}
              className={`w-full py-3 rounded-full border-none font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                loading ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : isStudent ? "bg-secondary text-secondary-foreground" : "bg-gradient-to-r from-primary to-gold-light text-primary-foreground"
              }`}>
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent inline-block animate-spin-slow" />
                  {fr ? "Connexion…" : "Signing in…"}
                </>
              ) : (fr ? "Se connecter →" : "Sign In →")}
            </button>

            <button onClick={() => setScreen("landing")}
              className="w-full mt-3 bg-transparent border-none text-muted-foreground text-sm cursor-pointer font-body">
              ← {fr ? "Retour à l'accueil" : "Back to home"}
            </button>
          </div>
        </div>
        <p className="text-center text-[0.70rem] text-muted-foreground mt-4">
          {fr ? "Pas encore de compte ? Contactez votre école partenaire MathClair."
            : "No account? Contact your MathClair partner school."}
        </p>
      </div>
    </div>
  );
}
