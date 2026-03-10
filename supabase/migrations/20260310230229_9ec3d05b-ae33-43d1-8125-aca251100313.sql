-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with WITH CHECK that prevents self-assigning is_parent and child_id
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    is_parent IS NOT DISTINCT FROM (SELECT p.is_parent FROM profiles p WHERE p.user_id = auth.uid())
  )
  AND (
    child_id IS NOT DISTINCT FROM (SELECT p.child_id FROM profiles p WHERE p.user_id = auth.uid())
  )
);

-- Create a secure function for server-side parent-child linking
CREATE OR REPLACE FUNCTION public.link_parent_child(
  parent_user_id uuid,
  child_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET is_parent = true, child_id = child_user_id
  WHERE user_id = parent_user_id;
END;
$$;