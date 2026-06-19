import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication: require a valid Supabase user JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.slice(7);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnon);
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, system } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    // Convert OpenAI-style messages to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    // Retry with exponential backoff on 5xx / network errors
    const maxAttempts = 3;
    let response: Response | null = null;
    let lastErr: string = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 2048,
            stream: true,
            system: system || "You are Claude, a helpful AI assistant. Be concise and clear.",
            messages: anthropicMessages,
          }),
        });

        if (response.ok) break;

        // Don't retry on client errors (4xx) except 429
        if (response.status < 500 && response.status !== 429) {
          const t = await response.text();
          console.error("Anthropic client error:", response.status, t);
          return new Response(JSON.stringify({ error: "Claude API error" }), {
            status: response.status === 429 ? 429 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        lastErr = `${response.status} ${await response.text()}`;
        console.warn(`Anthropic attempt ${attempt} failed: ${lastErr}`);
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn(`Anthropic attempt ${attempt} threw: ${lastErr}`);
        response = null;
      }

      if (attempt < maxAttempts) {
        const delay = 500 * Math.pow(2, attempt - 1) + Math.random() * 250;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (!response || !response.ok) {
      console.error("Anthropic failed after retries:", lastErr);
      const status = response?.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({
        error: status === 429 ? "Rate limited. Please wait and try again." : "Claude API unavailable after retries.",
      }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Transform Anthropic SSE stream to OpenAI-compatible SSE for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);

            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "content_block_delta" && event.delta?.text) {
                // Re-emit as OpenAI-compatible SSE
                const chunk = {
                  choices: [{ delta: { content: event.delta.text } }],
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
              }
              if (event.type === "message_stop") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            } catch { /* skip unparseable */ }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("claude-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
