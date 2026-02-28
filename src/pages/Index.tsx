import { useApp } from "@/contexts/AppContext";

const LEADERBOARD = [
  { name: "Aisha N.", school: "GBHS Yaoundé", score: 9840, badge: "🥇", delta: "+240" },
  { name: "Paul M.", school: "Lycée Leclerc", score: 9610, badge: "🥈", delta: "+185" },
  { name: "Fatima B.", school: "CES Douala II", score: 9420, badge: "🥉", delta: "+210" },
  { name: "Eric T.", school: "GBSS Bamenda", score: 9100, badge: "🎖️", delta: "+95" },
  { name: "Claire K.", school: "Lycée Bilingue", score: 8870, badge: "🎖️", delta: "+130" },
];

export default function Landing() {
  const { lang, goLogin, fr } = useApp();

  return (
    <div className="min-h-screen bg-background font-body text-foreground overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none grid-bg" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/90 sticky top-0 backdrop-blur-xl z-10">
        <div className="font-display text-xl">Math<span className="text-primary">Clair</span></div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => goLogin("parent")}
            className="px-4 py-1.5 rounded-full border border-border bg-transparent text-muted2 text-xs font-bold cursor-pointer hover:bg-muted transition-colors">
            👨‍👩‍👧 Parent
          </button>
          <button onClick={() => goLogin("student")}
            className="px-4 py-1.5 rounded-full border-none bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:brightness-110 transition-all">
            {fr ? "Connexion élève →" : "Student Login →"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-20 pb-12 relative z-5">
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-1.5 rounded-full text-xs font-semibold mb-7">
          🇨🇲 {fr ? "Conçu pour les lycées camerounais" : "Designed for Cameroon Secondary Schools"}
        </div>
        <h1 className="font-display text-4xl md:text-6xl leading-tight mb-4">
          {fr ? "Votre tuteur" : "Your Personal"}<br />
          <span className="italic text-primary font-serif">{fr ? "Maths personnel" : "Math Tutor"}</span><br />
          {fr ? "à domicile" : "at Home"}
        </h1>
        <p className="text-base text-muted2 max-w-lg leading-relaxed mb-9">
          {fr ? "Tutorat IA bilingue voix-à-voix. 3 000+ exercices BEPC, Probatoire, Baccalauréat. MINESEC & GCE."
            : "Bilingual voice-to-voice AI tutoring. 3,000+ exercises for BEPC, Probatoire, Baccalauréat. MINESEC & GCE."}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => goLogin("student")}
            className="px-8 py-3 rounded-full border-none bg-primary text-primary-foreground font-bold text-sm cursor-pointer hover:brightness-110 transition-all">
            🎓 {fr ? "Commencer gratuitement" : "Start Learning Free"}
          </button>
          <button onClick={() => goLogin("parent")}
            className="px-8 py-3 rounded-full border border-border bg-transparent text-muted2 font-bold text-sm cursor-pointer hover:bg-muted transition-colors">
            👨‍👩‍👧 {fr ? "Espace parent" : "Parent Space"}
          </button>
        </div>
        <div className="flex gap-10 mt-14 flex-wrap justify-center">
          {[
            ["3 000+", fr ? "Exercices" : "Exercises"],
            ["10+", fr ? "Niveaux" : "Class Levels"],
            ["2", "Curricula"],
            ["EN/FR", "Bilingue"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl text-primary">{n}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-8 pb-14 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-center mb-2">{fr ? "Tout ce dont un élève a besoin" : "Everything a Student Needs"}</h2>
        <p className="text-center text-muted-foreground mb-8">{fr ? "Conçu pour le système éducatif camerounais" : "Built for the Cameroonian education system"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { color: "bg-primary", icon: "🗣️", h: fr ? "Tuteur vocal IA" : "Voice AI Tutor", p: fr ? "Parlez avec Clair voix-à-voix. Explications pas à pas." : "Speak with Clair voice-to-voice. Step-by-step explanations." },
            { color: "bg-emerald", icon: "📐", h: fr ? "3 000+ Exercices" : "3,000+ Exercises", p: fr ? "BEPC, Probatoire, Bac. Francophone & Anglophone." : "BEPC, Probatoire, Bac. Francophone & Anglophone sections." },
            { color: "bg-secondary", icon: "📝", h: fr ? "Formules mathématiques" : "Math Formulas", p: fr ? "Rendu professionnel des formules. Style examen." : "Professional formula rendering. Exam-style presentation." },
            { color: "bg-destructive", icon: "👨‍👩‍👧", h: fr ? "Contrôle parental" : "Parental Control", p: fr ? "Rapports WhatsApp, alertes, restriction de sujets." : "WhatsApp reports, alerts, topic restrictions." },
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
      <div className="px-8 pb-16 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 p-10"
          style={{ background: "linear-gradient(135deg, hsl(28,30%,4%), hsl(222,47%,11%))" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsla(38,92%,50%,0.12) 0%, transparent 65%)" }} />
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                ⚡ {fr ? "PLAN EXCLUSIF" : "EXCLUSIVE PLAN"}
              </div>
              <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">
                {fr ? "Montez au niveau " : "Rise to the "}<span className="gold-text">Olympiade</span>
              </h2>
              <p className="text-muted2 leading-relaxed mb-5 text-sm">
                {fr ? "Compétitions mensuelles, médailles, certificats — 5 000 FCFA/mois."
                  : "Monthly competitions, medals, certificates — 5,000 FCFA/month."}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => goLogin("student")} className="glow-btn px-6 py-2.5 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-extrabold text-sm cursor-pointer">
                  🏆 {fr ? "Découvrir" : "Explore"}
                </button>
                <button onClick={() => goLogin("parent")}
                  className="px-5 py-2.5 rounded-full border border-primary/30 bg-transparent text-primary font-bold text-sm cursor-pointer">
                  👨‍👩‍👧 {fr ? "Espace parent" : "Parent Space"} →
                </button>
              </div>
            </div>
            {/* Mini leaderboard */}
            <div className="bg-background/30 border border-primary/30 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-primary/30">
                <p className="font-display text-sm text-primary">📊 {fr ? "Classement mensuel" : "Monthly Ranking"}</p>
                <p className="text-[0.69rem] text-muted-foreground mt-0.5">248 {fr ? "élèves ce mois" : "students this month"}</p>
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
                🔒 {fr ? "Connectez-vous pour voir tout" : "Login to see full ranking"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
