import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";
import TutorContent from "@/components/TutorContent";
import { useSeoContext } from "@/hooks/useSeoContext";

interface Props {
  lang: string;
  fr: boolean;
  goTo: (p: string) => void;
  setTutorMsg: (m: string) => void;
  setShowModal: (b: boolean) => void;
}

interface ClassRow { id: string; name: string; order: number }
interface TopicRow { id: string; title: string; topic_number: number }
interface LessonRow { id: string; title: string; lesson_number: number }
interface Exercise {
  id?: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  topic?: string;
}
interface Attempt { topic: string; correct: boolean; seconds: number }

const EXAMS = ["", "BEPC", "Probatoire", "Baccalauréat", "GCE O-Level", "GCE A-Level"];

export default function Practice({ fr, goTo, setTutorMsg }: Props) {
  const { recordExercise } = useProgress();
  const { user } = useAuth();
  const { setSeo } = useSeoContext();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [exam, setExam] = useState<string>("");
  const [ex, setEx] = useState<Exercise | null>(null);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [err, setErr] = useState<string>("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [bankCount, setBankCount] = useState<number | null>(null);
  const startedAt = useRef<number>(Date.now());

  // Load classes on mount
  useEffect(() => {
    supabase.from("curriculum_classes").select("id, name, order").order("order")
      .then(({ data }) => {
        if (data) {
          setClasses(data as ClassRow[]);
          if (data.length && !classId) setClassId((data as ClassRow[])[4]?.id || (data as ClassRow[])[0].id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load topics when class changes
  useEffect(() => {
    if (!classId) return;
    setTopicId(""); setLessonId(""); setLessons([]);
    supabase.from("curriculum_topics").select("id, title, topic_number").eq("class_id", classId).order("topic_number")
      .then(({ data }) => setTopics((data as TopicRow[]) || []));
  }, [classId]);

  // Load lessons when topic changes
  useEffect(() => {
    if (!topicId) { setLessons([]); return; }
    setLessonId("");
    supabase.from("curriculum_lessons").select("id, title, lesson_number").eq("topic_id", topicId).order("lesson_number")
      .then(({ data }) => setLessons((data as LessonRow[]) || []));
  }, [topicId]);

  // How many stored curriculum questions match the current selection
  useEffect(() => {
    if (!classId) { setBankCount(null); return; }
    let q = supabase.from("curriculum_exercises")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("lang", fr ? "fr" : "en")
      .eq("difficulty", difficulty);
    if (lessonId) q = q.eq("lesson_id", lessonId);
    else if (topicId) q = q.eq("topic_id", topicId);
    if (exam) q = q.eq("exam", exam);
    q.then(({ count }) => setBankCount(count ?? 0));
  }, [classId, topicId, lessonId, difficulty, exam, fr, ex]);

  // Keep page metadata in sync with the selected class / topic / exam style
  useEffect(() => {
    setSeo({
      subject: topics.find((t) => t.id === topicId)?.title || lessons.find((l) => l.id === lessonId)?.title,
      level: classes.find((c) => c.id === classId)?.name,
      exam: exam || undefined,
    });
  }, [classId, topicId, lessonId, exam, classes, topics, lessons, setSeo]);

  const generate = useCallback(async () => {
    setLoading(true); setErr(""); setPicked(null); setEx(null); setSource("");
    const cls = classes.find((c) => c.id === classId);
    const topic = topics.find((t) => t.id === topicId);
    const lesson = lessons.find((l) => l.id === lessonId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise", {
        body: {
          classId,
          topicId: topicId || undefined,
          lessonId: lessonId || undefined,
          excludeIds: seenIds,
          className: cls?.name,
          topicTitle: topic?.title,
          lessonTitle: lesson?.title,
          level: cls?.name,
          lang: fr ? "fr" : "en",
          difficulty,
          exam: exam || undefined,
          seed: Date.now(),
        },
      });
      if (error) throw error;
      if (!data?.exercise) throw new Error("empty");
      setEx(data.exercise as Exercise);
      setSource(data.source || "");
      startedAt.current = Date.now();
      if ((data.exercise as Exercise).id) {
        setSeenIds((s) => [...s, (data.exercise as Exercise).id!].slice(-200));
      }
    } catch (e) {
      setErr(fr ? "Erreur de génération. Réessayez." : "Generation failed. Try again.");
      console.error(e);
    } finally { setLoading(false); }
  }, [classes, topics, lessons, classId, topicId, lessonId, fr, difficulty, exam, seenIds]);

  const pick = async (i: number) => {
    if (picked !== null || !ex) return;
    setPicked(i);
    const isCorrect = i === ex.answer;
    const topicLabel = ex.topic || topics.find((t) => t.id === topicId)?.title || "general";
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    setAttempts((a) => [...a, { topic: topicLabel, correct: isCorrect, seconds }]);
    recordExercise(topicLabel, isCorrect);
    if (user) {
      await supabase.from("exercise_attempts").insert({
        user_id: user.id,
        exercise_id: ex.id ?? null,
        class_id: classId || null,
        topic_title: topicLabel,
        difficulty,
        chosen: i,
        correct: isCorrect,
        seconds,
      });
    }
  };

  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const avgTime = total ? Math.round(attempts.reduce((s, a) => s + a.seconds, 0) / total) : 0;
  let bestStreak = 0, run = 0;
  attempts.forEach((a) => { run = a.correct ? run + 1 : 0; if (run > bestStreak) bestStreak = run; });
  const byTopic = Object.values(
    attempts.reduce<Record<string, { topic: string; done: number; ok: number }>>((acc, a) => {
      acc[a.topic] = acc[a.topic] || { topic: a.topic, done: 0, ok: 0 };
      acc[a.topic].done++; if (a.correct) acc[a.topic].ok++;
      return acc;
    }, {}),
  ).sort((a, b) => b.done - a.done);

  const grade = accuracy >= 80 ? (fr ? "Excellent" : "Excellent")
    : accuracy >= 60 ? (fr ? "Bien" : "Good")
    : accuracy >= 40 ? (fr ? "À revoir" : "Keep going")
    : (fr ? "Révision nécessaire" : "Needs review");

  const selCls = "bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body min-w-0";

  return (
    <div className="absolute inset-0 overflow-y-auto p-3 md:p-5">
      <h1 className="font-display text-lg md:text-xl mb-2">{fr ? "Exercices" : "Practice"}</h1>
      <p className="text-muted-foreground mb-3 text-sm">
        {fr ? "Questions réelles rattachées aux thèmes et leçons du programme, corrigées automatiquement."
          : "Real questions tied to your curriculum topics and lessons, graded automatically."}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={selCls} aria-label={fr ? "Classe" : "Class"}>
          <option value="">{fr ? "Classe…" : "Class…"}</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={selCls} disabled={!topics.length} aria-label={fr ? "Thème" : "Topic"}>
          <option value="">{fr ? "Thème (tous)" : "Topic (any)"}</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.topic_number}. {t.title}</option>)}
        </select>
        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={selCls} disabled={!lessons.length} aria-label={fr ? "Leçon" : "Lesson"}>
          <option value="">{fr ? "Leçon (toutes)" : "Lesson (any)"}</option>
          {lessons.map((l) => <option key={l.id} value={l.id}>{l.lesson_number}. {l.title}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className={selCls} aria-label={fr ? "Difficulté" : "Difficulty"}>
          <option value="easy">{fr ? "Facile" : "Easy"}</option>
          <option value="medium">{fr ? "Moyen" : "Medium"}</option>
          <option value="hard">{fr ? "Difficile" : "Hard"}</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={exam} onChange={(e) => setExam(e.target.value)} className={selCls} aria-label={fr ? "Style d'examen" : "Exam style"}>
          {EXAMS.map((x) => <option key={x} value={x}>{x || (fr ? "Style: libre" : "Style: any")}</option>)}
        </select>
        <button onClick={generate} disabled={loading || !classId}
          className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-bold cursor-pointer disabled:opacity-50">
          {loading ? (fr ? "Chargement…" : "Loading…") : (ex ? (fr ? "🔄 Question suivante" : "🔄 Next question") : (fr ? "✨ Commencer" : "✨ Start"))}
        </button>
        {bankCount !== null && bankCount > 0 && (
          <span className="text-[0.68rem] text-muted-foreground">
            {bankCount} {fr ? "questions en banque" : "questions in bank"}
          </span>
        )}
        {err && <span className="text-xs text-destructive">{err}</span>}
      </div>

      {/* Score card */}
      {total > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 max-w-3xl">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-sm">{fr ? "Fiche de score" : "Score card"}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[0.68rem] px-2 py-1 rounded-full bg-secondary/15 text-secondary font-bold">{grade}</span>
              <button onClick={() => { setAttempts([]); }}
                className="text-[0.68rem] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors">
                {fr ? "Nouvelle session" : "New session"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {[
              { label: fr ? "Score" : "Score", value: `${correct}/${total}` },
              { label: fr ? "Réussite" : "Accuracy", value: `${accuracy}%` },
              { label: fr ? "Meilleure série" : "Best streak", value: `${bestStreak}` },
              { label: fr ? "Temps moyen" : "Avg time", value: `${avgTime}s` },
            ].map((s) => (
              <div key={s.label} className="bg-muted rounded-lg p-2.5">
                <div className="text-[0.62rem] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="font-display text-lg">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
            <div className="h-full bg-accent transition-all" style={{ width: `${accuracy}%` }} />
          </div>
          <div className="flex flex-col gap-1.5">
            {byTopic.map((t) => {
              const pct = Math.round((t.ok / t.done) * 100);
              return (
                <div key={t.topic} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-muted-foreground">{t.topic}</span>
                  <span className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <span className="block h-full bg-secondary" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-16 text-right font-bold">{t.ok}/{t.done} · {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!ex && !loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
          {fr ? "Choisissez une classe, un thème puis cliquez sur ✨ Commencer."
            : "Pick a class and topic then tap ✨ Start."}
        </div>
      )}

      {loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
          {fr ? "Préparation de votre question…" : "Preparing your question…"}
        </div>
      )}

      {ex && (
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 max-w-3xl">
          <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mb-2">
            {classes.find((c) => c.id === classId)?.name}
            {ex.topic ? ` · ${ex.topic}` : ""}
            {exam ? ` · ${exam}` : ""} · {difficulty}
            {source === "curriculum" ? ` · ${fr ? "programme" : "curriculum"}` : ""}
          </div>
          <div className="text-base leading-relaxed mb-5 font-medium">
            <TutorContent text={ex.question} />
          </div>

          <div className="flex flex-col gap-2 mb-3.5">
            {ex.options.map((opt, i) => {
              const show = picked !== null;
              const isCorrect = i === ex.answer;
              const isMe = picked === i;
              let cls = "border-border bg-muted text-foreground";
              if (show && isCorrect) cls = "border-accent bg-accent/10 text-accent";
              else if (show && isMe) cls = "border-destructive bg-destructive/10 text-destructive";
              return (
                <div key={i} onClick={() => pick(i)}
                  className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm border cursor-pointer transition-all ${cls}`}>
                  <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="min-w-0 flex-1"><TutorContent text={opt} className="text-sm" /></div>
                </div>
              );
            })}
          </div>

          {picked !== null && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-sm leading-relaxed mb-3.5">
              <strong>{picked === ex.answer ? "✅ Correct!" : `❌ ${fr ? "Incorrect — réponse:" : "Incorrect — answer:"} ${String.fromCharCode(65 + ex.answer)}`}</strong>
              <TutorContent text={ex.explanation} className="mt-2" />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setTutorMsg(`Explain step by step using the Socratic method: ${ex.question}`); goTo("tutor"); }}
              className="px-4 py-1.5 rounded-full border border-border bg-transparent text-muted-foreground text-xs font-bold cursor-pointer hover:bg-muted transition-colors">
              🗣️ {fr ? "Demander à Clair" : "Ask Clair"}
            </button>
            <button onClick={generate} disabled={loading}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold border-none cursor-pointer disabled:opacity-50">
              {fr ? "Suivant →" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
