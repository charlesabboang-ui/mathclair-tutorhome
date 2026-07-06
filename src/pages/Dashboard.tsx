import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import RedeemInviteCode from "@/components/RedeemInviteCode";
import StudySessionTracker from "@/components/StudySessionTracker";


interface Props {
  lang: string;
  fr: boolean;
  goTo: (p: string) => void;
  setTutorMsg: (m: string) => void;
  setShowModal: (b: boolean) => void;
}

export default function Dashboard({ fr, goTo }: Props) {
  const { profile } = useAuth();
  const { progress, streak, todayMinutes, loading } = useProgress();
  const name = profile?.name?.split(" ")[0] || (fr ? "Élève" : "Student");

  const totalDone = progress.reduce((s, p) => s + p.exercises_done, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.exercises_correct, 0);
  const avgPct = totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : 0;
  const topicsDone = progress.filter((p) => p.exercises_done >= 5).length;

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-5">
      {/* Welcome */}
      <div className="rounded-xl p-4 md:p-5 mb-4 relative overflow-hidden border border-secondary/20"
        style={{ background: "linear-gradient(130deg, hsl(230,30%,15%), hsl(222,47%,11%))" }}>
        <h2 className="font-display text-lg md:text-xl mb-1">
          {fr ? `Bonjour, ${name} 👋` : `Hello, ${name} 👋`}
        </h2>
        <p className="text-muted2 text-sm">
          {streak > 0
            ? fr ? `${streak} jour(s) consécutifs d'étude. Continuez !` : `${streak}-day study streak. Keep it going!`
            : fr ? "Commencez votre série d'étude aujourd'hui !" : "Start your study streak today!"}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">{profile?.school} · {profile?.level}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {[
          { l: fr ? "Sujets faits" : "Topics Done", v: String(topicsDone), c: "text-primary" },
          { l: fr ? "Moyenne" : "Practice Avg", v: `${avgPct}%`, c: "text-emerald" },
          { l: fr ? "Série" : "Day Streak", v: `🔥 ${streak}`, c: "text-secondary" },
          { l: fr ? "Aujourd'hui" : "Time Today", v: `${todayMinutes} min`, c: "text-foreground" },
        ].map(({ l, v, c }) => (
          <div key={l} className="bg-card border border-border rounded-xl p-3">
            <p className="text-[0.66rem] text-muted-foreground uppercase tracking-wider mb-1">{l}</p>
            <p className={`font-display text-xl md:text-2xl ${c}`}>{loading ? "—" : v}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">📊 {fr ? "Progrès" : "Progress"}</p>
          {progress.length > 0 ? progress.slice(0, 5).map(({ topic, percentage }) => (
            <div key={topic} className="flex items-center gap-2 mb-2">
              <span className="text-xs w-20 flex-shrink-0 text-muted2 truncate">{topic}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${percentage}%` }} />
              </div>
              <span className="text-[0.66rem] text-muted-foreground w-8 text-right">{percentage}%</span>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground">{fr ? "Commencez à pratiquer pour voir vos progrès" : "Start practicing to see your progress"}</p>
          )}
        </div>

        {/* Streak */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-display text-sm mb-3">🔥 Streak</p>
          <div className="flex gap-1 flex-wrap mb-3">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-[0.65rem] font-bold ${
                i < streak ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
              }`}>{d}</div>
            ))}
          </div>
          <button onClick={() => goTo("practice")}
            className="px-4 py-1.5 rounded-full border-none bg-primary text-primary-foreground text-xs font-bold cursor-pointer">
            {fr ? "Commencer →" : "Start →"}
          </button>
        </div>
      </div>

      {/* Study session tracker */}
      <div className="mb-3">
        <StudySessionTracker fr={fr} />
      </div>

      {/* Link to parent */}
      {!profile?.is_parent && (
        <div className="mb-3">
          <RedeemInviteCode fr={fr} />
        </div>
      )}

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
