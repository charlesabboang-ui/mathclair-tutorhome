import { useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { getAllExercises, Exercise } from "@/data/exercises";
import { getAllGraphExercises, GraphExercise } from "@/data/graphExercises";
import MathRenderer from "@/components/MathRenderer";
import FunctionGraph from "@/components/FunctionGraph";

interface Props {
  lang: string;
  fr: boolean;
  goTo: (p: string) => void;
  setTutorMsg: (m: string) => void;
  setShowModal: (b: boolean) => void;
}

type CombinedExercise = Exercise | GraphExercise;

function hasGraph(ex: CombinedExercise): ex is GraphExercise {
  return "graph" in ex;
}

export default function Practice({ fr, goTo, setTutorMsg }: Props) {
  const { recordExercise } = useProgress();
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "text" | "graph">("all");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const allExercises = getAllExercises();
  const allGraphExercises = getAllGraphExercises();

  // Combine and filter
  const combined: CombinedExercise[] = [
    ...(typeFilter !== "graph" ? allExercises : []),
    ...(typeFilter !== "text" ? allGraphExercises : []),
  ];

  const filtered = combined.filter(e =>
    (levelFilter === "all" || e.level === levelFilter) &&
    (sectionFilter === "all" || e.section === sectionFilter)
  );

  // Shuffle for variety when mixing (deterministic based on filter)
  const shuffled = filtered.length > 0
    ? [...filtered].sort((a, b) => a.id.localeCompare(b.id))
    : [];

  const q = shuffled[qi % Math.max(shuffled.length, 1)];
  const next = () => { setQi(i => (i + 1) % Math.max(shuffled.length, 1)); setPicked(null); };

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (q) {
      recordExercise(q.topic, i === q.answer);
    }
  };

  const resetFilters = () => {
    setQi(0);
    setPicked(null);
  };

  if (!q) return (
    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
      {fr ? "Aucun exercice trouvé." : "No exercises found."}
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-5">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4 items-center">
        <select
          value={levelFilter}
          onChange={e => { setLevelFilter(e.target.value); resetFilters(); }}
          className="bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body"
        >
          <option value="all">{fr ? "Tous niveaux" : "All Levels"}</option>
          <option value="bepc">BEPC</option>
          <option value="probatoire">Probatoire</option>
          <option value="bac">Baccalauréat</option>
        </select>

        <select
          value={sectionFilter}
          onChange={e => { setSectionFilter(e.target.value); resetFilters(); }}
          className="bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body"
        >
          <option value="all">{fr ? "Toutes sections" : "All Sections"}</option>
          <option value="francophone">Francophone</option>
          <option value="anglophone">Anglophone</option>
        </select>

        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value as "all" | "text" | "graph"); resetFilters(); }}
          className="bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body"
        >
          <option value="all">{fr ? "Tous types" : "All Types"}</option>
          <option value="text">{fr ? "📝 Texte" : "📝 Text"}</option>
          <option value="graph">{fr ? "📊 Graphiques" : "📊 Graphs"}</option>
        </select>

        <span className="text-xs text-muted-foreground ml-2">
          {shuffled.length} {fr ? "exercices" : "exercises"}
          {hasGraph(q) && <span className="ml-1.5 text-secondary">📊</span>}
        </span>

        <button
          onClick={next}
          className="ml-auto px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold border-none cursor-pointer"
        >
          {fr ? "Suivant →" : "Next →"}
        </button>
      </div>

      {/* Exercise card */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 max-w-3xl">
        {/* Header */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <span className="text-[0.68rem] text-muted-foreground uppercase tracking-wider">
            {q.level.toUpperCase()} · {q.topic}
          </span>
          <span className={`text-[0.64rem] px-2 py-0.5 rounded-full font-bold ${
            q.section === "francophone" ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary"
          }`}>
            {q.section}
          </span>
          {hasGraph(q) && (
            <span className="text-[0.64rem] px-2 py-0.5 rounded-full font-bold bg-primary/15 text-primary">
              📊 {fr ? "Graphique" : "Graph"}
            </span>
          )}
        </div>

        {/* Graph (if present) */}
        {hasGraph(q) && (
          <div className="mb-4 flex justify-center">
            <FunctionGraph {...q.graph} />
          </div>
        )}

        {/* Question */}
        <div className="text-base leading-relaxed mb-5 font-medium">
          <MathRenderer text={q.question} />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-3.5">
          {q.options.map((opt, i) => {
            const show = picked !== null;
            const isCorrect = i === q.answer;
            const isMe = picked === i;
            let cls = "border-border bg-muted text-foreground";
            if (show && isCorrect) cls = "border-accent bg-accent/10 text-accent";
            else if (show && isMe) cls = "border-destructive bg-destructive/10 text-destructive";
            return (
              <div
                key={i}
                onClick={() => handlePick(i)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm border cursor-pointer transition-all ${cls}`}
              >
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <MathRenderer text={opt} className="text-sm" />
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {picked !== null && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-sm leading-relaxed mb-3.5">
            <strong>
              {picked === q.answer
                ? "✅ Correct!"
                : `❌ ${fr ? "Incorrect — réponse:" : "Incorrect — answer:"} ${String.fromCharCode(65 + q.answer)}`}
            </strong>
            <MathRenderer text={q.explanation} className="mt-2" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setTutorMsg(`Explain step by step: ${q.question}`); goTo("tutor"); }}
            className="px-4 py-1.5 rounded-full border border-border bg-transparent text-muted2 text-xs font-bold cursor-pointer hover:bg-muted transition-colors"
          >
            🗣️ {fr ? "Demander à Clair" : "Ask Tutor"}
          </button>
          <button
            onClick={next}
            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold border-none cursor-pointer"
          >
            {fr ? "Suivant →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
