import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import getProgressTool from "./tools/get-progress";
import logStudySessionTool from "./tools/log-study-session";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mathclair-mcp",
  title: "MathClair MCP",
  version: "0.1.0",
  instructions:
    "Tools for MathClair — a bilingual (English/French) math tutor for Cameroon students. Use `get_profile` to fetch the signed-in user's profile, `get_progress` to review per-topic progress and recent study sessions, and `log_study_session` to record time spent and exercises completed.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, getProgressTool, logStudySessionTool],
});
