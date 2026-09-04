import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Chrome, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [user, navigate]);

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="panel overflow-hidden border-cyan-400/25 bg-gradient-to-br from-cyan-400/10 via-background to-violet-500/10 p-6 text-center shadow-2xl sm:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-primary/40 bg-primary/10 shadow-lg shadow-cyan-500/10">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
          Nyrava Guardians
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome back, Guardian</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in to continue your academy progress, missions and protected Guardian tools.
        </p>

        <button
          type="button"
          disabled={loading || busy}
          onClick={() => {
            setBusy(true);
            setMessage(null);
            void signInWithGoogle()
              .catch((signInError) =>
                setMessage(
                  signInError instanceof Error
                    ? signInError.message
                    : "Google sign-in could not be started.",
                ),
              )
              .finally(() => setBusy(false));
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          className="space-y-3 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setMessage(null);
            const action = createAccount
              ? signUpWithEmail(email, password).then((needsConfirmation) => {
                  if (needsConfirmation) {
                    setMessage(
                      "Check your email to confirm the account, then return here to sign in.",
                    );
                    setCreateAccount(false);
                  }
                })
              : signInWithEmail(email, password);
            void action
              .catch((signInError) => {
                setMessage(
                  signInError instanceof Error
                    ? signInError.message
                    : "Account sign-in could not be completed.",
                );
              })
              .finally(() => setBusy(false));
          }}
        >
          <label
            className="block text-xs font-extrabold text-muted-foreground"
            htmlFor="guardian-email"
          >
            Email
          </label>
          <input
            id="guardian-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            placeholder="guardian@example.com"
          />
          <label
            className="block text-xs font-extrabold text-muted-foreground"
            htmlFor="guardian-password"
          >
            Password
          </label>
          <input
            id="guardian-password"
            type="password"
            autoComplete={createAccount ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            placeholder="At least 8 characters"
          />
          <button
            type="submit"
            disabled={loading || busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
            {createAccount ? "Create Guardian account" : "Sign in with email"}
          </button>
        </form>

        <button
          type="button"
          className="mt-3 text-xs font-bold text-primary"
          onClick={() => {
            setCreateAccount((current) => !current);
            setMessage(null);
          }}
        >
          {createAccount ? "I already have an account" : "Create a new Guardian account"}
        </button>

        {(message || error) && (
          <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
            {message || error}
          </p>
        )}
        <p className="mt-5 text-xs text-muted-foreground">
          Want to explore first? The academy remains playable without an account.{" "}
          <Link to="/home" className="font-bold text-primary">
            Return home
          </Link>
        </p>
      </div>
    </div>
  );
}
