interface Props {
  onLogin: (mode: "student" | "parent") => void;
  lang: "en" | "fr";
  setLang: (l: "en" | "fr") => void;
}

const LEADERBOARD = [
  { name: "Aisha N.", school: "GBHS Yaoundé", score: 9840, badge: "🥇", delta: "+240" },
  { name: "Paul M.", school: "Lycée Leclerc", score: 9610, badge: "🥈", delta: "+185" },
  { name: "Fatima B.", school: "CES Douala II", score: 9420, badge: "🥉", delta: "+210" },
  { name: "Eric T.", school: "GBSS Bamenda", score: 9100, badge: "🎖️", delta: "+95" },
  { name: "Claire K.", school: "Lycée Bilingue", score: 8870, badge: "🎖️", delta: "+130" },
];

export default function Landing({ onLogin, lang, setLang }: Props) {
  const fr = lang === "fr";

  return (
    <div className="min-h-screen bg-background font-body text-foreground overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none grid-bg" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-background/90 sticky top-0 backdrop-blur-xl z-10">
        <div className="font-display text-xl">Math<span className="text-primary">Clair</span></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-full p-0.5 gap-0.5 mr-2">
            {(["en", "fr"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full text-[0.72rem] font-bold cursor-pointer border-none transition-all ${
                  lang === l ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                }`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => onLogin("parent")}
            className="hidden sm:inline-flex px-4 py-1.5 rounded-full border border-border bg-transparent text-muted2 text-xs font-bold cursor-pointer hover:bg-muted transition-colors">
            👨‍👩‍👧 Parent
          </button>
          <button onClick={() => onLogin("student")}
            className="px-4 py-1.5 rounded-full border-none bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:brightness-110 transition-all">
            {fr ? "Connexion →" : "Login →"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4 md:px-6 pt-12 md:pt-20 pb-12 relative z-5">
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-1.5 rounded-full text-xs font-semibold mb-7">
          🇨🇲 {fr ? "Conçu pour les lycées du Cameroun" : "Designed for Cameroon Secondary Schools"}
        </div>
        <h1 className="font-display text-3xl md:text-6xl leading-tight mb-4">
          {fr ? "Votre tuteur" : "Your Personal"}<br />
          <span className="italic text-primary font-serif">{fr ? "de maths personnel" : "Math Tutor"}</span><br />
          {fr ? "à portée de main" : "at Home"}
        </h1>
        <p className="text-sm md:text-base text-muted2 max-w-lg leading-relaxed mb-9">
          {fr ? "Tutorat IA bilingue par la voix. Plus de 3 000 exercices BEPC, Probatoire et Baccalauréat. Programmes MINESEC & GCE."
            : "Bilingual voice-to-voice AI tutoring. 3,000+ exercises for BEPC, Probatoire, Baccalauréat. MINESEC & GCE."}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => onLogin("student")}
            className="px-6 md:px-8 py-3 rounded-full border-none bg-primary text-primary-foreground font-bold text-sm cursor-pointer hover:brightness-110 transition-all">
            🎓 {fr ? "Commencer gratuitement" : "Start Learning Free"}
          </button>
          <button onClick={() => onLogin("parent")}
            className="px-6 md:px-8 py-3 rounded-full border border-border bg-transparent text-muted2 font-bold text-sm cursor-pointer hover:bg-muted transition-colors">
            👨‍👩‍👧 {fr ? "Espace parent" : "Parent Space"}
          </button>
        </div>
        <div className="flex gap-6 md:gap-10 mt-14 flex-wrap justify-center">
          {[
            ["3 000+", fr ? "Exercices" : "Exercises"],
            ["10+", fr ? "Niveaux" : "Class Levels"],
            ["2", fr ? "Programmes" : "Curricula"],
            ["EN/FR", fr ? "Bilingue" : "Bilingual"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-2xl md:text-3xl text-primary">{n}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-4 md:px-8 pb-14 max-w-5xl mx-auto">
        <h2 className="font-display text-xl md:text-2xl text-center mb-2">{fr ? "Nos formules" : "Our Plans"}</h2>
        <p className="text-center text-muted-foreground mb-8 text-sm">{fr ? "Choisissez la formule adaptée à vos besoins" : "Choose the plan that fits your needs"}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-display text-sm mb-2">{fr ? "Gratuit" : "Free"}</p>
            <p className="font-display text-3xl mb-4">0 <span className="text-sm text-muted-foreground font-body">FCFA</span></p>
            {(fr
              ? ["Tuteur IA (20 msg/jour)", "5 thèmes", "10 exercices"]
              : ["AI Tutor (20 msgs/day)", "5 Topics", "10 Practice Questions"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            {(fr
              ? ["Tous les thèmes", "Compétitions", "Rapports parent"]
              : ["All Topics", "Competitions", "Parent Reports"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted-foreground/50 mb-1.5">❌ {f}</p>
            ))}
          </div>

          {/* Learn */}
          <div className="bg-card border-2 border-secondary rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-secondary/50" />
            <p className="font-display text-sm text-secondary mb-2">{fr ? "Apprentissage" : "Learn"}</p>
            <p className="font-display text-3xl text-secondary mb-4">1 700 <span className="text-sm text-muted-foreground font-body">FCFA/{fr ? "mois" : "month"}</span></p>
            {(fr
              ? ["Tuteur IA illimité", "Tous les thèmes", "Exercices illimités", "Préparation aux examens", "Suivi de progression"]
              : ["Unlimited AI Tutor", "All Topics", "Unlimited Exercises", "Exam Preparation", "Progress Tracking"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            <button onClick={() => onLogin("student")}
              className="w-full mt-4 py-3 rounded-full border-none bg-secondary text-secondary-foreground font-bold text-sm cursor-pointer">
              🎓 {fr ? "S'abonner" : "Subscribe"}
            </button>
          </div>

          {/* Olympiade */}
          <div className="rounded-2xl p-5 relative overflow-hidden border-2 border-primary"
            style={{ background: "linear-gradient(140deg, hsl(28,30%,5%), hsl(222,47%,11%))" }}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-gold-light to-primary" />
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[0.64rem] font-extrabold">⭐ BEST</div>
            <p className="font-display text-sm text-primary mb-2">Olympiade</p>
            <p className="font-display text-3xl text-primary mb-4">5 000 <span className="text-sm text-muted-foreground font-body">FCFA/{fr ? "mois" : "month"}</span></p>
            {(fr
              ? ["Tout le plan Apprentissage", "Compétitions mensuelles", "Rapports détaillés aux parents", "Conseiller personnel dédié", "Médailles & certificats", "800+ problèmes olympiades"]
              : ["Everything in Learn plan", "Monthly Competitions", "Detailed Parent Reports", "Personal Dedicated Counselor", "Medals & Certificates", "800+ Olympiad Problems"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            <button onClick={() => onLogin("student")}
              className="w-full mt-4 py-3 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-bold text-sm cursor-pointer glow-btn">
              🏆 {fr ? "S'abonner" : "Subscribe Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 md:px-8 pb-14 max-w-5xl mx-auto">
        <h2 className="font-display text-xl md:text-2xl text-center mb-2">{fr ? "Tout ce qu'il faut pour réussir" : "Everything a Student Needs"}</h2>
        <p className="text-center text-muted-foreground mb-8 text-sm">{fr ? "Conçu pour le système éducatif camerounais" : "Built for the Cameroonian education system"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { color: "bg-primary", icon: "🗣️", h: fr ? "Tuteur vocal IA" : "Voice AI Tutor", p: fr ? "Discutez avec Clair par la voix. Explications détaillées étape par étape." : "Speak with Clair voice-to-voice. Step-by-step explanations." },
            { color: "bg-emerald", icon: "📐", h: fr ? "3 000+ exercices" : "3,000+ Exercises", p: fr ? "BEPC, Probatoire, Bac — sections francophone et anglophone." : "BEPC, Probatoire, Bac. Francophone & Anglophone sections." },
            { color: "bg-secondary", icon: "📝", h: fr ? "Formules en rendu pro" : "Math Formulas", p: fr ? "Affichage professionnel des formules, comme à l'examen." : "Professional formula rendering. Exam-style presentation." },
            { color: "bg-destructive", icon: "👨‍👩‍👧", h: fr ? "Suivi parental" : "Parental Control", p: fr ? "Rapports WhatsApp, alertes et restriction de contenu." : "WhatsApp reports, alerts, topic restrictions." },
          ].map(({ color, icon, h, p }) => (
            <div key={h} className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-[3px] h-full ${color}`} />
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-display text-sm mb-1.5">{h}</p>
              <p className="text-sm text-muted2 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Olympiade teaser */}
      <div className="px-4 md:px-8 pb-16 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 p-6 md:p-10"
          style={{ background: "linear-gradient(135deg, hsl(28,30%,4%), hsl(222,47%,11%))" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsla(38,92%,50%,0.12) 0%, transparent 65%)" }} />
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                ⚡ {fr ? "FORMULE EXCLUSIVE" : "EXCLUSIVE PLAN"}
              </div>
              <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">
                {fr ? "Passez au niveau " : "Rise to the "}<span className="gold-text">Olympiade</span>
              </h2>
              <p className="text-muted2 leading-relaxed mb-3 text-sm">
                {fr ? "Apprentissage complet + compétitions mensuelles + rapports aux parents + conseiller personnel dédié."
                  : "Full learning + monthly competitions + parent reports + dedicated personal counselor."}
              </p>
              <p className="text-primary font-display text-lg mb-5">5 000 FCFA/{fr ? "mois" : "month"}</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => onLogin("student")} className="glow-btn px-6 py-2.5 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-extrabold text-sm cursor-pointer">
                  🏆 {fr ? "Découvrir" : "Explore"}
                </button>
              </div>
            </div>
            <div className="bg-background/30 border border-primary/30 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-primary/30">
                <p className="font-display text-sm text-primary">📊 {fr ? "Classement mensuel" : "Monthly Ranking"}</p>
              </div>
              {LEADERBOARD.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2.5 px-3.5 py-2" style={{ borderBottom: i < 4 ? "1px solid hsla(38,92%,50%,0.07)" : "none" }}>
                  <span className="text-base w-5 flex-shrink-0">{r.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.79rem]">{r.name}</p>
                    <p className="text-[0.67rem] text-muted-foreground">{r.school}</p>
                  </div>
                  <p className="font-display text-sm">{r.score.toLocaleString()}</p>
                </div>
              ))}
              <div className="p-2.5 text-center text-[0.70rem] text-muted-foreground">
                🔒 {fr ? "Connectez-vous pour voir le classement complet" : "Login to see full ranking"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
