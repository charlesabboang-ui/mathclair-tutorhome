import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  fr: boolean;
  onLinked?: () => void;
}

export default function RedeemInviteCode({ fr, onLinked }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function redeem() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError(fr ? "Veuillez entrer un code valide." : "Please enter a valid code.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: rpcErr } = await supabase.rpc("redeem_invite_code", {
      invite_code: trimmed,
    });

    setLoading(false);

    if (rpcErr) {
      setError(fr ? "Erreur serveur." : "Server error.");
      return;
    }

    const result = data as any;
    if (!result?.success) {
      setError(
        result?.error === "Cannot link to yourself"
          ? (fr ? "Vous ne pouvez pas vous lier à vous-même." : "You cannot link to yourself.")
          : (fr ? "Code invalide ou expiré." : "Invalid or expired code.")
      );
      return;
    }

    setSuccess(true);
    onLinked?.();
  }

  if (success) {
    return (
      <div className="bg-card border border-accent/30 rounded-xl p-4 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-display text-sm text-accent">
          {fr ? "Compte lié avec succès !" : "Account linked successfully!"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {fr ? "Votre parent peut maintenant suivre vos progrès." : "Your parent can now track your progress."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="font-display text-sm mb-2">🔗 {fr ? "Lier au compte parent" : "Link to Parent"}</p>
      <p className="text-xs text-muted-foreground mb-3">
        {fr
          ? "Entrez le code d'invitation de votre parent."
          : "Enter the invite code from your parent."}
      </p>

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABC123"
        maxLength={8}
        className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-foreground text-center font-mono text-2xl tracking-[0.3em] outline-none mb-3 focus:border-secondary/50 transition-colors uppercase"
      />

      <button
        onClick={redeem}
        disabled={loading || code.trim().length < 4}
        className="w-full py-2.5 rounded-full bg-secondary text-secondary-foreground font-bold text-sm border-none cursor-pointer transition-all disabled:opacity-50"
      >
        {loading ? (fr ? "Vérification…" : "Verifying…") : (fr ? "Lier le compte →" : "Link Account →")}
      </button>

      {error && <p className="text-xs text-destructive mt-2">⚠ {error}</p>}
    </div>
  );
}
