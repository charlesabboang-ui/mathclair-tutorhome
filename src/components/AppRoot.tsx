import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Index";
import AuthScreen from "@/components/AuthScreen";
import AppShell from "@/components/AppShell";

export default function AppRoot() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"student" | "parent" | null>(null);
  const [lang, setLang] = useState<"en" | "fr">("en");

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="font-display text-2xl mb-3">Math<span className="text-primary">Clair</span></div>
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin-slow mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode) {
      return <AuthScreen mode={authMode} onBack={() => setAuthMode(null)} lang={lang} />;
    }
    return <Landing onLogin={setAuthMode} lang={lang} setLang={setLang} />;
  }

  return <AppShell />;
}
