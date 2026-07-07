import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/hooks/useProgress";
import TutorContent from "@/components/TutorContent";

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
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  topic?: string;
}

const EXAMS = ["", "BEPC", "Probatoire", "Baccalauréat", "GCE O-Level", "GCE A-Level"];

export default function Practice({ fr, goTo, setTutorMsg }: Props) {
  const { recordExercise } = useProgress();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [exam, setExam] = useState<string>("");
  const [ex, setEx] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [err, setErr] = useState<string>("");

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

  const generate = useCallback(async () => {
    setLoading(true); setErr(""); setPicked(null); setEx(null);
    const cls = classes.find((c) => c.id === classId);
    const topic = topics.find((t) => t.id === topicId);
    const lesson = lessons.find((l) => l.id === lessonId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise", {
        body: {
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
    } catch (e) {
      setErr(fr ? "Erreur de génération. Réessayez." : "Generation failed. Try again.");
      console.error(e);
    } finally { setLoading(false); }
  }, [classes, topics, lessons, classId, topicId, lessonId, fr, difficulty, exam]);

  const pick = (i: number) => {
    if (picked !== null || !ex) return;
    setPicked(i);
    recordExercise(ex.topic || (topics.find((t) => t.id === topicId)?.title || "general"), i === ex.answer);
  };

  const selCls = "bg-muted border border-border rounded-lg py-2 px-3 text-foreground text-sm outline-none font-body min-w-0";

  return (
    <div className="absolute inset-0 overflow-y-auto p-3 md:p-5">
      <p className="text-muted-foreground mb-3 text-sm">
        {fr ? "Exercices générés à la demande selon votre classe, thème et leçon. Chaque question est unique."
          : "On-demand AI-generated exercises for your class, topic and lesson. Every question is unique."}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={selCls}>
          <option value="">{fr ? "Classe…" : "Class…"}</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={selCls} disabled={!topics.length}>
          <option value="">{fr ? "Thème (tous)" : "Topic (any)"}</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.topic_number}. {t.title}</option>)}
        </select>
        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={selCls} disabled={!lessons.length}>
          <option value="">{fr ? "Leçon (toutes)" : "Lesson (any)"}</option>
          {lessons.map((l) => <option key={l.id} value={l.id}>{l.lesson_number}. {l.title}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className={selCls}>
          <option value="easy">{fr ? "Facile" : "Easy"}</option>
          <option value="medium">{fr ? "Moyen" : "Medium"}</option>
          <option value="hard">{fr ? "Difficile" : "Hard"}</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={exam} onChange={(e) => setExam(e.target.value)} className={selCls}>
          {EXAMS.map((x) => <option key={x} value={x}>{x || (fr ? "Style: libre" : "Style: any")}</option>)}
        </select>
        <button onClick={generate} disabled={loading || !classId}
          className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-bold cursor-pointer disabled:opacity-50">
          {loading ? (fr ? "Génération…" : "Generating…") : (ex ? (fr ? "🔄 Nouvel exercice" : "🔄 New exercise") : (fr ? "✨ Générer" : "✨ Generate"))}
        </button>
        {err && <span className="text-xs text-destructive">{err}</span>}
      </div>

      {!ex && !loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
          {fr ? "Choisissez une classe puis cliquez sur ✨ Générer pour créer un exercice unique."
            : "Pick a class then tap ✨ Generate to create a unique exercise."}
        </div>
      )}

      {loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
          {fr ? "Claude prépare votre question…" : "Claude is preparing your question…"}
        </div>
      )}

      {ex && (
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 max-w-3xl">
          <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mb-2">
            {classes.find((c) => c.id === classId)?.name}
            {ex.topic ? ` · ${ex.topic}` : ""}
            {exam ? ` · ${exam}` : ""} · {difficulty}
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
