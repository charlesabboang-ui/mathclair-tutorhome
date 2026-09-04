import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppRoot from "@/components/AppRoot";
import { SeoContextProvider } from "@/hooks/useSeoContext";
import ClaudeChat from "@/pages/ClaudeChat";
import OAuthConsent from "@/pages/OAuthConsent";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
       <SeoContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppRoot />} />
            <Route path="/claude" element={<div className="h-screen bg-background text-foreground"><ClaudeChat /></div>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
       </SeoContextProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
