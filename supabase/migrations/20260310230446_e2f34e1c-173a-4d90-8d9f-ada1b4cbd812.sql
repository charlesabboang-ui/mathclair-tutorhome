-- Fix 1: Secure the INSERT policy on profiles to prevent parent self-assignment
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND (is_parent IS NOT TRUE)
  AND (child_id IS NULL)
);

-- Fix 2: Convert all RESTRICTIVE policies to PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_parent IS NOT DISTINCT FROM (SELECT p.is_parent FROM profiles p WHERE p.user_id = auth.uid())
  AND child_id IS NOT DISTINCT FROM (SELECT p.child_id FROM profiles p WHERE p.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- chat_messages (check existing policies first)
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
CREATE POLICY "Users can insert own messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- user_progress
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
ON public.user_progress
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
ON public.user_progress
FOR UPDATE
TO public
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
ON public.user_progress
FOR SELECT
TO public
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Parents can view child progress" ON public.user_progress;
CREATE POLICY "Parents can view child progress"
ON public.user_progress
FOR SELECT
TO public
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
    AND profiles.is_parent = true
    AND profiles.child_id = user_progress.user_id
));

-- study_sessions
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.study_sessions;
CREATE POLICY "Users can insert own sessions"
ON public.study_sessions
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.study_sessions;
CREATE POLICY "Users can update own sessions"
ON public.study_sessions
FOR UPDATE
TO public
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own sessions" ON public.study_sessions;
CREATE POLICY "Users can view own sessions"
ON public.study_sessions
FOR SELECT
TO public
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Parents can view child sessions" ON public.study_sessions;
CREATE POLICY "Parents can view child sessions"
ON public.study_sessions
FOR SELECT
TO public
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
    AND profiles.is_parent = true
    AND profiles.child_id = study_sessions.user_id
));