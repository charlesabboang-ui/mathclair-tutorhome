import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function Olympiade() {
  const { lang, setShowModal, fr } = useApp();
  const [tab, setTab] = useState("student");

  const STUDENT_PERKS = [
    ["🏆", "800+ Olympiad Problems", fr ? "AMC, CEMAC, Bac, GCE — tous niveaux." : "AMC, CEMAC, Bac, GCE — all levels."],
    ["📅", "Monthly Competitions", fr ? "Premier samedi du mois. Classement national." : "First Saturday monthly. National ranking."],
    ["🥇", "Medals & Badges", fr ? "Bronze, Argent, Or, Platine." : "Bronze, Silver, Gold, Platinum."],
    ["📜", "Official Certificates", fr ? "Reconnus au Cameroun & CEMAC." : "Recognised across Cameroon & CEMAC."],
    ["👨‍🏫", "Expert Sessions", fr ? "Avec champions nationaux." : "With national math champions."],
    ["🧠", "AI Strategy Coach", fr ? "Techniques de compétition." : "Competition thinking training."],
  ];

  const PARENT_PERKS = [
    ["📱", "Real-Time Dashboard", fr ? "Chaque session et score — en direct." : "Every session and score — live."],
    ["📞", "Monthly Coaching Call", fr ? "Appel vidéo 15 min avec un coach." : "15-min video call with a coach."],
    ["🏅", "Competition Alerts", fr ? "Alertes WhatsApp médailles et rang." : "WhatsApp alerts for medals and ranks."],
    ["📄", "Monthly PDF Report", fr ? "Rapport avec graphiques et recommandations." : "Report with graphs and next steps."],
    ["🎓", "University Guidance", fr ? "Conseils ENS, ENSET, Polytechnique." : "ENS, ENSET, Polytechnique guidance."],
    ["🔒", "Premium Controls", fr ? "Horaires, conversations IA, écran." : "Schedules, AI conversations, screen time."],
  ];

  const perks = tab === "student" ? STUDENT_PERKS : PARENT_PERKS;

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-12 pb-10 text-center"
        style={{ background: "linear-gradient(180deg, hsl(28,30%,4%) 0%, hsl(222,47%,6%) 100%)" }}>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(38,92%,50%,0.16) 0%, transparent 68%)" }} />
        <div className="float-anim text-5xl mb-3 inline-block">🏆</div>
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          ⚡ {fr ? "PLAN EXCLUSIF MATHCLAIR" : "MATHCLAIR EXCLUSIVE PLAN"}
        </div>
        <h1 className="font-display text-3xl md:text-4xl leading-tight mb-3">
          {fr ? "Le Plan " : "The "}<span className="gold-text">Olympiade</span>
        </h1>
        <p className="text-sm text-muted2 max-w-md mx-auto leading-relaxed mb-6">
          {fr ? "Compétitions mensuelles, médailles, certificats & coaching d'élite."
            : "Monthly competitions, medals, certificates & elite coaching."}
        </p>
        <div className="inline-flex bg-muted rounded-full p-1 gap-1">
          {[
            { k: "student", l: fr ? "🎓 Élève" : "🎓 Students" },
            { k: "parent", l: fr ? "👨‍👩‍👧 Parent" : "👨‍👩‍👧 Parents" },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-1.5 rounded-full border-none font-bold text-sm cursor-pointer transition-all ${
                tab === k ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Perks */}
      <div className="px-5 pt-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perks.map(([ico, title, desc], i) => (
            <div key={title} className="animate-slide-up rounded-xl p-4 relative overflow-hidden border border-primary/30"
              style={{ background: "linear-gradient(135deg, hsl(28,30%,5%), hsl(222,47%,11%))", animationDelay: `${i * 0.05}s` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-gold-light to-transparent" />
              <div className="text-2xl mb-2.5">{ico}</div>
              <p className="font-display text-sm mb-1">{title}</p>
              <p className="text-xs text-muted2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-5 py-10 max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="font-display text-sm mb-2">Free</p>
            <p className="font-display text-3xl mb-4">0 <span className="text-sm text-muted-foreground font-body">FCFA</span></p>
            {["AI Tutor (20 msgs/day)", "5 Topics", "10 Practice Questions"].map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            {["Olympiad Problems", "Competitions", "Certificates"].map((f) => (
              <p key={f} className="text-xs text-muted-foreground/50 mb-1.5">❌ {f}</p>
            ))}
          </div>
          <div className="rounded-2xl p-5 relative overflow-hidden border-2 border-primary"
            style={{ background: "linear-gradient(140deg, hsl(28,30%,5%), hsl(222,47%,11%))" }}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-gold-light to-primary" />
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[0.64rem] font-extrabold">⭐ BEST</div>
            <p className="font-display text-sm text-primary mb-2">Olympiade</p>
            <p className="font-display text-3xl text-primary mb-4">5 000 <span className="text-sm text-muted-foreground font-body">FCFA/mois</span></p>
            {["Unlimited AI Tutor", "All Topics + A-Level", "800+ Olympiad Questions", "Monthly Competitions", "Medals & Certificates", "Expert Sessions"].map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full mt-4 py-3 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-bold text-sm cursor-pointer glow-btn">
              🚀 {fr ? "S'abonner" : "Subscribe Now"}
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-14 text-center">
        <div className="float-anim text-4xl mb-3 inline-block">🚀</div>
        <h2 className="font-display text-xl mb-2">{fr ? "Prêt à rejoindre l'élite ?" : "Ready to join the elite?"}</h2>
        <p className="text-muted2 max-w-md mx-auto text-sm mb-6 leading-relaxed">
          {fr ? "248 élèves concourent chaque mois." : "248 students compete every month."}
        </p>
        <button onClick={() => setShowModal(true)}
          className="glow-btn px-10 py-3 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-extrabold text-base cursor-pointer">
          🏆 {fr ? "S'abonner au Plan Olympiade" : "Subscribe to Olympiade Plan"}
        </button>
        <p className="text-[0.72rem] text-muted-foreground mt-3">
          5 000 FCFA/mois · MTN MoMo & Orange Money
        </p>
      </div>
    </div>
  );
}
