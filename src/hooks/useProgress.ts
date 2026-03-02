import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TopicProgress {
  topic: string;
  exercises_done: number;
  exercises_correct: number;
  percentage: number;
}

export interface StudySession {
  date: string;
  minutes_studied: number;
  exercises_attempted: number;
  exercises_correct: number;
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id);
    if (data) {
      setProgress(data.map((d: any) => ({
        topic: d.topic,
        exercises_done: d.exercises_done,
        exercises_correct: d.exercises_correct,
        percentage: d.exercises_done > 0 ? Math.round((d.exercises_correct / d.exercises_done) * 100) : 0,
      })));
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);
    if (data) {
      setSessions(data as StudySession[]);
      // Calculate streak
      let s = 0;
      const today = new Date();
      for (let i = 0; i < data.length; i++) {
        const d = new Date(data[i].date);
        const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === i) s++;
        else break;
      }
      setStreak(s);
      // Today's minutes
      const todayStr = today.toISOString().split("T")[0];
      const todaySession = data.find((d: any) => d.date === todayStr);
      setTodayMinutes(todaySession?.minutes_studied || 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
    fetchSessions();
  }, [fetchProgress, fetchSessions]);

  const recordExercise = async (topic: string, correct: boolean) => {
    if (!user) return;
    // Upsert progress
    const existing = progress.find((p) => p.topic === topic);
    if (existing) {
      await supabase.from("user_progress").update({
        exercises_done: existing.exercises_done + 1,
        exercises_correct: existing.exercises_correct + (correct ? 1 : 0),
        last_practiced: new Date().toISOString(),
      }).eq("user_id", user.id).eq("topic", topic);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        topic,
        exercises_done: 1,
        exercises_correct: correct ? 1 : 0,
      });
    }

    // Upsert today's session
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySession = sessions.find((s) => s.date === todayStr);
    if (todaySession) {
      await supabase.from("study_sessions").update({
        exercises_attempted: todaySession.exercises_attempted + 1,
        exercises_correct: todaySession.exercises_correct + (correct ? 1 : 0),
      }).eq("user_id", user.id).eq("date", todayStr);
    } else {
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        date: todayStr,
        minutes_studied: 0,
        exercises_attempted: 1,
        exercises_correct: correct ? 1 : 0,
      });
    }

    fetchProgress();
    fetchSessions();
  };

  return { progress, sessions, streak, todayMinutes, loading, recordExercise, fetchProgress, fetchSessions };
}
