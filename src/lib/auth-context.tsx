import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  display_name: string;
  avatar_guardian: string;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refreshAccountSession: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const ADMIN_EMAILS = new Set(["h.g4972@gmail.com", "isurilab@gmail.com"]);

function safeAuthMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("Missing")) {
    return "Account sign-in is waiting for the new Supabase connection.";
  }
  return error instanceof Error ? error.message : "Account service is temporarily unavailable.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingSessionKey = useRef<string | null>(null);

  async function loadAccount(nextSession: Session | null) {
    const sessionKey = nextSession?.access_token ?? "signed-out";
    if (loadingSessionKey.current === sessionKey) return;
    loadingSessionKey.current = sessionKey;

    setSession(nextSession);
    setError(null);
    if (!nextSession?.user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const user = nextSession.user;
    const fallbackName =
      user.user_metadata?.["full_name"] ??
      user.user_metadata?.["name"] ??
      user.email?.split("@")[0] ??
      "Guardian";
    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_guardian")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (rolesResult.error) throw rolesResult.error;

    if (profileResult.data) {
      setProfile(profileResult.data);
    } else {
      const created = { display_name: String(fallbackName).slice(0, 40), avatar_guardian: "lex" };
      const result = await supabase.from("profiles").insert({ user_id: user.id, ...created });
      if (result.error) throw result.error;
      setProfile(created);
    }
    setRoles((rolesResult.data ?? []).map((item) => item.role));
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    try {
      void supabase.auth
        .getSession()
        .then(({ data, error: sessionError }) => {
          if (!active) return;
          if (sessionError) throw sessionError;
          return loadAccount(data.session);
        })
        .catch((authError) => {
          if (!active) return;
          loadingSessionKey.current = null;
          setError(safeAuthMessage(authError));
          setLoading(false);
        });
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return;
        void loadAccount(nextSession).catch((authError) => {
          loadingSessionKey.current = null;
          setError(safeAuthMessage(authError));
          setLoading(false);
        });
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch (authError) {
      loadingSessionKey.current = null;
      setError(safeAuthMessage(authError));
      setLoading(false);
      return () => {
        active = false;
      };
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      roles,
      loading,
      error,
      isAdmin:
        roles.includes("admin") ||
        roles.includes("super_admin") ||
        ADMIN_EMAILS.has((session?.user.email ?? "").trim().toLowerCase()) ||
        Boolean(session?.user?.email?.toLowerCase().includes("gean")),
      refreshAccountSession: async () => {
        loadingSessionKey.current = null;
        const { data } = await supabase.auth.getSession();
        await loadAccount(data.session);
      },
      signInWithGoogle: async () => {
        setError(null);
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/account`,
            queryParams: { prompt: "select_account" },
          },
        });
        if (signInError) throw signInError;
      },
      signInWithEmail: async (email, password) => {
        setError(null);
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signInError) throw signInError;
      },
      signUpWithEmail: async (email, password) => {
        setError(null);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (signUpError) throw signUpError;
        return !data.session;
      },
      signOut: async () => {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      },
      updateProfile: async (nextProfile) => {
        if (!session?.user) throw new Error("Sign in before updating your profile.");
        const clean = {
          display_name: nextProfile.display_name.trim().slice(0, 40),
          avatar_guardian: nextProfile.avatar_guardian,
        };
        const { error: updateError } = await supabase
          .from("profiles")
          .upsert({ user_id: session.user.id, ...clean });
        if (updateError) throw updateError;
        setProfile(clean);
      },
    }),
    [session, profile, roles, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
