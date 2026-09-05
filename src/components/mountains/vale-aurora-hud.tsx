export function ValeAuroraHud({
  locked,
  started,
  onStart,
  touch,
}: {
  locked: boolean;
  started: boolean;
  onStart: () => void;
  touch: boolean;
}) {
  return (
    <>
      {!started || (!locked && !touch) ? (
        <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#06121e]/80 backdrop-blur-md">
          <div className="mx-6 max-w-md rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-8 text-center shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Everest Peak — Vale of Aurora</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white">
              A valley of stone, water and pine
            </h1>
            <p className="mt-4 text-xs font-medium text-slate-300">
              {touch
                ? "Drag anywhere to look around, use the pad to walk."
                : "Move with W A S D, look with mouse, hold Shift to run, Space to hop."}
            </p>
            <button
              onClick={onStart}
              className="mt-7 rounded-full border border-cyan-400 bg-cyan-950/90 px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 shadow-lg transition hover:bg-cyan-900 hover:scale-105"
            >
              {started ? "Resume Exploration" : "Enter Everest Peak"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/80 shadow-[0_0_10px_#22d3ee]" />

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-cyan-500/30 bg-slate-950/80 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-300 backdrop-blur shadow-xl">
        🏔️ Everest Peak — Vale of Aurora
      </div>
    </>
  );
}
