import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sbForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "log_study_session",
  title: "Log a study session",
  description: "Record a MathClair study session (minutes studied and exercise counts) for the signed-in user.",
  inputSchema: {
    minutes_studied: z.number().int().min(0).max(600).describe("Minutes studied in this session."),
    exercises_attempted: z.number().int().min(0).max(1000).default(0).describe("Number of exercises attempted."),
    exercises_correct: z.number().int().min(0).max(1000).default(0).describe("Number of exercises answered correctly."),
    date: z.string().optional().describe("ISO date (YYYY-MM-DD). Defaults to today."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const row = {
      user_id: ctx.getUserId(),
      minutes_studied: input.minutes_studied,
      exercises_attempted: input.exercises_attempted,
      exercises_correct: input.exercises_correct,
      ...(input.date ? { date: input.date } : {}),
    };
    const { data, error } = await sbForUser(ctx)
      .from("study_sessions")
      .insert(row)
      .select()
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Logged study session on ${data.date}.` }],
      structuredContent: { session: data },
    };
  },
});
