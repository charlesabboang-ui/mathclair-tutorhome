import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.slice(7);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await sb.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { className, topicTitle, lessonTitle, level, lang, difficulty, exam, seed } = await req.json();

    const KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!KEY) throw new Error("ANTHROPIC_API_KEY missing");

    // Try to fetch a public reference snippet for variety (best effort)
    let context = "";
    try {
      const q = `${lessonTitle || topicTitle || ""} exercise ${exam || ""}`.trim();
      const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent("site:mathos.ai " + q)}`,
        { headers: { "User-Agent": "Mozilla/5.0 (MathClairBot)" } });
      if (r.ok) {
        const html = await r.text();
        const snippets: string[] = [];
        const re = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let m; while ((m = re.exec(html)) && snippets.length < 2) {
          const t = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          if (t) snippets.push(t);
        }
        if (snippets.length) context = "\nPUBLIC REFERENCE (for inspiration only):\n" + snippets.map(s => "- " + s).join("\n");
      }
    } catch { /* silent */ }

    const isFr = lang === "fr";
    const nonce = seed ?? crypto.randomUUID();
    const sys = `You are an expert Cameroon math exam writer (MINESEC + GCE). Generate ONE unique multiple-choice question.

Return ONLY a valid JSON object, no prose, no markdown fences.

Schema:
{
  "question": "string with LaTeX in $...$ or $$...$$",
  "options": ["A", "B", "C", "D"],
  "answer": 0,          // index of correct option
  "explanation": "step-by-step solution in ${isFr ? "French" : "English"}, use LaTeX; may embed [[geogebra: <formula>]] to suggest a plot if useful",
  "topic": "${topicTitle || ""}"
}

Rules:
- LANGUAGE: ${isFr ? "French" : "English"}.
- Difficulty: ${difficulty || "medium"}.
- Class/level: ${className || level || "Form 5"}.
- Topic: ${topicTitle || "general math"}.
${lessonTitle ? "- Lesson focus: " + lessonTitle : ""}
${exam ? "- Style it like a real " + exam + " Cameroon exam question." : ""}
- Vary numbers/context each time (seed: ${nonce}) so questions are never identical.
- Options must be plausible distractors; exactly one correct.
- Use FCFA for money.
- No markdown asterisks/headings in explanation; use plain text + LaTeX.
${context}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1200,
        system: sys,
        messages: [{ role: "user", content: `Generate the JSON now. Seed: ${nonce}` }],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw: string = data?.content?.[0]?.text || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI reply");
    const exercise = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ exercise }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-exercise:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
