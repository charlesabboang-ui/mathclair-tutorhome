import { useState } from "react";

interface Props {
  lang: string;
  fr: boolean;
  goTo: (p: string) => void;
  setTutorMsg: (m: string) => void;
  setShowModal: (b: boolean) => void;
}

const TOPICS_DATA = [
  { icon: "📐", name: "Quadratic Equations", nameFr: "Équations du 2nd degré", sub: "Factorisation, formula, discriminant", color: "bg-secondary", level: "Senior" },
  { icon: "⭕", name: "Circle Theorems", nameFr: "Théorèmes du cercle", sub: "Angles, tangents, cyclic quads", color: "bg-emerald", level: "Senior" },
  { icon: "∫", name: "Differentiation", nameFr: "Dérivation", sub: "Chain rule, product rule, apps", color: "bg-primary", level: "A-Level" },
  { icon: "🎲", name: "Probability", nameFr: "Probabilités", sub: "Tree diagrams, Venn, counting", color: "bg-destructive", level: "Senior" },
  { icon: "🔢", name: "Sets & Logic", nameFr: "Ensembles & Logique", sub: "Union, intersection, Venn", color: "bg-cyan-500", level: "Junior" },
  { icon: "∑", name: "Sequences & Series", nameFr: "Suites & Séries", sub: "AP, GP, sum formulas", color: "bg-secondary", level: "A-Level" },
  { icon: "→", name: "Vectors", nameFr: "Vecteurs", sub: "Addition, dot product, 2D/3D", color: "bg-emerald", level: "A-Level" },
  { icon: "∫dx", name: "Integration", nameFr: "Intégration", sub: "Definite, areas, by parts", color: "bg-primary", level: "A-Level" },
  { icon: "logₓ", name: "Indices & Logs", nameFr: "Indices & Logarithmes", sub: "Laws of indices, log properties", color: "bg-cyan-500", level: "Senior" },
  { icon: "📊", name: "Data Analysis", nameFr: "Analyse de données", sub: "Mean, median, variance", color: "bg-destructive", level: "Junior" },
];

const LV: Record<string, { bg: string; c: string }> = {
  Junior: { bg: "bg-accent/15", c: "text-accent" },
  Senior: { bg: "bg-primary/15", c: "text-primary" },
  "A-Level": { bg: "bg-secondary/15", c: "text-secondary" },
};

export default function Topics({ fr, goTo, setTutorMsg }: Props) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? TOPICS_DATA : TOPICS_DATA.filter((t) => t.level === filter);

  function openTopic(name: string) {
    setTutorMsg(`Teach me: ${name}. Start simply.`);
    goTo("tutor");
  }

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-5">
      <div className="flex gap-1.5 flex-wrap mb-4">
        {["All", "Junior", "Senior", "A-Level"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
              filter === f ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}>{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {shown.map((t) => {
          const lv = LV[t.level];
          return (
            <div key={t.name} onClick={() => openTopic(t.name)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 hover:border-secondary/30">
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${t.color}`} />
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="font-display text-sm mb-1">{fr ? t.nameFr : t.name}</p>
              <p className="text-xs text-muted2 leading-relaxed mb-2.5">{t.sub}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[0.64rem] font-bold ${lv?.bg} ${lv?.c}`}>{t.level}</span>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
