import { useState } from "react";
import { GeoGebraEmbed, TldrawCanvas } from "@/components/EmbeddedTools";

interface Props { fr: boolean }

export default function Whiteboard({ fr }: Props) {
  const [tab, setTab] = useState<"draw" | "graph">("draw");
  const [formula, setFormula] = useState("y = x^2 - 2x + 1 | y = 2x + 3");

  return (
    <div className="absolute inset-0 overflow-y-auto p-3 md:p-5 flex flex-col gap-3">
      <div className="flex gap-2">
        {(["draw", "graph"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              tab === t ? "bg-secondary text-secondary-foreground border-secondary" : "border-border bg-muted text-muted-foreground"
            }`}>
            {t === "draw" ? (fr ? "✏️ Tableau (tldraw)" : "✏️ Whiteboard (tldraw)") : (fr ? "📈 Graphique (GeoGebra)" : "📈 Graph (GeoGebra)")}
          </button>
        ))}
      </div>

      {tab === "draw" && (
        <div className="flex-1 min-h-[70vh]">
          <p className="text-xs text-muted-foreground mb-2">
            {fr ? "Dessinez figures, schémas et démonstrations. Sauvegarde locale automatique."
              : "Sketch figures, diagrams, proofs. Auto-saved locally in your browser."}
          </p>
          <TldrawCanvas height={window.innerHeight - 220} persistenceKey="mathclair-main-whiteboard" />
        </div>
      )}

      {tab === "graph" && (
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">
            {fr ? "Formule(s) — séparez par |" : "Formula(s) — separate with |"}
          </label>
          <input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="y = sin(x) | f(x) = x^3"
            className="w-full bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-mono"
          />
          <GeoGebraEmbed formula={formula} height={window.innerHeight - 260} />
        </div>
      )}
    </div>
  );
}
