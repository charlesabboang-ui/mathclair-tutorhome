import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Dashboard from "@/pages/Dashboard";
import TutorChat from "@/pages/TutorChat";
import Topics from "@/pages/Topics";
import Practice from "@/pages/Practice";
import Exams from "@/pages/Exams";
import Olympiade from "@/pages/Olympiade";
import ParentControl from "@/pages/ParentControl";
import SubscribeModal from "@/components/SubscribeModal";

const NAV = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "🗣️", label: "Tutor", id: "tutor" },
  { icon: "📚", label: "Topics", id: "topics" },
  { icon: "✏️", label: "Practice", id: "practice" },
  { icon: "🎯", label: "Exams", id: "exams" },
  { icon: "🏆", label: "Olympiade", id: "olympiade" },
];

const TITLES: Record<string, Record<string, string>> = {
  dashboard: { en: "Dashboard", fr: "Tableau de Bord" },
  tutor: { en: "Voice Tutor — Clair", fr: "Tuteur Vocal — Clair" },
  topics: { en: "Topics", fr: "Thèmes" },
  practice: { en: "Practice", fr: "Exercices" },
  exams: { en: "Exam Preparation", fr: "Préparation aux Examens" },
  parent: { en: "Parental Control", fr: "Contrôle Parental" },
  olympiade: { en: "🏆 Olympiade Plan", fr: "🏆 Plan Olympiade" },
};

export default function AppShell() {
  const { page, lang, user, isParent, showModal, setShowModal, goTo, setScreen, setLang } = useApp();
  const [mobileNav, setMobileNav] = useState(false);

  const navItems = isParent ? [...NAV, { icon: "👨‍👩‍👧", label: "Parent", id: "parent" }] : NAV;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "tutor": return <TutorChat />;
      case "topics": return <Topics />;
      case "practice": return <Practice />;
      case "exams": return <Exams />;
      case "olympiade": return <Olympiade />;
      case "parent": return <ParentControl />;
      default: return <Dashboard />;
    }
  };

  const handleNav = (id: string) => {
    goTo(id);
    setMobileNav(false);
  };

  const NavItem = ({ icon, label, id }: { icon: string; label: string; id: string }) => {
    const active = page === id;
    const isOly = id === "olympiade";
    return (
      <div
        onClick={() => handleNav(id)}
        className={`flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer text-sm mb-0.5 transition-all ${
          active
            ? isOly ? "bg-primary/15 text-primary font-semibold" : "bg-secondary/15 text-secondary font-semibold"
            : isOly ? "text-primary hover:bg-primary/10" : "text-muted2 hover:bg-muted hover:text-foreground"
        } ${isOly && !active ? "border border-primary/30" : "border border-transparent"}`}
      >
        <span className="text-base w-5 text-center">{icon}</span>
        <span>{label}</span>
        {isOly && !active && (
          <span className="ml-auto text-[0.59rem] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-extrabold">NEW</span>
        )}
      </div>
    );
  };

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").substring(0, 2) || "EK";

  return (
    <div className="fixed inset-0 flex font-body bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[218px] flex-shrink-0 bg-card border-r border-border flex-col overflow-hidden">
        <div className="font-display text-lg px-3.5 py-3 border-b border-border flex-shrink-0">
          Math<span className="text-primary">Clair</span>
        </div>
        {/* User chip */}
        <div className="flex items-center gap-2.5 mx-2 mt-2 p-2 bg-muted rounded-xl flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-xs text-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[0.80rem] font-semibold truncate">{user?.name || "Student"}</div>
            <div className="text-[0.68rem] text-muted-foreground">
              {isParent ? `Suivi: ${user?.child || ""}` : user?.level || "Form 5"}
            </div>
          </div>
        </div>
        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-1.5 mt-1">
          {navItems.map((n) => <NavItem key={n.id} {...n} />)}
        </div>
        {/* Upgrade nudge */}
        {page !== "olympiade" && (
          <div onClick={() => goTo("olympiade")}
            className="mx-2 mb-1 p-3 rounded-xl cursor-pointer transition-transform hover:-translate-y-0.5 border border-primary/30"
            style={{ background: "linear-gradient(135deg, hsl(28,30%,5%), hsl(222,47%,11%))" }}>
            <p className="text-[0.70rem] text-primary font-bold mb-1">🏆 Plan Olympiade</p>
            <p className="text-[0.65rem] text-muted2 leading-snug mb-1.5">
              {lang === "fr" ? "Compétitions mensuelles & certificats" : "Monthly competitions & certificates"}
            </p>
            <p className="text-[0.68rem] text-primary font-bold">5 000 FCFA/mois →</p>
          </div>
        )}
        <div className="p-2 border-t border-border flex-shrink-0">
          <button onClick={() => setScreen("landing")}
            className="w-full py-1.5 px-3 rounded-full border border-border bg-transparent text-muted-foreground text-xs cursor-pointer font-bold hover:bg-muted transition-colors">
            ← {lang === "fr" ? "Quitter" : "Exit"}
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
              <button onClick={() => setMobileNav(false)} className="bg-transparent border-none text-muted-foreground text-lg cursor-pointer">✕</button>
            </div>
            {navItems.map((n) => <NavItem key={n.id} {...n} />)}
            <div className="mt-auto pt-3 border-t border-border">
              <button onClick={() => setScreen("landing")}
                className="w-full py-2 rounded-full border border-border bg-transparent text-muted-foreground text-xs font-bold cursor-pointer">
                ← Exit
              </button>
            </div>
          </div>
          <div className="flex-1 bg-background/50" />
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileNav(true)}
              className="md:hidden bg-transparent border-none text-muted2 text-xl cursor-pointer p-1">☰</button>
            <h2 className="font-display text-base">{TITLES[page]?.[lang] || page}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-full p-0.5 gap-0.5">
              {(["en", "fr"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-[0.72rem] font-bold cursor-pointer border-none transition-all ${
                    lang === l ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"
                  }`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-[0.72rem] cursor-pointer flex-shrink-0"
              title={user?.name}>
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex-shrink-0 border-t border-border bg-card">
          <div className="flex overflow-x-auto">
            {navItems.map((n) => {
              const active = page === n.id;
              const isOly = n.id === "olympiade";
              return (
                <button key={n.id} onClick={() => handleNav(n.id)}
                  className={`flex-none flex flex-col items-center gap-1 px-3.5 py-2.5 border-none bg-transparent cursor-pointer relative transition-colors font-body text-[0.62rem] ${
                    active ? (isOly ? "text-primary font-bold" : "text-secondary font-bold") : (isOly ? "text-primary" : "text-muted-foreground")
                  }`}>
                  <span className="text-xl">{n.icon}</span>
                  {n.label}
                  {active && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full ${isOly ? "bg-primary" : "bg-secondary"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && <SubscribeModal />}
    </div>
  );
}
