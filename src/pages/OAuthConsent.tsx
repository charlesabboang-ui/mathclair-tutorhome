import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Minimal typed shim for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi | null {
  const api = (supabase.auth as unknown as { oauth?: OAuthApi }).oauth;
  return api ?? null;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const api = oauthApi();
      if (!api) return setError("OAuth server API is unavailable in this app.");

      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setNeedsSignIn(true);
        return;
      }

      const { data, error } = await api.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    const api = oauthApi();
    if (!api) return;
    setBusy(true);
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="font-display text-lg">
          Math<span className="text-primary">Clair</span> · Connect an app
        </div>

        {error && (
          <p className="text-sm text-destructive">Could not load this authorization request: {error}</p>
        )}

        {needsSignIn && !error && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You need to sign in to MathClair before approving this connection. Open MathClair in
              another tab, sign in with your phone number, then reload this page to continue.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold"
            >
              Open MathClair sign-in →
            </a>
          </div>
        )}

        {!needsSignIn && !error && !details && (
          <p className="text-sm text-muted-foreground">Loading authorization request…</p>
        )}

        {details && (
          <>
            <p className="text-sm">
              <span className="font-semibold">{details.client?.name ?? "An app"}</span> wants to
              connect to your MathClair account. It will be able to read your profile and study
              progress, and log new study sessions on your behalf.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60"
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 px-4 py-2 rounded-full border border-border bg-transparent text-sm font-bold disabled:opacity-60"
              >
                Deny
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
