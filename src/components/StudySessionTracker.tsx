import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";

interface Props { fr: boolean }

export default function StudySessionTracker({ fr }: Props) {
  const { user } = useAuth();
  const { sessions, todayMinutes, fetchSessions } = useProgress();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  function start() {
    if (running) return;
    startRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    setSaved(null);
    tickRef.current = window.setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
  }

  async function stop() {
    if (!running || !user) return;
    if (tickRef.current) window.clearInterval(tickRef.current);
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const existing = sessions.find((s) => s.date === today);
    if (existing) {
      await supabase.from("study_sessions").update({
        minutes_studied: existing.minutes_studied + minutes,
      }).eq("user_id", user.id).eq("date", today);
    } else {
      await supabase.from("study_sessions").insert({
        user_id: user.id, date: today, minutes_studied: minutes,
        exercises_attempted: 0, exercises_correct: 0,
      });
    }
    await fetchSessions();
    setSaving(false);
    setSaved(fr ? `+${minutes} min enregistrées` : `+${minutes} min logged`);
    setElapsed(0);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const last7 = sessions.slice(0, 7).reverse();
  const max = Math.max(1, ...last7.map((s) => s.minutes_studied));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-sm">⏱ {fr ? "Session d'étude" : "Study Session"}</p>
        <span className="text-[0.66rem] text-muted-foreground">
          {fr ? "Aujourd'hui" : "Today"}: <b>{todayMinutes} min</b>
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className={`font-display text-3xl tabular-nums ${running ? "text-secondary" : "text-foreground"}`}>
          {mm}:{ss}
        </div>
        {!running ? (
          <button onClick={start} disabled={saving}
            className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-bold cursor-pointer disabled:opacity-50">
            ▶ {fr ? "Démarrer" : "Start"}
          </button>
        ) : (
          <button onClick={stop}
            className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-bold cursor-pointer">
            ⏹ {fr ? "Arrêter & enregistrer" : "Stop & log"}
          </button>
        )}
        {saved && <span className="text-[0.7rem] text-emerald">{saved}</span>}
      </div>

      <div className="flex items-end gap-1 h-16">
        {Array.from({ length: 7 }).map((_, i) => {
          const s = last7[i];
          const m = s?.minutes_studied || 0;
          const h = Math.round((m / max) * 100);
          const d = s ? new Date(s.date).toLocaleDateString(fr ? "fr-FR" : "en-US", { weekday: "short" })[0] : "·";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-muted rounded-t-md flex items-end" style={{ height: "48px" }}>
                <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-secondary" style={{ height: `${h}%` }} title={`${m} min`} />
              </div>
              <span className="text-[0.6rem] text-muted-foreground">{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
