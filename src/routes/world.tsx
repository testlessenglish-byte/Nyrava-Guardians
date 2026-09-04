import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Landmark, TreePine, Mountain, Waves, Rocket, Globe2, Play } from "lucide-react";
import worldMapImg from "@/assets/guardians/world_map.jpg";
import { useGuardian } from "@/lib/guardian-context";
import { WORLD_REGISTRY } from "@/domain/world/registry";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "Nyrava Guardian Realm — Nyrava Guardians" },
      { name: "description", content: "Explore your persistent expandable Nyrava Guardian Realm." },
    ],
  }),
  component: WorldRouteComponent,
});

function WorldRouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/world" || pathname === "/world/") {
    return <Navigate to="/realm" replace />;
  }
  return <Outlet />;
}

const ICON_MAP: Record<string, any> = {
  "isla-central": Landmark,
  "central-city": Landmark,
  "wisdom-forest": TreePine,
  "history-valley": Landmark,
  "knowledge-mountains": Mountain,
  "infinite-ocean": Waves,
  "space-zone": Rocket,
};

const COLOR_MAP: Record<string, string> = {
  "isla-central": "#38bdf8",
  "central-city": "#22d3ee",
  "wisdom-forest": "#34d399",
  "history-valley": "#fbbf24",
  "knowledge-mountains": "#60a5fa",
  "infinite-ocean": "#38bdf8",
  "space-zone": "#c084fc",
};

const POSITION_MAP: Record<string, { x: string; y: string }> = {
  "isla-central": { x: "50%", y: "42%" },
  "central-city": { x: "58%", y: "30%" },
  "wisdom-forest": { x: "25%", y: "29%" },
  "history-valley": { x: "33%", y: "62%" },
  "knowledge-mountains": { x: "72%", y: "28%" },
  "infinite-ocean": { x: "53%", y: "73%" },
  "space-zone": { x: "81%", y: "53%" },
};

function WorldPage() {
  const { guardianName, xp, locale } = useGuardian();
  const es = locale.startsWith("es");
  const level = Math.max(1, Math.floor(xp / 1000) + 1);
  const worlds = Object.values(WORLD_REGISTRY);

  return (
    <div className="mx-auto w-full max-w-[1500px] pb-4 text-white">
      <section className="relative min-h-[calc(100svh-14rem)] overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#04101f] shadow-[0_24px_80px_rgba(8,145,178,0.2)] sm:min-h-[calc(100svh-7rem)] sm:rounded-3xl">
        <img
          src={worldMapImg}
          alt={es ? "Mapa ilustrado de Isla Central" : "Illustrated map of Isla Central"}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-transparent to-[#03101e]/90" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

        <header className="absolute left-3 right-3 top-3 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/75 p-3 shadow-xl backdrop-blur-md sm:left-5 sm:right-5 sm:top-5 sm:w-auto sm:max-w-xl sm:p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/40 bg-cyan-950/80">
            <Globe2 className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black sm:text-2xl">
              {es ? "Mapa del Archipelago Nyrava" : "Nyrava Archipelago World Map"}
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 sm:text-xs">
              {es ? "7 Mundos Explorables" : "7 Explorable Worlds"}
            </p>
          </div>
          <div className="ml-auto hidden shrink-0 text-right text-[10px] text-slate-300 min-[430px]:block sm:text-xs">
            <b className="block text-white">{guardianName}</b>
            {es ? "Nivel" : "Level"} {level} · {xp} XP
          </div>
        </header>

        {worlds.map((world) => {
          const Icon = ICON_MAP[world.id] || Landmark;
          const color = COLOR_MAP[world.id] || "#38bdf8";
          const pos = POSITION_MAP[world.id] || { x: "50%", y: "50%" };

          return (
            <Link
              key={world.id}
              to={world.route}
              aria-label={world.displayName}
              style={{ left: pos.x, top: pos.y, borderColor: color }}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-slate-950/85 p-2.5 shadow-[0_0_24px_rgba(34,211,238,0.35)] backdrop-blur transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 sm:p-3"
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color }} />
              <span className="sr-only">{world.displayName}</span>
            </Link>
          );
        })}

        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-3 rounded-2xl border border-cyan-300/35 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-lg sm:p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              {es ? "Central Hub" : "Central Hub"}
            </p>
            <p className="truncate text-sm font-black sm:text-lg">
              {es ? "Isla Central Abierta" : "Isla Central Hub Open"}
            </p>
          </div>
          <Link
            to="/world/isla-central"
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-xs font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition hover:bg-white"
          >
            <Play className="h-4 w-4 fill-current" />
            {es ? "ENTRAR HUB" : "ENTER HUB"}
          </Link>
        </div>
      </section>
    </div>
  );
}
