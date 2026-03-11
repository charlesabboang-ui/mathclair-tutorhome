
-- Create invite_codes table for parent-child linking
CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Parents can view their own codes
CREATE POLICY "Parents can view own codes"
ON public.invite_codes FOR SELECT
TO authenticated
USING (auth.uid() = parent_user_id);

-- Parents can insert own codes
CREATE POLICY "Parents can insert own codes"
ON public.invite_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = parent_user_id);

-- Children can view code by code value (for redemption)
CREATE POLICY "Anyone authenticated can look up a code"
ON public.invite_codes FOR SELECT
TO authenticated
USING (true);

-- Secure function to redeem invite code
CREATE OR REPLACE FUNCTION public.redeem_invite_code(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite invite_codes%ROWTYPE;
  v_child_id uuid;
BEGIN
  v_child_id := auth.uid();
  
  -- Find valid, unused, non-expired code
  SELECT * INTO v_invite
  FROM invite_codes
  WHERE code = invite_code
    AND used_by IS NULL
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;
  
  -- Prevent self-linking
  IF v_invite.parent_user_id = v_child_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot link to yourself');
  END IF;
  
  -- Mark code as used
  UPDATE invite_codes
  SET used_by = v_child_id, used_at = now()
  WHERE id = v_invite.id;
  
  -- Link parent to child
  UPDATE profiles
  SET is_parent = true, child_id = v_child_id
  WHERE user_id = v_invite.parent_user_id;
  
  -- Get parent name for response
  RETURN json_build_object('success', true);
END;
$$;
