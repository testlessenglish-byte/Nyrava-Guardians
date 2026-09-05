import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { ValeAuroraWorld } from "@/components/mountains/vale-aurora-world";
import { KnowledgeMountainsMapModal } from "@/components/mountains/knowledge-mountains-map-modal";
import { GameSettings } from "@/components/game/game-feedback";
import { Button } from "@/components/ui/button";
import { PauseMenu } from "@/components/game/pause-menu";
import { completeWorldActivity } from "@/lib/progression.functions";

export const Route = createFileRoute("/world/knowledge-mountains")({
  ssr: false,
  component: KnowledgeMountainsPage,
});

function KnowledgeMountainsPage() {
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleLaunchActivity = (activityKey: string) => {
    setActiveMinigame(activityKey);
    completeWorldActivity({ data: { worldId: "knowledge-mountains", activityKey } })
      .then(() => setNotification(`🎉 Discovered activity: ${activityKey}`))
      .catch(() => undefined);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-950">
      {/* FULL-SCREEN 3D VALE OF AURORA / EVEREST PEAK WORLD */}
      <ValeAuroraWorld />

      {/* TOP NAVIGATION OVERLAY */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/realm"
            className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-slate-950/80 px-4 py-2 text-xs font-black text-sky-300 shadow-xl backdrop-blur transition hover:bg-slate-900 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 text-sky-400" />
            World Map
          </Link>
          <div className="hidden rounded-2xl border border-sky-500/30 bg-slate-950/80 px-4 py-2 text-xs font-black text-sky-200 backdrop-blur sm:flex">
            🏔️ Everest Peak
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <Button
            onClick={() => setIsMapOpen(true)}
            variant="outline"
            className="gap-2 rounded-2xl border-sky-500/40 bg-slate-950/80 text-xs font-black text-sky-300 hover:bg-slate-900"
          >
            <Compass className="h-4 w-4 text-sky-400" />
            Interactive Map
          </Button>
          <PauseMenu />
          <GameSettings />
        </div>
      </div>

      {notification && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-sky-400/50 bg-slate-950/90 px-5 py-2.5 text-xs font-black text-sky-300 shadow-2xl backdrop-blur">
          {notification}
        </div>
      )}

      {/* 2D MAP MODAL */}
      <KnowledgeMountainsMapModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={() => setIsMapOpen(false)}
        onLaunchActivity={handleLaunchActivity}
      />
    </div>
  );
}
