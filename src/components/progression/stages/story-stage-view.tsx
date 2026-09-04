import { useEffect, useState } from "react";
import { Sparkles, MessageSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse } from "@/domain/progression/guardian-course-schema";
import { conversationalVoiceEngine } from "@/services/ai/conversational-voice-engine";

export function StoryStageView({
  course,
  locale = "en-US",
  onComplete,
}: {
  course: GuardianCourse;
  locale?: string;
  onComplete: () => void;
}) {
  const es = locale.startsWith("es");
  const [chapterIdx, setChapterIdx] = useState(0);
  const chapters = course.story.chapters;
  const currentChapter = chapters[chapterIdx] ?? chapters[0]!;

  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  useEffect(() => {
    // Speak first Nyrava dialogue line when chapter opens
    const nyravaLine = currentChapter.dialogue.find((d) => d.speaker === "Nyrava");
    if (nyravaLine) {
      conversationalVoiceEngine.speakGuardianResponse(text(nyravaLine.text));
    }
  }, [chapterIdx]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Chapter Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400">
          <Sparkles className="size-4" /> 🎬 Stage 1: Story Adventure ({chapterIdx + 1} / {chapters.length})
        </span>
        <span className="rounded-full bg-cyan-950 px-3 py-1 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
          {text(currentChapter.title)}
        </span>
      </div>

      {/* Narrative Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <p className="text-sm md:text-base leading-relaxed text-slate-200">
          {text(currentChapter.narrative)}
        </p>
      </div>

      {/* Message Preview Card (if present in chapter) */}
      {currentChapter.messagePreview && (
        <div className="my-4 rounded-2xl border border-amber-500/40 bg-slate-950 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2 text-xs font-black text-amber-400">
              <ShieldAlert className="size-4" />
              {text(currentChapter.messagePreview.header)}
            </span>
            <span className="rounded-full bg-rose-950 px-2 py-0.5 text-[9px] font-black text-rose-300 border border-rose-500/30">
              NEW NOTIFICATION
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            {text(currentChapter.messagePreview.body)}
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="w-full rounded-xl bg-amber-400 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition"
            >
              {text(currentChapter.messagePreview.actionLabel)}
            </button>
          </div>
        </div>
      )}

      {/* Dialogue Sequence */}
      <div className="space-y-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="size-3.5" /> {es ? "Diálogo de la Historia" : "Story Dialogue"}
        </p>
        {currentChapter.dialogue.map((line, idx) => {
          const isNyrava = line.speaker === "Nyrava";
          const isSender = line.speaker === "Sender";
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 text-xs font-bold transition ${
                isNyrava
                  ? "border-cyan-500/40 bg-cyan-950/60 text-cyan-200"
                  : isSender
                    ? "border-amber-500/40 bg-amber-950/60 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {line.speaker === "Nyrava"
                    ? "🛡️ NYRAVA (AI COMPANION)"
                    : line.speaker === "Guardian"
                      ? "👤 YOU (GUARDIAN)"
                      : "📩 INCOMING SENDER"}
                </span>
                {line.emotion && (
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">
                    {line.emotion}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold leading-relaxed">{text(line.text)}</p>
            </div>
          );
        })}
      </div>

      {/* Chapter Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          disabled={chapterIdx === 0}
          onClick={() => setChapterIdx((prev) => Math.max(0, prev - 1))}
          className="border-slate-700 bg-slate-900 text-slate-300 font-bold"
        >
          {es ? "Anterior" : "Previous"}
        </Button>
        {chapterIdx < chapters.length - 1 ? (
          <Button
            onClick={() => setChapterIdx((prev) => prev + 1)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
          >
            {es ? "Siguiente Capítulo" : "Next Chapter"} →
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
          >
            {es ? "Ir a la Investigación" : "Proceed to Investigation"} →
          </Button>
        )}
      </div>
    </div>
  );
}
