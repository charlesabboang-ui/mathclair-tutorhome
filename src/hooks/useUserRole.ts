import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "student" | "parent" | "teacher" | "admin";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!cancelled) {
        setRoles(((data as any[]) || []).map((r) => r.role as AppRole));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isTeacher: roles.includes("teacher"),
    isParent: roles.includes("parent"),
    isStudent: roles.includes("student"),
  };
}
