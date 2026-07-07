
CREATE TABLE public.curriculum_classes (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  subject text NOT NULL DEFAULT 'Mathematics',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curriculum_classes TO anon, authenticated;
GRANT ALL ON public.curriculum_classes TO service_role;
ALTER TABLE public.curriculum_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read classes" ON public.curriculum_classes FOR SELECT USING (true);

CREATE TABLE public.curriculum_topics (
  id text PRIMARY KEY,
  topic_number integer NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  class_id text NOT NULL REFERENCES public.curriculum_classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curriculum_topics TO anon, authenticated;
GRANT ALL ON public.curriculum_topics TO service_role;
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read topics" ON public.curriculum_topics FOR SELECT USING (true);
CREATE INDEX idx_topics_class ON public.curriculum_topics(class_id);

CREATE TABLE public.curriculum_lessons (
  id text PRIMARY KEY,
  lesson_number integer NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  topic_id text NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  class_id text NOT NULL REFERENCES public.curriculum_classes(id) ON DELETE CASCADE,
  estimated_duration integer,
  status text DEFAULT 'draft',
  difficulty text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curriculum_lessons TO anon, authenticated;
GRANT ALL ON public.curriculum_lessons TO service_role;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read lessons" ON public.curriculum_lessons FOR SELECT USING (true);
CREATE INDEX idx_lessons_topic ON public.curriculum_lessons(topic_id);
CREATE INDEX idx_lessons_class ON public.curriculum_lessons(class_id);
