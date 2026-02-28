import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getAllExercises, type Exercise } from "@/data/exercises";

export default function Practice() {
  const { lang, goTo, setTutorMsg, fr } = useApp();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const allExercises = getAllExercises();
  const filtered = allExercises.filter(e =>
    (levelFilter === "all" || e.level === levelFilter) &&
    (sectionFilter === "all" || e.section === sectionFilter)
  );

  const q = filtered[qi % filtered.length];
  const next = () => { setQi(i => (i + 1) % filtered.length); setPicked(null); };

  if (!q) return <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No exercises found.</div>;

  return (
    <div className="absolute inset-0 overflow-y-auto p-5">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4 items-center">
        <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setQi(0); setPicked(null); }}
          className="bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body">
          <option value="all">{fr ? "Tous niveaux" : "All Levels"}</option>
          <option value="bepc">BEPC</option>
          <option value="probatoire">Probatoire</option>
          <option value="bac">Baccalauréat</option>
        </select>
        <select value={sectionFilter} onChange={e => { setSectionFilter(e.target.value); setQi(0); setPicked(null); }}
          className="bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body">
          <option value="all">{fr ? "Toutes sections" : "All Sections"}</option>
          <option value="francophone">Francophone</option>
          <option value="anglophone">Anglophone</option>
        </select>
        <span className="text-xs text-muted-foreground ml-2">{filtered.length} {fr ? "exercices" : "exercises"}</span>
        <button onClick={next} className="ml-auto px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold border-none cursor-pointer">
          {fr ? "Suivant →" : "Next →"}
        </button>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-5 max-w-2xl">
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="text-[0.68rem] text-muted-foreground uppercase tracking-wider">{q.level.toUpperCase()} · {q.topic}</span>
          <span className={`text-[0.64rem] px-2 py-0.5 rounded-full font-bold ${q.section === "francophone" ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary"}`}>
            {q.section}
          </span>
        </div>
        <p className="text-base leading-relaxed mb-5 font-medium">{q.question}</p>

        <div className="flex flex-col gap-2 mb-3.5">
          {q.options.map((opt, i) => {
            const show = picked !== null;
            const isCorrect = i === q.answer;
            const isMe = picked === i;
            let cls = "border-border bg-muted text-foreground";
            if (show && isCorrect) cls = "border-accent bg-accent/10 text-accent";
            else if (show && isMe) cls = "border-destructive bg-destructive/10 text-destructive";
            return (
              <div key={i} onClick={() => { if (picked === null) setPicked(i); }}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm border cursor-pointer transition-all ${cls}`}>
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            );
          })}
        </div>

        {picked !== null && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-sm leading-relaxed mb-3.5">
            <strong>{picked === q.answer ? "✅ Correct!" : `❌ ${fr ? "Incorrect — réponse:" : "Incorrect — answer:"} ${String.fromCharCode(65 + q.answer)}`}</strong>
            <div className="math-block mt-2">{q.explanation}</div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setTutorMsg(`Explain step by step: ${q.question}`); goTo("tutor"); }}
            className="px-4 py-1.5 rounded-full border border-border bg-transparent text-muted2 text-xs font-bold cursor-pointer hover:bg-muted transition-colors">
            🗣️ {fr ? "Demander à Clair" : "Ask Tutor"}
          </button>
          <button onClick={next} className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold border-none cursor-pointer">
            {fr ? "Suivant →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
