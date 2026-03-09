import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Props {
  lang: "en" | "fr";
  fr: boolean;
}

const LEVELS = [
  "6ème", "5ème", "4ème", "3ème",
  "Seconde", "Première", "Terminale",
  "Form 1", "Form 2", "Form 3", "Form 4", "Form 5",
  "Lower Sixth", "Upper Sixth"
];

export default function Profile({ lang, fr }: Props) {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name || "");
  const [school, setSchool] = useState(profile?.school || "");
  const [level, setLevel] = useState(profile?.level || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSchool(profile.school || "");
      setLevel(profile.level || "");
    }
  }, [profile]);

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), school: school.trim(), level, lang })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: fr ? "Erreur" : "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: fr ? "Profil mis à jour !" : "Profile updated!",
        description: fr ? "Vos informations ont été enregistrées." : "Your information has been saved."
      });
      refreshProfile?.();
    }
    setSaving(false);
  }

  const initials = name?.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase() || "MC";

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-xl mb-6">{fr ? "Mon Profil" : "My Profile"}</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-2xl font-bold text-foreground mb-3">
            {initials}
          </div>
          <p className="text-muted-foreground text-sm">{user?.email || user?.phone}</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">{fr ? "Nom complet" : "Full name"}</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={fr ? "Votre nom" : "Your name"}
              className="bg-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{fr ? "Établissement scolaire" : "School"}</label>
            <Input 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
              placeholder={fr ? "Lycée / Collège" : "High School / College"}
              className="bg-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{fr ? "Niveau" : "Level"}</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary/50 transition-colors"
            >
              <option value="">{fr ? "Sélectionner…" : "Select…"}</option>
              <optgroup label={fr ? "Francophone" : "Francophone"}>
                {LEVELS.slice(0, 7).map((l) => <option key={l} value={l}>{l}</option>)}
              </optgroup>
              <optgroup label={fr ? "Anglophone" : "Anglophone"}>
                {LEVELS.slice(7).map((l) => <option key={l} value={l}>{l}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{fr ? "Langue préférée" : "Preferred language"}</label>
            <div className="flex gap-2">
              <button
                onClick={() => {}}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  lang === "fr" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => {}}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  lang === "en" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                🇬🇧 English
              </button>
            </div>
            <p className="text-[0.68rem] text-muted-foreground mt-1.5">
              {fr ? "Changez la langue via le sélecteur en haut à droite." : "Change language using the selector at the top right."}
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving || !name.trim()}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            {saving ? (fr ? "Enregistrement…" : "Saving…") : (fr ? "Enregistrer" : "Save")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 bg-card border border-border rounded-xl p-5">
          <h2 className="font-display text-sm mb-4">{fr ? "📊 Statistiques" : "📊 Statistics"}</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-2xl font-bold text-secondary">0</p>
              <p className="text-[0.70rem] text-muted-foreground">{fr ? "Exercices résolus" : "Exercises solved"}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-[0.70rem] text-muted-foreground">{fr ? "Minutes d'étude" : "Study minutes"}</p>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6 bg-muted/50 border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{fr ? "Compte créé le" : "Account created on"}</p>
          <p className="text-sm font-medium">
            {profile?.created_at 
              ? new Date(profile.created_at).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
