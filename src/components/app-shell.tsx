import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  Compass,
  Cpu,
  GraduationCap,
  Home,
  Map,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/guardians/logo.png";
import { useGuardian } from "@/lib/guardian-context";
import { GUARDIAN_IMAGES, GUARDIANS } from "@/data/guardians";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { isImmersiveGameRoute } from "@/lib/game-route";

const NAV = [
  { to: "/home", label: "My Home", icon: Home },
  { to: "/world", label: "World", icon: Map },
  { to: "/isla", label: "Isla Central", icon: Compass },
  { to: "/academy", label: "Academy", icon: GraduationCap },
  { to: "/classroom", label: "Live Class", icon: Users },
  { to: "/missions", label: "Missions", icon: Swords },
  { to: "/builder", label: "AI Builder", icon: Bot },
  { to: "/parent", label: "Parent Portal", icon: Shield },
] as const;

function GuardianChip() {
  const { guardianId, xp } = useGuardian();
  const { user, profile, loading } = useAuth();
  if (!loading && !user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
      >
        <Users className="h-3.5 w-3.5" /> Sign in
      </Link>
    );
  }
  if (user) {
    return (
      <Link
        to="/account"
        className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold transition hover:border-primary"
      >
        <Users className="h-3.5 w-3.5 text-primary" />{" "}
        {profile?.display_name || user.email?.split("@")[0] || "Account"}
      </Link>
    );
  }
  if (!guardianId) {
    return (
      <Link
        to="/"
        className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Choose your Guardian
      </Link>
    );
  }
  const guardian = GUARDIANS.find((g) => g.id === guardianId);
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3">
      <img
        src={GUARDIAN_IMAGES[guardianId]}
        alt={guardian?.name ?? "Guardian"}
        className="h-8 w-8 rounded-full border border-primary/40 object-cover object-top"
      />
      <div className="leading-tight">
        <p className="text-xs font-bold">{guardian?.name}</p>
        <p className="text-[10px] font-semibold text-primary">{xp.toLocaleString()} XP</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { roles } = useAuth();
  const isParentOrAdmin = roles.includes("guardian") || roles.includes("admin");

  const visibleNav = NAV.filter((item) => {
    if (item.to === "/parent") return isParentOrAdmin;
    return true;
  });

  // Every real-time 3D route must own the full viewport. Running these scenes
  // inside the standard header/sidebar shell changes their layout and pointer area.
  if (isImmersiveGameRoute(pathname)) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-background">
        {children}
        <Link
          to="/home"
          aria-label="Leave world"
          className="leave-world fixed left-3 top-3 z-[60] flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-bold backdrop-blur transition hover:bg-background"
        >
          <img src={logo} alt="Nyrava Guardians" className="h-4 w-4" />
          <span>Leave world</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Nyrava Guardians logo" className="h-8 w-8" />
            <span className="font-display text-sm font-extrabold tracking-widest">
              NYRAVA <span className="text-primary text-glow">GUARDIANS</span>
            </span>
          </Link>
          <GuardianChip />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-24 pt-6 md:pb-10">
        <aside className="sticky top-20 hidden h-fit w-48 shrink-0 flex-col gap-1 md:flex">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition",
                  active
                    ? "bg-primary/15 text-primary glow-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden">
        <div className="flex min-w-max justify-center">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={cn(
                  "flex min-w-20 flex-col items-center gap-0.5 px-2 py-2.5 text-[9px] font-bold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
