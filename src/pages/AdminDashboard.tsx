import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, AppRole } from "@/hooks/useUserRole";

interface Row {
  user_id: string;
  name: string;
  level: string;
  school: string;
  is_parent: boolean;
  child_name: string;
  lang: string;
  created_at?: string;
  roles: AppRole[];
}

const ROLE_OPTIONS: AppRole[] = ["student", "parent", "teacher", "admin"];

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRoles();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<AppRole | "all">("all");
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    parents: 0,
    teachers: 0,
    admins: 0,
    lessons: 0,
    sessions: 0,
  });
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: profiles }, { data: allRoles }, { count: lessonsCount }, { count: sessionsCount }] =
      await Promise.all([
        supabase.from("profiles").select("user_id,name,level,school,is_parent,child_name,lang,created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id,role"),
        supabase.from("curriculum_lessons").select("*", { count: "exact", head: true }),
        supabase.from("study_sessions").select("*", { count: "exact", head: true }),
      ]);

    const roleMap = new Map<string, AppRole[]>();
    ((allRoles as any[]) || []).forEach((r) => {
      const arr = roleMap.get(r.user_id) || [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });

    const merged: Row[] = ((profiles as any[]) || []).map((p) => ({
      ...p,
      roles: roleMap.get(p.user_id) || [],
    }));

    setRows(merged);
    setStats({
      users: merged.length,
      students: merged.filter((r) => r.roles.includes("student")).length,
      parents: merged.filter((r) => r.roles.includes("parent")).length,
      teachers: merged.filter((r) => r.roles.includes("teacher")).length,
      admins: merged.filter((r) => r.roles.includes("admin")).length,
      lessons: lessonsCount || 0,
      sessions: sessionsCount || 0,
    });
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && !r.roles.includes(filter)) return false;
      if (!needle) return true;
      return (
        r.name?.toLowerCase().includes(needle) ||
        r.school?.toLowerCase().includes(needle) ||
        r.level?.toLowerCase().includes(needle) ||
        r.user_id.includes(needle)
      );
    });
  }, [rows, q, filter]);

  async function toggleRole(userId: string, role: AppRole, has: boolean) {
    setBusy(userId + role);
    if (has) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role });
    }
    setBusy(null);
    await load();
  }

  async function deleteProfile(userId: string) {
    if (!confirm("Delete this user's profile and roles? Auth account remains.")) return;
    setBusy(userId + "del");
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("user_id", userId);
    setBusy(null);
    await load();
  }

  if (authLoading || roleLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl mb-2">Admin only</p>
          <p className="text-sm text-muted-foreground mb-4">You need the admin role to access this page.</p>
          <Link to="/" className="text-primary underline text-sm">← Back to app</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-lg">
              Math<span className="text-primary">Clair</span>
            </Link>
            <span className="text-[0.68rem] uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← App</Link>
            <button onClick={signOut} className="text-xs px-3 py-1 rounded-full border border-border hover:bg-muted">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <section>
          <h1 className="font-display text-xl mb-3">Overview</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Stat label="Users" value={stats.users} />
            <Stat label="Students" value={stats.students} />
            <Stat label="Parents" value={stats.parents} />
            <Stat label="Teachers" value={stats.teachers} />
            <Stat label="Admins" value={stats.admins} accent />
            <Stat label="Lessons" value={stats.lessons} />
            <Stat label="Sessions" value={stats.sessions} />
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-3">
            <h2 className="font-display text-lg">Users</h2>
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, school, id…"
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-secondary/50 w-64"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                <option value="all">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={load}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Name</th>
                    <th className="text-left px-3 py-2 font-semibold">Level / Child</th>
                    <th className="text-left px-3 py-2 font-semibold">School</th>
                    <th className="text-left px-3 py-2 font-semibold">Roles</th>
                    <th className="text-right px-3 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No users match.</td></tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={r.user_id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{r.name || "—"}</div>
                        <div className="text-[0.65rem] text-muted-foreground font-mono truncate max-w-[180px]">{r.user_id}</div>
                      </td>
                      <td className="px-3 py-2">{r.is_parent ? (r.child_name || "—") : (r.level || "—")}</td>
                      <td className="px-3 py-2">{r.school || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {ROLE_OPTIONS.map((role) => {
                            const has = r.roles.includes(role);
                            const isBusy = busy === r.user_id + role;
                            return (
                              <button
                                key={role}
                                disabled={isBusy}
                                onClick={() => toggleRole(r.user_id, role, has)}
                                className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border transition-colors ${
                                  has
                                    ? role === "admin"
                                      ? "bg-primary/20 border-primary/50 text-primary"
                                      : "bg-secondary/20 border-secondary/50 text-secondary"
                                    : "bg-transparent border-border text-muted-foreground hover:bg-muted"
                                }`}
                                title={has ? `Remove ${role}` : `Add ${role}`}
                              >
                                {isBusy ? "…" : role}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => deleteProfile(r.user_id)}
                          disabled={busy === r.user_id + "del"}
                          className="text-[0.65rem] px-2 py-1 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                          {busy === r.user_id + "del" ? "…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[0.68rem] text-muted-foreground mt-2">
            Click a role chip to toggle it. Deletion removes the profile and roles; the auth account remains.
          </p>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
      <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}
