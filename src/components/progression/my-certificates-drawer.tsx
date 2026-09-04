import { useState } from "react";
import { Award, Download, Eye, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourseCompletion } from "@/lib/guardian-completions";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { CertificateModal } from "./certificate-modal";

export function MyCertificatesDrawer({
  completions,
  locale = "en-US",
  open,
  onClose,
}: {
  completions: GuardianCourseCompletion[];
  locale?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [selectedCompletion, setSelectedCompletion] = useState<GuardianCourseCompletion | null>(null);

  if (!open) return null;

  const es = locale.startsWith("es");
  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-950 border border-amber-500/40 p-2.5 text-amber-400">
              <Award className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {es ? "🏆 Mis Certificados de Competencia" : "🏆 My Certificates of Competency"}
              </h2>
              <p className="text-xs text-slate-400">
                {es
                  ? "Portafolio oficial de aprendizaje y certificaciones de Guardian."
                  : "Official Guardian learning portfolio and verified achievement certificates."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Certificates List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {completions.length === 0 ? (
            <div className="p-10 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40">
              <Sparkles className="size-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">
                {es ? "Aún no tienes certificados otorgados." : "No earned certificates yet."}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {es
                  ? "Completa los cursos del aula de Guardian con al menos 75% de dominio para obtener tu certificado oficial."
                  : "Complete Guardian classroom courses with at least 75% mastery to unlock official certificates."}
              </p>
            </div>
          ) : (
            completions.map((comp) => (
              <div
                key={comp.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-950 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 uppercase">
                      🟢 {comp.mastery_score}% {es ? "Dominio" : "Mastery"}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {comp.certificate_id}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{text(comp.course_title)}</h4>
                  <p className="text-[11px] text-slate-400">
                    Badge: <strong className="text-cyan-300">{text(comp.badge_name)}</strong> ·{" "}
                    {new Date(comp.completed_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCompletion(comp)}
                    className="border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs"
                  >
                    <Eye className="size-3.5 mr-1" />
                    {es ? "Ver" : "View"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => generateCertificatePdf(comp, es ? "es" : "en")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                  >
                    <Download className="size-3.5 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal View for specific certificate */}
        {selectedCompletion && (
          <CertificateModal
            completion={selectedCompletion}
            locale={locale}
            open={Boolean(selectedCompletion)}
            onClose={() => setSelectedCompletion(null)}
          />
        )}
      </div>
    </div>
  );
}
