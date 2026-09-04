import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Compass, Bot, Sparkles, Coins, Shield } from "lucide-react";
import { NyravaGuardianRealmScene } from "@/components/realm/nyrava-guardian-realm-scene";
import { RealmAiBuilderDrawer } from "@/components/realm/realm-ai-builder-drawer";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { Button } from "@/components/ui/button";
import { PauseMenu } from "@/components/game/pause-menu";
import { getRealmState, placeRealmStructure } from "@/lib/realm.functions";
import { type NyravaRealmState, type BuildableZoneId, GUARDIAN_TIERS } from "@/domain/realm/realm-types";

export const Route = createFileRoute("/realm")({
  ssr: false,
  component: NyravaRealmPage,
});

function NyravaRealmPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const navigate = useNavigate();
  const { guardianName } = useGuardian();
  const guardian = CLASS_GUARDIANS.find((g) => g.id === "lex") ?? CLASS_GUARDIANS[0]!;
  const playerColor = guardian.color ?? "#38bdf8";
  const playerLabel = `${guardianName || "Alex"} · Guardian`;
  const inputManager = useMemo(() => new InputManager(), []);

  const [realmState, setRealmState] = useState<NyravaRealmState | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<BuildableZoneId | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshRealmState = () =>
    getRealmState()
      .then(setRealmState)
      .catch(() => undefined);

  useEffect(() => {
    refreshRealmState();
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => inputManager.onKeyDown(event);
    const up = (event: KeyboardEvent) => inputManager.onKeyUp(event);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      inputManager.dispose();
    };
  }, [inputManager]);

  const isModalOpen = builderOpen;

  useEffect(() => {
    inputManager.setEnabled(!isModalOpen);
    if (!isModalOpen) inputManager.reset();
  }, [isModalOpen, inputManager]);

  const handleOpenZoneBuilder = (zoneId: string) => {
    setSelectedZoneId(zoneId as BuildableZoneId);
    setBuilderOpen(true);
  };

  const handleConfirmBuild = async (data: { kind: string; name: string; zoneId: BuildableZoneId; cost: number }) => {
    try {
      const zonePositions: Record<BuildableZoneId, [number, number, number]> = {
        "waterfall-clearing": [-18, 0, -12],
        "river-bend": [18, 0, 12],
        "forest-clearing": [-22, 0, 14],
        "mountain-overlook": [22, 0, -14],
        "hq-plateau": [0, 0, 0],
      };
      const pos = zonePositions[data.zoneId] || [0, 0, 0];

      const newState = await placeRealmStructure({
        data: {
          kind: data.kind,
          name: data.name,
          zoneId: data.zoneId,
          pos,
          cost: data.cost,
        },
      });

      setRealmState(newState);
      setNotification(`✨ ${data.name} placed in your Realm! -${data.cost} Points`);
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      setNotification(`⚠️ ${e.message || "Failed to place structure"}`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const currentTier = realmState?.tier || 1;
  const currentPoints = realmState?.points || 250;
  const tierInfo = GUARDIAN_TIERS[currentTier];

  return (
    <div className="game-viewport realm-viewport fixed inset-0 bg-background">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (
            event.pointerType !== "mouse" ||
            isModalOpen ||
            !(event.target instanceof HTMLCanvasElement)
          )
            return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging.current && !isModalOpen)
            inputManager.setCameraLook(event.movementX, event.movementY);
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => {
          dragging.current = false;
          inputManager.reset();
        }}
        onLostPointerCapture={() => (dragging.current = false)}
      >
        <GameErrorBoundary>
          <Canvas
            frameloop={active ? "always" : "never"}
            shadows={quality.shadows}
            dpr={quality.dpr}
            camera={{ position: [0, 6, 30], fov: 58 }}
          >
            <NyravaGuardianRealmScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId="lex"
              tier={currentTier}
              placedStructures={realmState?.placedStructures || []}
              inputManager={inputManager}
              blocked={isModalOpen}
              onOpenZoneBuilder={handleOpenZoneBuilder}
              teleportTarget={teleportTarget}
            />
          </Canvas>
        </GameErrorBoundary>
      </div>

      <WorldLoading />

      {/* TOP BAR HUD */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-4 z-40">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/home"
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-4 py-2 text-xs font-black text-cyan-300 shadow-xl backdrop-blur transition hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-4 py-2 text-xs font-black text-cyan-200 backdrop-blur">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Nyrava Guardian Realm</span>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-300">
              Tier {currentTier}: {tierInfo.title}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-slate-950/90 px-4 py-2 text-xs font-black text-amber-300 shadow-xl backdrop-blur">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>{currentPoints} Points</span>
          </div>

          <Button
            onClick={() => {
              setSelectedZoneId(null);
              setBuilderOpen(true);
            }}
            className="gap-2 rounded-2xl bg-cyan-400 text-xs font-black text-slate-950 hover:bg-cyan-300 shadow-xl"
          >
            <Bot className="h-4 w-4" />
            AI Builder
          </Button>

          <PauseMenu />
          <GameSettings />
        </div>
      </div>

      {notification && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-2xl border border-cyan-400/50 bg-slate-950/90 px-5 py-2.5 text-xs font-black text-cyan-300 shadow-2xl backdrop-blur z-50">
          {notification}
        </div>
      )}

      {/* TOUCH CONTROLS */}
      {!isModalOpen && (
        <div className="mobile-game-controls pointer-events-none fixed inset-0 z-40">
          <div className="game-left pointer-events-auto">
            <AnalogJoystick target={inputManager.joystick} />
          </div>
          <div className="game-right pointer-events-auto">
            <LookPad target={inputManager} />
          </div>
          <div className="game-actions pointer-events-auto">
            <button
              type="button"
              className="game-action font-black"
              aria-label="Interact"
              onClick={() => inputManager.triggerInteract()}
            >
              Use
            </button>
          </div>
        </div>
      )}

      {/* AI BUILDER DRAWER */}
      <RealmAiBuilderDrawer
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        selectedZoneId={selectedZoneId}
        userPoints={currentPoints}
        userTier={currentTier}
        onConfirmBuild={handleConfirmBuild}
      />
    </div>
  );
}
