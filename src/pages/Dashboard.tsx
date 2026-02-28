import { useApp } from "@/contexts/AppContext";

export default function Dashboard() {
  const { lang, goTo, user, fr } = useApp();
  const name = user?.name?.split(" ")[0] || "Élève";

  return (
    <div className="absolute inset-0 overflow-y-auto p-5">
      {/* Welcome */}
      <div className="rounded-xl p-5 mb-4 relative overflow-hidden border border-secondary/20"
        style={{ background: "linear-gradient(130deg, hsl(230,30%,15%), hsl(222,47%,11%))" }}>
        <h2 className="font-display text-xl mb-1">
          {fr ? `Bonjour, ${name} 👋` : `Hello, ${name} 👋`}
        </h2>
        <p className="text-muted2 text-sm">{fr ? "3 jours consécutifs d'étude. Continuez !" : "3-day study streak. Keep it going!"}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{user?.school} · {user?.level}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {[
          { l: "Topics Done", v: "12", c: "text-primary" },
          { l: "Practice Avg", v: "74%", c: "text-emerald" },
          { l: "Day Streak", v: "🔥 3", c: "text-secondary" },
          { l: "Time Today", v: "45 min", c: "text-foreground" },
        ].map(({ l, v, c }) => (
          <div key={l} className="bg-card border border-border rounded-xl p-3.5">
            <p className="text-[0.66rem] text-muted-foreground uppercase tracking-wider mb-1">{l}</p>
            <p className={`font-display text-2xl ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📊 {fr ? "Progrès" : "Progress"}</p>
          {[
            { n: "Algebra", p: 80 },
            { n: "Geometry", p: 55 },
            { n: "Statistics", p: 40 },
            { n: "Calculus", p: 20 },
          ].map(({ n, p }) => (
            <div key={n} className="flex items-center gap-2 mb-2">
              <span className="text-xs w-20 flex-shrink-0 text-muted2">{n}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${p}%` }} />
              </div>
              <span className="text-[0.66rem] text-muted-foreground w-6 text-right">{p}%</span>
            </div>
          ))}
        </div>

        {/* Streak */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">🔥 Streak</p>
          <div className="flex gap-1 flex-wrap mb-3">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-[0.65rem] font-bold ${
                i < 3 ? "bg-accent/20 text-accent" : i === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{d}</div>
            ))}
          </div>
          <p className="text-xs text-muted2 leading-relaxed mb-3">
            🎯 {fr ? "Objectif : Équations du 2nd degré" : "Goal: Quadratic Equations"}
          </p>
          <button onClick={() => goTo("practice")}
            className="px-4 py-1.5 rounded-full border-none bg-primary text-primary-foreground text-xs font-bold cursor-pointer">
            {fr ? "Commencer →" : "Start →"}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="font-display text-sm mb-3">🚀 {fr ? "Continuer" : "Continue Learning"}</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => goTo("tutor")} className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold border-none cursor-pointer">🗣️ {fr ? "Tuteur" : "Tutor"}</button>
          <button onClick={() => goTo("topics")} className="px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold border-none cursor-pointer">📚 {fr ? "Thèmes" : "Topics"}</button>
          <button onClick={() => goTo("exams")} className="px-4 py-1.5 rounded-full border border-border bg-transparent text-muted2 text-xs font-bold cursor-pointer">🎯 {fr ? "Examens" : "Exams"}</button>
        </div>
      </div>
    </div>
  );
}
