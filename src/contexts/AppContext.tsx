import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  level?: string;
  school?: string;
  child?: string;
  childId?: string;
}

interface AppState {
  screen: "landing" | "login-student" | "login-parent" | "app";
  page: string;
  lang: "en" | "fr";
  user: User | null;
  isParent: boolean;
  tutorMsg: string;
  showModal: boolean;
  setScreen: (s: AppState["screen"]) => void;
  setPage: (p: string) => void;
  setLang: (l: "en" | "fr") => void;
  setUser: (u: User | null) => void;
  setIsParent: (b: boolean) => void;
  setTutorMsg: (m: string) => void;
  setShowModal: (b: boolean) => void;
  goTo: (p: string) => void;
  goLogin: (mode: "student" | "parent") => void;
  onLoginSuccess: (u: User, mode: "student" | "parent") => void;
  fr: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const ACCOUNTS = {
  student: [
    { id: "EK001", name: "Emmanuel Kamga", email: "emmanuel@student.cm", phone: "+237 677 001 001", password: "math2024", level: "Form 5", school: "GHS Buea" },
    { id: "AN002", name: "Aisha Nkeng", email: "aisha@student.cm", phone: "+237 699 002 002", password: "olymp2024", level: "Upper Sixth", school: "GBHS Yaoundé" },
  ],
  parent: [
    { id: "PT001", name: "M. Tchamba", email: "parent@family.cm", phone: "+237 655 100 100", password: "parent2024", child: "Emmanuel Kamga", childId: "EK001" },
    { id: "PN002", name: "Mme Nkeng", email: "mnkeng@family.cm", phone: "+237 688 200 200", password: "nkeng2024", child: "Aisha Nkeng", childId: "AN002" },
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AppState["screen"]>("landing");
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [user, setUser] = useState<User | null>(null);
  const [isParent, setIsParent] = useState(false);
  const [tutorMsg, setTutorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const goTo = (p: string) => {
    setPage(p);
    if (p !== "tutor") setTutorMsg("");
  };

  const goLogin = (mode: "student" | "parent") => {
    setScreen(mode === "parent" ? "login-parent" : "login-student");
  };

  const onLoginSuccess = (u: User, mode: "student" | "parent") => {
    setUser(u);
    setIsParent(mode === "parent");
    setPage(mode === "parent" ? "parent" : "dashboard");
    setScreen("app");
  };

  const value: AppState = {
    screen, page, lang, user, isParent, tutorMsg, showModal,
    setScreen, setPage, setLang, setUser, setIsParent, setTutorMsg, setShowModal,
    goTo, goLogin, onLoginSuccess,
    fr: lang === "fr",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
