import { MapPin, Navigation, ShieldCheck, Play, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITY_DISTRICTS, type DistrictInfo } from "@/data/city-districts";

export function CityMapModal({
  isOpen,
  onClose,
  onTeleport,
  onLaunchActivity,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTeleport: (pos: [number, number, number]) => void;
  onLaunchActivity: (activityKey: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Isla Central 2D Map & Navigator</h2>
              <p className="text-xs text-slate-400">Accessible District Fast-Travel & Activity Directory</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CITY_DISTRICTS.map((district) => (
            <div
              key={district.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white flex items-center gap-2">
                    <span>{district.icon}</span> {district.name}
                  </span>
                  <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    Unlocked
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{district.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <Button
                  onClick={() => {
                    onTeleport(district.pos);
                    onClose();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 text-xs font-bold"
                >
                  <Navigation className="size-3.5 mr-1" /> Teleport
                </Button>
                {district.activityKey && (
                  <Button
                    onClick={() => {
                      onLaunchActivity(district.activityKey!);
                      onClose();
                    }}
                    size="sm"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black"
                  >
                    <Play className="size-3.5 mr-1 fill-current" /> Activity
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
