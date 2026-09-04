import { Navigation, Play, X, Compass, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORLD_REGISTRY } from "@/domain/world/registry";

export function IslaCentralMapModal({
  isOpen,
  onClose,
  onTeleport,
  onNavigateWorld,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTeleport: (pos: [number, number, number]) => void;
  onNavigateWorld: (targetRoute: string) => void;
}) {
  if (!isOpen) return null;

  const islaSpec = WORLD_REGISTRY["isla-central"]!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Isla Central Hub 2D Navigator</h2>
              <p className="text-xs text-slate-400">Inter-World Portals & District Directory</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="size-5" />
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">🌀 Inter-World Travel Portals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {islaSpec.portals.map((portal) => (
              <div key={portal.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{portal.label}</p>
                  <p className="text-[10px] text-cyan-400 font-mono">{portal.targetRoute}</p>
                </div>
                <Button
                  onClick={() => {
                    onNavigateWorld(portal.targetRoute);
                    onClose();
                  }}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black"
                >
                  <Globe className="size-3.5 mr-1" /> Enter World
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">🏛️ Hub Districts & Gateways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {islaSpec.districts.map((district) => (
              <div key={district.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{district.icon}</span> {district.name}
                  </span>
                  <Button
                    onClick={() => {
                      onTeleport(district.pos);
                      onClose();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/30 text-cyan-300 text-[11px] font-bold py-1 h-auto"
                  >
                    <Navigation className="size-3 mr-1" /> Teleport
                  </Button>
                </div>
                <p className="text-xs text-slate-300">{district.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
