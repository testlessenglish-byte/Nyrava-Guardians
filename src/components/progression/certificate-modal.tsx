import { Trophy, Download, X, ShieldCheck, Calendar, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourseCompletion } from "@/lib/guardian-completions";
import { generateCertificatePdf } from "@/lib/certificate-pdf";

export function CertificateModal({
  completion,
  locale = "en-US",
  open,
  onClose,
}: {
  completion: GuardianCourseCompletion | null;
  locale?: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !completion) return null;

  const es = locale.startsWith("es");
  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  const handleDownload = () => {
    generateCertificatePdf(completion, es ? "es" : "en");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-cyan-400/40 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="size-5" />
        </button>

        {/* Certificate Card Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950 border border-cyan-400/40 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Sparkles className="size-3.5" /> NYRAVA GUARDIAN ACADEMY
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            {es ? "CERTIFICADO DE COMPETENCIA" : "CERTIFICATE OF COMPETENCY"}
          </h2>
          <p className="text-xs font-bold text-slate-400">
            {es ? "Este certificado reconoce que" : "This certificate recognizes that"}
          </p>
        </div>

        {/* Guardian Name & Course Details */}
        <div className="text-center space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-2xl font-black text-amber-400">
            {completion.guardian_name || "Guardian"}
          </h3>
          <p className="text-xs font-medium text-slate-300">
            {es
              ? "ha demostrado con éxito su competencia en:"
              : "has successfully demonstrated competency in:"}
          </p>
          <p className="text-base font-black text-white">{text(completion.course_title)}</p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 text-left">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Badge</span>
              <p className="text-xs font-extrabold text-cyan-300 flex items-center gap-1 truncate">
                <Trophy className="size-3.5 shrink-0 text-amber-400" /> {text(completion.badge_name)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Mastery</span>
              <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-400" /> {completion.mastery_score}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Date</span>
              <p className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1 truncate">
                <Calendar className="size-3.5 text-slate-400 shrink-0" />
                {new Date(completion.completed_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">ID</span>
              <p className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 truncate">
                <Hash className="size-3 text-amber-400 shrink-0" /> {completion.certificate_id}
              </p>
            </div>
          </div>
        </div>

        {/* Demonstrated Skills List */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
            {es ? "Habilidades Demostradas:" : "Demonstrated Skills:"}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold text-slate-300">
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
              <span className="text-emerald-400">✓</span> {es ? "Señales de alerta de phishing" : "Phishing warning signs"}
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
              <span className="text-emerald-400">✓</span> {es ? "Urgencia y presión artificial" : "Urgency & pressure tactics"}
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
              <span className="text-emerald-400">✓</span> {es ? "Premios no solicitados" : "Unexpected prize traps"}
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2">
              <span className="text-emerald-400">✓</span> {es ? "Protección de claves y códigos" : "Password & code protection"}
            </li>
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 bg-slate-900 text-slate-300 font-bold"
          >
            {es ? "Cerrar" : "Close"}
          </Button>

          <Button
            onClick={handleDownload}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg"
          >
            <Download className="size-4 mr-2" />
            {es ? "📥 Descargar Certificado PDF" : "📥 Download Certificate PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
