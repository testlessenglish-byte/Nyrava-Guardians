import { WORLD_REGISTRY } from "@/domain/world/registry";

export function InfiniteOceanMapModal({
  open,
  onClose,
  onTeleport,
  onLaunchActivity,
}: {
  open: boolean;
  onClose: () => void;
  onTeleport: (pos: [number, number, number]) => void;
  onLaunchActivity: (activityKey: string) => void;
}) {
  if (!open) return null;

  const world = WORLD_REGISTRY["infinite-ocean"];
  const districts = world?.districts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 text-slate-100 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-cyan-400">🌊 Infinite Ocean Map</h2>
            <p className="text-xs text-cyan-200/70">Sub-aquatic reefs, marine biology sorting, and deep sea signal research</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            ✕ Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {districts.map((d) => (
            <div
              key={d.id}
              className="flex flex-col justify-between rounded-2xl border border-cyan-900/40 bg-slate-950/60 p-4 transition-all hover:border-cyan-500/50"
            >
              <div>
                <div className="flex items-center gap-2 text-base font-bold text-cyan-300">
                  <span>{d.icon}</span>
                  <span>{d.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{d.description}</p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    onTeleport(d.pos);
                    onClose();
                  }}
                  className="w-full rounded-lg border border-cyan-500/40 bg-cyan-950/60 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/80"
                >
                  📍 Teleport
                </button>
                {d.activityKey && (
                  <button
                    onClick={() => {
                      onLaunchActivity(d.activityKey!);
                      onClose();
                    }}
                    className="w-full rounded-lg bg-cyan-500 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    ▶ Activity
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
