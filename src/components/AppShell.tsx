import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRole";
import Dashboard from "@/pages/Dashboard";
import TutorChat from "@/pages/TutorChat";
import Topics from "@/pages/Topics";
import Practice from "@/pages/Practice";
import Exams from "@/pages/Exams";
import Olympiade from "@/pages/Olympiade";
import ParentControl from "@/pages/ParentControl";
import Whiteboard from "@/pages/Whiteboard";
import SubscribeModal from "@/components/SubscribeModal";
import OnboardingTour from "@/components/OnboardingTour";

const NAV = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "🗣️", label: "Tutor", id: "tutor" },
  { icon: "📚", label: "Topics", id: "topics" },
  { icon: "✏️", label: "Practice", id: "practice" },
  { icon: "🎯", label: "Exams", id: "exams" },
  { icon: "🎨", label: "Whiteboard", id: "whiteboard" },
  { icon: "🏆", label: "Olympiade", id: "olympiade" },
];

const TITLES: Record<string, Record<string, string>> = {
  dashboard: { en: "Dashboard", fr: "Tableau de Bord" },
  tutor: { en: "Voice Tutor — Clair (Socratic)", fr: "Tuteur Vocal — Clair (Socratique)" },
  topics: { en: "Topics", fr: "Thèmes" },
  practice: { en: "Practice", fr: "Exercices" },
  exams: { en: "Exam Preparation", fr: "Préparation aux Examens" },
  whiteboard: { en: "Whiteboard & Graphs", fr: "Tableau & Graphiques" },
  parent: { en: "Parental Control", fr: "Contrôle Parental" },
  olympiade: { en: "🏆 Olympiade Plan", fr: "🏆 Plan Olympiade" },
};

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const { isAdmin } = useUserRoles();
  const [page, setPage] = useState(profile?.is_parent ? "parent" : "dashboard");
  const [lang, setLang] = useState<"en" | "fr">((profile?.lang as "en" | "fr") || "en");
  const [mobileNav, setMobileNav] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tutorMsg, setTutorMsg] = useState("");

  const fr = lang === "fr";
  const isParent = profile?.is_parent || false;
  const navItems = isParent ? [...NAV, { icon: "👨‍👩‍👧", label: "Parent", id: "parent" }] : NAV;

  const goTo = (p: string) => {
    setPage(p);
    if (p !== "tutor") setTutorMsg("");
    setMobileNav(false);
  };

  const renderPage = () => {
    const ctx = { lang, fr, goTo, setTutorMsg, setShowModal };
    switch (page) {
      case "dashboard": return <Dashboard {...ctx} />;
      case "tutor": return <TutorChat lang={lang} fr={fr} tutorMsg={tutorMsg} />;
      case "topics": return <Topics {...ctx} />;
      case "practice": return <Practice {...ctx} />;
      case "exams": return <Exams {...ctx} />;
      case "whiteboard": return <Whiteboard fr={fr} />;
      case "olympiade": return <Olympiade lang={lang} fr={fr} setShowModal={setShowModal} />;
      case "parent": return <ParentControl lang={lang} fr={fr} />;
      default: return <Dashboard {...ctx} />;
    }
  };

  const NavItem = ({ icon, label, id }: { icon: string; label: string; id: string }) => {
    const active = page === id;
    const isOly = id === "olympiade";
    return (
      <div onClick={() => goTo(id)} data-tour={id === "tutor" ? "nav-tutor" : undefined}
        className={`flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${
          active
            ? isOly ? "bg-primary/15 text-primary font-semibold" : "bg-secondary/15 text-secondary font-semibold"
            : isOly ? "text-primary hover:bg-primary/10" : "text-muted2 hover:bg-muted hover:text-foreground"
        } ${isOly && !active ? "border border-primary/30" : "border border-transparent"}`}>
        <span className="text-base w-5 text-center">{icon}</span>
        <span>{label}</span>
        {isOly && !active && (
          <span className="ml-auto text-[0.59rem] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-extrabold">NEW</span>
        )}
      </div>
    );
  };

  const initials = profile?.name?.split(" ").map((w) => w[0]).join("").substring(0, 2) || "MC";

  return (
    <div className="fixed inset-0 flex font-body bg-background text-foreground overflow-hidden">
      <Seo page={page} lang={lang} context={seo} />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[218px] flex-shrink-0 bg-card border-r border-border flex-col overflow-hidden">
        <div className="font-display text-lg px-3.5 py-3 border-b border-border flex-shrink-0">
          Math<span className="text-primary">Clair</span>
        </div>
        <div className="flex items-center gap-2.5 mx-2 mt-2 p-2 bg-muted rounded-xl flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-xs text-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[0.80rem] font-semibold truncate">{profile?.name || "Student"}</div>
            <div className="text-[0.68rem] text-muted-foreground">
              {isParent ? `${fr ? "Suivi:" : "Child:"} ${profile?.child_name || ""}` : profile?.level || ""}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 mt-1">
          {navItems.map((n) => <NavItem key={n.id} {...n} />)}
        </div>
        {page !== "olympiade" && (
          <div onClick={() => goTo("olympiade")}
            className="mx-2 mb-1 p-3 rounded-xl cursor-pointer transition-transform hover:-translate-y-0.5 border border-primary/30"
            style={{ background: "linear-gradient(135deg, hsl(28,30%,5%), hsl(222,47%,11%))" }}>
            <p className="text-[0.70rem] text-primary font-bold mb-1">🏆 Plan Olympiade</p>
            <p className="text-[0.65rem] text-muted2 leading-snug mb-1.5">
              {fr ? "Compétitions mensuelles & certificats" : "Monthly competitions & certificates"}
            </p>
            <p className="text-[0.68rem] text-primary font-bold">5 000 FCFA/mois →</p>
          </div>
        )}
        <div className="p-2 border-t border-border flex-shrink-0">
          <button onClick={signOut}
            className="w-full py-1.5 px-3 rounded-full border border-border bg-transparent text-muted-foreground text-xs cursor-pointer font-bold hover:bg-muted transition-colors">
            ← {fr ? "Déconnexion" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Mobile overlay nav */}
      {mobileNav && (
        <div className="fixed inset-0 z-[100] flex md:hidden" onClick={() => setMobileNav(false)}>
          <div className="w-60 bg-card border-r border-border flex flex-col p-4 overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="font-display text-lg">Math<span className="text-primary">Clair</span></p>
              <button onClick={() => setMobileNav(false)} aria-label={fr ? "Fermer le menu" : "Close menu"} className="bg-transparent border-none text-muted-foreground text-lg cursor-pointer">✕</button>
            </div>
            {navItems.map((n) => <NavItem key={n.id} {...n} />)}
            <div className="mt-auto pt-3 border-t border-border">
              <button onClick={signOut}
                className="w-full py-2 rounded-full border border-border bg-transparent text-muted-foreground text-xs font-bold cursor-pointer">
                ← {fr ? "Déconnexion" : "Sign Out"}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-background/50" />
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-5 py-2.5 flex-shrink-0 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileNav(true)} aria-label={fr ? "Ouvrir le menu" : "Open menu"}
              className="md:hidden bg-transparent border-none text-muted2 text-xl cursor-pointer p-1">☰</button>
            <h2 className="font-display text-sm md:text-base">{TITLES[page]?.[lang] || page}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin"
                className="text-[0.68rem] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors">
                Admin
              </Link>
            )}
            <div className="flex bg-muted rounded-full p-0.5 gap-0.5">
              {(["en", "fr"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-[0.72rem] font-bold cursor-pointer border-none transition-all ${
                    lang === l ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                  }`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-[0.72rem] cursor-pointer flex-shrink-0"
              title={profile?.name}>
              {initials}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative overflow-hidden">
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex-shrink-0 border-t border-border bg-card">
          <div className="flex overflow-x-auto">
            {navItems.slice(0, 5).map((n) => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => goTo(n.id)} data-tour={n.id === "tutor" ? "nav-tutor" : undefined}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 border-none bg-transparent cursor-pointer relative transition-colors font-body text-[0.60rem] min-w-0 ${
                    active ? "text-secondary font-bold" : "text-muted-foreground"
                  }`}>
                  <span className="text-lg">{n.icon}</span>
                  <span className="truncate">{n.label}</span>
                  {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-secondary" />}
                </button>
              );
            })}
            <button onClick={() => setMobileNav(true)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 border-none bg-transparent cursor-pointer font-body text-[0.60rem] text-muted-foreground min-w-0">
              <span className="text-lg">⋯</span>
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      {showModal && <SubscribeModal lang={lang} fr={fr} onClose={() => setShowModal(false)} />}
      <OnboardingTour fr={fr} onGoTutor={() => goTo("tutor")} />
    </div>
  );
}
