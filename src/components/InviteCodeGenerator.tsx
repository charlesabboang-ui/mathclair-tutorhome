import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  fr: boolean;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function InviteCodeGenerator({ fr }: Props) {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!user) return;
    setLoading(true);
    setError("");
    const newCode = generateCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    const { error: insertErr } = await supabase.from("invite_codes" as any).insert({
      parent_user_id: user.id,
      code: newCode,
      expires_at: expiresAt,
    } as any);

    setLoading(false);
    if (insertErr) {
      if (insertErr.message.includes("duplicate")) {
        // Retry once with new code
        return generate();
      }
      setError(fr ? "Erreur lors de la génération." : "Failed to generate code.");
      return;
    }
    setCode(newCode);
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="font-display text-sm mb-2">🔗 {fr ? "Lier le compte enfant" : "Link Child Account"}</p>
      <p className="text-xs text-muted-foreground mb-3">
        {fr
          ? "Générez un code et partagez-le avec votre enfant. Il expire après 24h."
          : "Generate a code and share it with your child. It expires after 24 hours."}
      </p>

      {!code ? (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-secondary text-secondary-foreground font-bold text-sm border-none cursor-pointer transition-all disabled:opacity-50"
        >
          {loading
            ? (fr ? "Génération…" : "Generating…")
            : (fr ? "Générer un code d'invitation" : "Generate Invite Code")}
        </button>
      ) : (
        <div className="text-center">
          <div className="bg-muted rounded-xl py-4 px-3 mb-3">
            <p className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground">{code}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="flex-1 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs border-none cursor-pointer"
            >
              {copied ? "✅" : "📋"} {copied ? (fr ? "Copié !" : "Copied!") : (fr ? "Copier" : "Copy")}
            </button>
            <button
              onClick={() => { setCode(null); setCopied(false); }}
              className="flex-1 py-2 rounded-full border border-border bg-transparent text-muted-foreground font-bold text-xs cursor-pointer"
            >
              {fr ? "Nouveau code" : "New Code"}
            </button>
          </div>
          <p className="text-[0.65rem] text-muted-foreground mt-2">
            ⏰ {fr ? "Expire dans 24 heures" : "Expires in 24 hours"}
          </p>
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-2">⚠ {error}</p>}
    </div>
  );
}
