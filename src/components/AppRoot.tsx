import { useApp } from "@/contexts/AppContext";
import Landing from "@/pages/Index";
import LoginScreen from "@/components/LoginScreen";
import AppShell from "@/components/AppShell";

export default function AppRoot() {
  const { screen } = useApp();

  if (screen === "login-student" || screen === "login-parent") {
    return <LoginScreen mode={screen === "login-parent" ? "parent" : "student"} />;
  }

  if (screen === "app") {
    return <AppShell />;
  }

  return <Landing />;
}
