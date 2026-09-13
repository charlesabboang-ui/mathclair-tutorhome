CREATE TABLE public.curriculum_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id text NOT NULL REFERENCES public.curriculum_classes(id) ON DELETE CASCADE,
  topic_id text REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  lesson_id text REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  topic_title text NOT NULL DEFAULT '',
  question text NOT NULL,
  options jsonb NOT NULL,
  answer integer NOT NULL,
  explanation text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium',
  lang text NOT NULL DEFAULT 'en',
  exam text,
  source text NOT NULL DEFAULT 'ai',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.curriculum_exercises TO anon;
GRANT SELECT ON public.curriculum_exercises TO authenticated;
GRANT ALL ON public.curriculum_exercises TO service_role;

ALTER TABLE public.curriculum_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises"
ON public.curriculum_exercises FOR SELECT USING (true);

CREATE INDEX idx_curriculum_exercises_lookup
ON public.curriculum_exercises (class_id, topic_id, difficulty, lang);

CREATE TABLE public.exercise_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.curriculum_exercises(id) ON DELETE SET NULL,
  class_id text,
  topic_title text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium',
  chosen integer,
  correct boolean NOT NULL DEFAULT false,
  seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.exercise_attempts TO authenticated;
GRANT ALL ON public.exercise_attempts TO service_role;

ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
ON public.exercise_attempts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
ON public.exercise_attempts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can view child attempts"
ON public.exercise_attempts FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid() AND p.is_parent = true AND p.child_id = exercise_attempts.user_id
));

CREATE INDEX idx_exercise_attempts_user ON public.exercise_attempts (user_id, created_at DESC);