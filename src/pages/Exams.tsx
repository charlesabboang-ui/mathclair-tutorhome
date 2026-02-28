import { useApp } from "@/contexts/AppContext";

export default function Exams() {
  const { lang, goTo, fr } = useApp();

  const cards = [
    { ic: "🏫", name: "BEPC", desc: fr ? "Brevet du Premier Cycle. Épreuves de 3ème." : "End of Junior Secondary. Form 5 papers.", badge: "Francophone", bg: "bg-accent/15", c: "text-accent" },
    { ic: "📋", name: "GCE O-Level", desc: "Form 5 Mathematics past papers — all topics.", badge: "Anglophone", bg: "bg-secondary/15", c: "text-secondary" },
    { ic: "📝", name: "Probatoire", desc: fr ? "Examen de passage en Terminale." : "Gateway to Terminale/Upper Sixth.", badge: "Francophone", bg: "bg-cyan-400/15", c: "text-cyan-400" },
    { ic: "🎓", name: "Baccalauréat", desc: fr ? "Examen national. Séries A, C, D, E." : "National Baccalauréat. Series A, C, D, E.", badge: "Francophone", bg: "bg-primary/15", c: "text-primary" },
    { ic: "🏆", name: "GCE A-Level", desc: "Pure & Applied Mathematics. PM1, PM2, PM3.", badge: "Anglophone", bg: "bg-violet/15", c: "text-violet" },
    { ic: "🏅", name: "Concours", desc: fr ? "ENS, ENSET, Polytechnique." : "ENS, ENSET, Polytechnique entrance exams.", badge: "Competitive", bg: "bg-destructive/15", c: "text-destructive" },
    { ic: "⏱️", name: fr ? "Examen Blanc" : "Timed Mock", desc: fr ? "Conditions d'examen réelles. 3h." : "Real exam conditions. 3-hour timer.", badge: "All Levels", bg: "bg-accent/10", c: "text-accent" },
    { ic: "🎯", name: fr ? "Points Faibles" : "Weak Areas", desc: fr ? "Clair identifie vos lacunes." : "AI spots your weak sub-topics.", badge: "AI-Powered", bg: "bg-secondary/10", c: "text-secondary" },
  ];

  return (
    <div className="absolute inset-0 overflow-y-auto p-5">
      <p className="text-muted2 mb-4 text-sm">
        {fr ? "Préparez-vous à tous les examens nationaux du Cameroun avec 3 000+ exercices."
          : "Prepare for all Cameroonian national exams with 3,000+ exercises."}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((e) => (
          <div key={e.name} onClick={() => goTo("practice")}
            className="bg-card border border-border rounded-xl p-4 text-center cursor-pointer transition-all hover:-translate-y-1">
            <div className="text-3xl mb-2.5">{e.ic}</div>
            <p className="font-display text-sm mb-1">{e.name}</p>
            <p className="text-xs text-muted2 mb-3 leading-relaxed">{e.desc}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.66rem] font-bold ${e.bg} ${e.c}`}>{e.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
