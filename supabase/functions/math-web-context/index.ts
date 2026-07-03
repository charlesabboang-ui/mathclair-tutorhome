import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch related public snippets from Mathos.ai and Qwen.ai via DuckDuckGo HTML.
// Best-effort: silently returns empty snippets on failure so the tutor still works.
async function ddg(query: string, timeoutMs = 3500): Promise<string[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MathClairBot/1.0)" },
    });
    if (!r.ok) return [];
    const html = await r.text();
    const out: string[] = [];
    const re = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && out.length < 3) {
      const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (text) out.push(text);
    }
    return out;
  } catch { return []; } finally { clearTimeout(t); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ snippets: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const q = query.slice(0, 200);
    const [mathos, qwen] = await Promise.all([
      ddg(`site:mathos.ai ${q}`),
      ddg(`site:qwen.ai ${q} math`),
    ]);
    return new Response(JSON.stringify({
      mathos, qwen,
      snippets: [
        ...mathos.map((s) => `[Mathos.ai] ${s}`),
        ...qwen.map((s) => `[Qwen.ai] ${s}`),
      ],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ snippets: [], error: String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
