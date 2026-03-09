import { useState } from "react";

interface Props {
  lang: string;
  fr: boolean;
  setShowModal: (b: boolean) => void;
}

export default function Olympiade({ fr, setShowModal }: Props) {
  const [tab, setTab] = useState("student");

  const STUDENT_PERKS = [
    ["🎓", fr ? "Apprentissage complet" : "Full Learning Access", fr ? "Tuteur IA illimité, tous les thèmes et exercices." : "Unlimited AI Tutor, all topics and exercises."],
    ["🏆", fr ? "800+ problèmes d'olympiades" : "800+ Olympiad Problems", fr ? "AMC, CEMAC, Bac, GCE — tous niveaux confondus." : "AMC, CEMAC, Bac, GCE — all levels."],
    ["📅", fr ? "Compétitions mensuelles" : "Monthly Competitions", fr ? "Chaque premier samedi du mois. Classement national." : "First Saturday monthly. National ranking."],
    ["🥇", fr ? "Médailles et badges" : "Medals & Badges", fr ? "Bronze, Argent, Or, Platine — à collectionner." : "Bronze, Silver, Gold, Platinum."],
    ["📜", fr ? "Certificats officiels" : "Official Certificates", fr ? "Reconnus au Cameroun et dans la zone CEMAC." : "Recognised across Cameroon & CEMAC."],
    ["🧑‍🏫", fr ? "Conseiller personnel dédié" : "Personal Dedicated Counselor", fr ? "Un coach attitré pour guider votre parcours." : "A dedicated coach to guide your journey."],
  ];

  const PARENT_PERKS = [
    ["📊", fr ? "Rapports détaillés" : "Detailed Reports", fr ? "Rapport mensuel PDF avec graphiques et recommandations." : "Monthly PDF report with graphs and recommendations."],
    ["📱", fr ? "Tableau de bord en direct" : "Real-Time Dashboard", fr ? "Suivez chaque session et score en temps réel." : "Track every session and score — live."],
    ["📞", fr ? "Appel mensuel avec le coach" : "Monthly Coaching Call", fr ? "Appel vidéo de 15 min avec le conseiller dédié." : "15-min video call with the dedicated counselor."],
    ["🏅", fr ? "Alertes compétitions" : "Competition Alerts", fr ? "Notifications WhatsApp des médailles et classements." : "WhatsApp alerts for medals and ranks."],
    ["🎓", fr ? "Orientation scolaire" : "University Guidance", fr ? "Conseils pour l'ENS, l'ENSET, Polytechnique." : "ENS, ENSET, Polytechnique guidance."],
    ["🔒", fr ? "Contrôles avancés" : "Premium Controls", fr ? "Horaires, conversations IA, temps d'écran." : "Schedules, AI conversations, screen time."],
  ];

  const perks = tab === "student" ? STUDENT_PERKS : PARENT_PERKS;

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background">
      <div className="relative overflow-hidden px-4 md:px-6 pt-10 md:pt-12 pb-10 text-center"
        style={{ background: "linear-gradient(180deg, hsl(28,30%,4%) 0%, hsl(222,47%,6%) 100%)" }}>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(38,92%,50%,0.16) 0%, transparent 68%)" }} />
        <div className="float-anim text-5xl mb-3 inline-block">🏆</div>
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          ⚡ {fr ? "FORMULE EXCLUSIVE MATHCLAIR" : "MATHCLAIR EXCLUSIVE PLAN"}
        </div>
        <h1 className="font-display text-2xl md:text-4xl leading-tight mb-3">
          {fr ? "La formule " : "The "}<span className="gold-text">Olympiade</span>
        </h1>
        <p className="text-sm text-muted2 max-w-md mx-auto leading-relaxed mb-6">
          {fr ? "Apprentissage complet + compétitions + rapports aux parents + conseiller personnel."
            : "Full learning + competitions + parent reports + personal counselor."}
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

      <div className="px-4 md:px-5 pt-8 max-w-4xl mx-auto">
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

      <div className="px-4 md:px-5 py-10 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
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
              ? ["Tous les thèmes", "Compétitions", "Conseiller dédié"]
              : ["All Topics", "Competitions", "Personal Counselor"]
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
              ? ["Tuteur IA illimité", "Tous les thèmes", "Exercices illimités", "Préparation examens", "Suivi de progression"]
              : ["Unlimited AI Tutor", "All Topics", "Unlimited Exercises", "Exam Preparation", "Progress Tracking"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            {(fr
              ? ["Compétitions", "Conseiller dédié"]
              : ["Competitions", "Personal Counselor"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted-foreground/50 mb-1.5">❌ {f}</p>
            ))}
            <button onClick={() => setShowModal(true)}
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
              ? ["Tout le plan Apprentissage", "Compétitions mensuelles", "Rapports détaillés parents", "Conseiller personnel dédié", "Médailles & certificats", "800+ problèmes olympiades"]
              : ["Everything in Learn plan", "Monthly Competitions", "Detailed Parent Reports", "Personal Dedicated Counselor", "Medals & Certificates", "800+ Olympiad Problems"]
            ).map((f) => (
              <p key={f} className="text-xs text-muted2 mb-1.5">✅ {f}</p>
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full mt-4 py-3 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-bold text-sm cursor-pointer glow-btn">
              🚀 {fr ? "S'abonner" : "Subscribe Now"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-5 pb-14 text-center">
        <div className="float-anim text-4xl mb-3 inline-block">🚀</div>
        <h2 className="font-display text-xl mb-2">{fr ? "Prêt à rejoindre l'élite ?" : "Ready to join the elite?"}</h2>
        <button onClick={() => setShowModal(true)}
          className="glow-btn px-10 py-3 rounded-full border-none bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-extrabold text-base cursor-pointer">
          🏆 {fr ? "S'abonner à la formule Olympiade" : "Subscribe to Olympiade Plan"}
        </button>
        <p className="text-[0.72rem] text-muted-foreground mt-3">
          {fr ? "À partir de 1 700 FCFA/mois · MTN MoMo & Orange Money" : "From 1,700 FCFA/month · MTN MoMo & Orange Money"}
        </p>
      </div>
    </div>
  );
}
