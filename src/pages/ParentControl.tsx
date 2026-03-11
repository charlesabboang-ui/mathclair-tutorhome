import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import InviteCodeGenerator from "@/components/InviteCodeGenerator";

interface Props {
  lang: string;
  fr: boolean;
}

export default function ParentControl({ fr }: Props) {
  const { profile } = useAuth();
  const [limit, setLimit] = useState("1 hour");
  const [childProgress, setChildProgress] = useState<any[]>([]);
  const [childSessions, setChildSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.child_id) {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("user_progress").select("*").eq("user_id", profile.child_id),
      supabase.from("study_sessions").select("*").eq("user_id", profile.child_id).order("date", { ascending: false }).limit(7),
    ]).then(([progressRes, sessionsRes]) => {
      setChildProgress(progressRes.data || []);
      setChildSessions(sessionsRes.data || []);
      setLoading(false);
    });
  }, [profile?.child_id]);

  const totalMinutes = childSessions.reduce((s, d) => s + (d.minutes_studied || 0), 0);
  const totalExercises = childSessions.reduce((s, d) => s + (d.exercises_attempted || 0), 0);
  const totalCorrect = childSessions.reduce((s, d) => s + (d.exercises_correct || 0), 0);

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-5">
      {/* Child info */}
      <div className="rounded-xl p-4 md:p-5 mb-4 border border-secondary/20"
        style={{ background: "linear-gradient(130deg, hsl(230,30%,15%), hsl(222,47%,11%))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xl">🎓</div>
          <div>
            <h2 className="font-display text-lg">{profile?.child_name || (fr ? "Votre enfant" : "Your child")}</h2>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${totalExercises} exercises · ${totalMinutes} min this week`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📊 {fr ? "Progrès par sujet" : "Progress by Topic"}</p>
          {childProgress.length > 0 ? childProgress.map((p: any) => {
            const pct = p.exercises_done > 0 ? Math.round((p.exercises_correct / p.exercises_done) * 100) : 0;
            return (
              <div key={p.topic} className="flex items-center gap-2 mb-2">
                <span className="text-xs w-20 text-muted2 truncate">{p.topic}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 70 ? "bg-accent" : pct >= 40 ? "bg-primary" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[0.68rem] text-muted-foreground w-7 text-right">{pct}%</span>
              </div>
            );
          }) : (
            <p className="text-xs text-muted-foreground">{fr ? "Aucune donnée encore." : "No data yet."}</p>
          )}
          {childProgress.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2.5">
              {totalCorrect > 0 && totalExercises > 0
                ? `${fr ? "Moyenne globale:" : "Overall average:"} ${Math.round((totalCorrect / totalExercises) * 100)}%`
                : ""}
            </p>
          )}
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

        {/* Recent sessions */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📅 {fr ? "Sessions récentes" : "Recent Sessions"}</p>
          {childSessions.length > 0 ? childSessions.slice(0, 5).map((s: any) => (
            <div key={s.date} className="flex items-center gap-2 p-2.5 bg-muted rounded-lg text-sm mb-1.5">
              <span>📊</span>
              <div className="flex-1">
                <div className="text-xs">{s.date}: {s.exercises_attempted} exercises</div>
                <div className="text-[0.66rem] text-muted-foreground mt-0.5">
                  {s.exercises_correct}/{s.exercises_attempted} correct · {s.minutes_studied} min
                </div>
              </div>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground">{fr ? "Aucune session récente." : "No recent sessions."}</p>
          )}
        </div>

        {/* Invite Code */}
        {!profile?.child_id && <InviteCodeGenerator fr={fr} />}

        {/* WhatsApp */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📱 WhatsApp</p>
          <button onClick={() => {
            const avg = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0;
            const msg = encodeURIComponent(
              `📊 ${fr ? "Rapport MathClair" : "MathClair Report"}\n\n` +
              `${fr ? "Enfant" : "Child"}: ${profile?.child_name}\n` +
              `${fr ? "Exercices cette semaine" : "Exercises this week"}: ${totalExercises}\n` +
              `${fr ? "Moyenne" : "Average"}: ${avg}%\n` +
              `${fr ? "Temps" : "Time"}: ${totalMinutes} min\n\n` +
              `→ mathclair.cm`
            );
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
