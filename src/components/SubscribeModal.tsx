import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  lang: string;
  fr: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ fr, onClose }: Props) {
  const { profile } = useAuth();
  const [cycle, setCycle] = useState("monthly");
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 bg-background/80 z-[200] flex items-center justify-center p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[450px] rounded-2xl overflow-hidden animate-fade-in border border-primary/30"
        style={{ background: "linear-gradient(140deg, hsl(28,30%,5%), hsl(222,47%,11%))", boxShadow: "0 40px 80px rgba(0,0,0,.65)" }}>
        <div className="h-1 bg-gradient-to-r from-primary via-gold-light to-primary" />
        <div className="p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <p className="font-display text-base text-primary">{fr ? "Plan Olympiade" : "Olympiade Plan"}</p>
            </div>
            <button onClick={onClose} className="bg-transparent border-none text-muted-foreground text-xl cursor-pointer">✕</button>
          </div>

          {done ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3.5">🎉</div>
              <h3 className="font-display text-xl text-primary mb-2.5">{fr ? "Bienvenue dans l'élite !" : "Welcome to the elite!"}</h3>
              <p className="text-muted2 text-sm leading-relaxed mb-6">
                {fr ? `Merci ${name} ! Notre équipe vous contacte au ${phone} dans les 24h.`
                  : `Thank you, ${name}! Our team will contact you at ${phone} within 24h.`}
              </p>
              <button onClick={onClose}
                className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-bold text-sm border-none cursor-pointer">
                ✅ {fr ? "Parfait !" : "Got it!"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { k: "monthly", l: fr ? "Mensuel" : "Monthly", p: "5 000 FCFA/mois" },
                  { k: "annual", l: fr ? "Annuel" : "Annual", p: "45 000 FCFA/an", note: fr ? "💰 −15 000" : "💰 Save 15k" },
                ].map(({ k, l, p, note }) => (
                  <div key={k} onClick={() => setCycle(k)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      cycle === k ? "border-primary bg-primary/10" : "border-border bg-muted"
                    }`}>
                    <p className={`text-sm font-bold mb-0.5 ${cycle === k ? "text-primary" : "text-foreground"}`}>{l}</p>
                    <p className="text-xs text-muted-foreground">{p}</p>
                    {note && <p className="text-[0.66rem] text-primary font-bold mt-1">{note}</p>}
                  </div>
                ))}
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={fr ? "Nom complet" : "Full name"}
                className="w-full bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm outline-none mb-2.5 focus:border-primary/50 transition-colors" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm outline-none mb-5 focus:border-primary/50 transition-colors" />
              <button onClick={() => { if (name && phone) setDone(true); }}
                className={`w-full py-3 rounded-full border-none font-bold text-sm cursor-pointer transition-all ${
                  name && phone ? "bg-gradient-to-r from-primary to-gold-light text-primary-foreground" : "bg-muted text-muted-foreground cursor-default"
                }`}>
                🚀 {fr ? "Confirmer l'inscription" : "Confirm Subscription"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
