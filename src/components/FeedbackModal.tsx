import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const STARS = [1, 2, 3, 4, 5];

interface Props {
  fr: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ fr, onClose }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      message: message.trim(),
      rating: rating || null,
    });
    setSending(false);
    if (error) {
      toast({ title: fr ? "Erreur" : "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: fr ? "Merci !" : "Thank you!", description: fr ? "Votre avis a été envoyé." : "Your feedback has been sent." });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-[90vw] max-w-md p-6 shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">{fr ? "Votre Avis" : "Your Feedback"}</h3>
          <button onClick={onClose} className="bg-transparent border-none text-muted-foreground text-lg cursor-pointer hover:text-foreground">✕</button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {fr ? "Aidez-nous à améliorer MathClair !" : "Help us improve MathClair!"}
        </p>

        {/* Star rating */}
        <div className="flex items-center gap-1 mb-4">
          <span className="text-sm text-muted-foreground mr-2">{fr ? "Note :" : "Rating:"}</span>
          {STARS.map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className={`bg-transparent border-none text-2xl cursor-pointer transition-transform hover:scale-110 ${
                s <= rating ? "opacity-100" : "opacity-30"
              }`}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={fr ? "Décrivez votre expérience, suggestions..." : "Describe your experience, suggestions..."}
          className="w-full h-28 rounded-xl border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground"
        />

        <button
          onClick={submit}
          disabled={!message.trim() || sending}
          className="mt-4 w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm cursor-pointer border-none disabled:opacity-50 hover:bg-secondary/90 transition-colors"
        >
          {sending ? "..." : fr ? "Envoyer" : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}
