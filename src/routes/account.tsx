import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GUARDIANS } from "@/data/guardians";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, profile, loading, error, isAdmin, updateProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [guardian, setGuardian] = useState("lex");
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setGuardian(profile.avatar_guardian);
    }
  }, [profile]);

  if (loading) return <div className="panel p-8 text-center">Loading your Guardian account…</div>;
  if (!user) {
    return (
      <div className="panel mx-auto max-w-lg p-8 text-center">
        <UserRound className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-xl font-extrabold">Sign in to view your account</h1>
        <Link
          to="/login"
          className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
        >
          Continue with Google
        </Link>
        {error && <p className="mt-3 text-xs text-amber-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-8">
      <header>
        <h1 className="text-2xl font-extrabold md:text-3xl">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
      </header>

      <div className="panel space-y-5 p-5 sm:p-6">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Display name
          <input
            value={displayName}
            maxLength={40}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm font-bold normal-case tracking-normal outline-none focus:border-primary"
          />
        </label>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Profile Guardian
          <select
            value={guardian}
            onChange={(event) => setGuardian(event.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-bold normal-case tracking-normal"
          >
            {GUARDIANS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.role}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            void updateProfile({ display_name: displayName, avatar_guardian: guardian })
              .then(() => toast.success("Profile saved"))
              .catch((saveError) =>
                toast.error(
                  saveError instanceof Error ? saveError.message : "Profile could not be saved",
                ),
              )
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground"
        >
          <Save className="h-4 w-4" /> Save profile
        </button>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="panel flex items-center justify-between p-5 transition hover:border-primary"
        >
          <span>
            <span className="block text-sm font-extrabold">Administrator Panel</span>
            <span className="text-xs text-muted-foreground">
              AI status and protected configuration
            </span>
          </span>
          <ShieldCheck className="h-5 w-5 text-primary" />
        </Link>
      )}

      <button
        type="button"
        onClick={() => void signOut().then(() => navigate({ to: "/home" }))}
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
