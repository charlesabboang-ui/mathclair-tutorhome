import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sbForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_progress",
  title: "Get study progress",
  description: "Return per-topic practice progress and recent study sessions for the signed-in user.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = sbForUser(ctx);
    const uid = ctx.getUserId();

    const [progress, sessions] = await Promise.all([
      sb.from("user_progress")
        .select("topic, exercises_done, exercises_correct, last_practiced")
        .eq("user_id", uid)
        .order("last_practiced", { ascending: false }),
      sb.from("study_sessions")
        .select("date, minutes_studied, exercises_attempted, exercises_correct")
        .eq("user_id", uid)
        .order("date", { ascending: false })
        .limit(14),
    ]);

    if (progress.error) return { content: [{ type: "text", text: progress.error.message }], isError: true };
    if (sessions.error) return { content: [{ type: "text", text: sessions.error.message }], isError: true };

    const payload = { topics: progress.data ?? [], recent_sessions: sessions.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
