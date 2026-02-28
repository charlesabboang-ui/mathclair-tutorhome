import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function ParentControl() {
  const { lang, user, goTo, fr } = useApp();
  const [limit, setLimit] = useState("1 hour");

  return (
    <div className="absolute inset-0 overflow-y-auto p-5">
      {/* Child info */}
      <div className="rounded-xl p-5 mb-4 border border-secondary/20"
        style={{ background: "linear-gradient(130deg, hsl(230,30%,15%), hsl(222,47%,11%))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xl">🎓</div>
          <div>
            <h2 className="font-display text-lg">{user?.child || "Emmanuel Kamga"}</h2>
            <p className="text-xs text-muted-foreground">GHS Buea · Form 5</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📊 {fr ? "Progrès hebdomadaire" : "Weekly Progress"}</p>
          {[
            { n: "Algebra", p: 80, c: "bg-secondary" },
            { n: "Geometry", p: 55, c: "bg-emerald" },
            { n: "Statistics", p: 40, c: "bg-primary" },
            { n: "Calculus", p: 20, c: "bg-destructive" },
          ].map(({ n, p, c }) => (
            <div key={n} className="flex items-center gap-2 mb-2">
              <span className="text-xs w-20 text-muted2">{n}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c}`} style={{ width: `${p}%` }} />
              </div>
              <span className="text-[0.68rem] text-muted-foreground w-7 text-right">{p}%</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2.5">⚠️ {fr ? "Besoin de renfort en" : "Needs work on:"} <strong className="text-primary">Calculus</strong></p>
        </div>

        {/* Screen time */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">⏱️ {fr ? "Temps d'écran" : "Screen Time"}</p>
          <p className="text-xs text-muted-foreground mb-2">{fr ? "Limite quotidienne :" : "Daily limit:"}</p>
          <div className="flex gap-1.5 flex-wrap">
            {["30 min", "1 hour", "2 hours", "Unlimited"].map((t) => (
              <button key={t} onClick={() => setLimit(t)}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all border ${
                  limit === t ? "border-primary bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">🔔 {fr ? "Alertes récentes" : "Recent Alerts"}</p>
          {[
            { ic: "📊", tx: "Scored 45% on Statistics", tm: "Today, 3:24 PM" },
            { ic: "⏰", tx: "Daily limit reached", tm: "Yesterday, 6:15 PM" },
            { ic: "🔥", tx: "3-day streak!", tm: "Today, 8:00 AM" },
          ].map(({ ic, tx, tm }) => (
            <div key={tm} className="flex items-center gap-2 p-2.5 bg-muted rounded-lg text-sm mb-1.5">
              <span>{ic}</span>
              <div>
                <div className="text-xs">{tx}</div>
                <div className="text-[0.66rem] text-muted-foreground mt-0.5">{tm}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📱 WhatsApp</p>
          <button onClick={() => {
            const msg = encodeURIComponent(`📊 Rapport MathClair\n\n• Algèbre: 80% ✅\n• Géométrie: 55% ✅\n• Statistiques: 40% ⚠️\n• Calcul: 20% ❌\n\n→ mathclair.cm`);
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }}
            className="w-full py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-sm border-none cursor-pointer">
            📲 {fr ? "Envoyer le rapport" : "Send Report via WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
