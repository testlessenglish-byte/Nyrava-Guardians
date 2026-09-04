import { Award, Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FOUNDATION_CERTIFICATE } from "@/domain/progression/catalog";
import type { Certificate, PlayerProgress } from "@/domain/progression/types";
import { getProgression } from "@/lib/progression.functions";
import { useGuardian } from "@/lib/guardian-context";

export function CertificateGallery() {
  const { locale, guardianName } = useGuardian();
  const es = locale.startsWith("es");
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProgression()
      .then((value) => {
        if (!cancelled) setProgress(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const certificate =
    progress?.certificates.find((item) => item.course === FOUNDATION_CERTIFICATE.id) ?? null;
  if (!certificate) return null;

  return (
    <>
      <section className="mt-7 overflow-hidden rounded-3xl border border-amber-300/25 bg-gradient-to-br from-amber-950/20 via-[#0b1628] to-violet-950/20 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/10">
            <Award className="h-8 w-8 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
              {es ? "Certificado obtenido" : "Certificate earned"}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {es ? FOUNDATION_CERTIFICATE.name.es : FOUNDATION_CERTIFICATE.name.en}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              ID {certificate.verificationId} · {es ? "Currículo" : "Curriculum"}{" "}
              {certificate.curriculumVersion}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(252,211,77,.2)]"
          >
            {es ? "VER CERTIFICADO" : "VIEW CERTIFICATE"}
          </button>
        </div>
      </section>
      {open && (
        <CertificateSheet
          certificate={certificate}
          learner={guardianName || (es ? "Guardián" : "Guardian")}
          es={es}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function CertificateSheet({
  certificate,
  learner,
  es,
  onClose,
}: {
  certificate: Certificate;
  learner: string;
  es: boolean;
  onClose: () => void;
}) {
  const date = new Intl.DateTimeFormat(es ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(certificate.completedAt));

  return (
    <div className="fixed inset-0 z-[400] overflow-y-auto bg-slate-950/95 p-3 backdrop-blur-md sm:p-6 print:static print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950"
          >
            <Printer className="h-4 w-4" />
            {es ? "IMPRIMIR / GUARDAR PDF" : "PRINT / SAVE PDF"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={es ? "Cerrar" : "Close"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="relative min-h-[620px] overflow-hidden border-[10px] border-[#d4af58] bg-[#f7f1e4] p-9 text-[#14213d] shadow-2xl sm:p-14 print:min-h-screen print:shadow-none">
          <div className="absolute inset-4 border-2 border-[#14213d]" />
          <div className="absolute inset-7 border border-[#d4af58]" />
          <div className="relative flex min-h-[520px] flex-col items-center justify-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#d4af58] bg-[#14213d] text-3xl font-black text-[#f4d77a]">
              N
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.45em] text-[#7a6228]">
              Nyrava Guardians Academy
            </p>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              {es ? "Certificado de Finalización" : "Certificate of Completion"}
            </h1>
            <p className="mt-5 text-base italic text-slate-600">
              {es ? "Otorgado a" : "Presented to"}
            </p>
            <p className="mt-2 border-b-2 border-[#d4af58] px-10 pb-2 text-3xl font-black sm:text-5xl">
              {learner}
            </p>
            <p className="mt-5 text-sm text-slate-600">
              {es ? "por completar y aprobar" : "for completing and passing"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0b6b78] sm:text-4xl">
              {es ? FOUNDATION_CERTIFICATE.name.es : FOUNDATION_CERTIFICATE.name.en}
            </h2>
            <p className="mt-3 font-semibold text-slate-600">
              {es ? "Phishing · Contraseñas · Privacidad" : "Phishing · Passwords · Privacy"}
            </p>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 text-xs text-slate-600 sm:grid-cols-3">
              <div>
                <b className="block text-[#14213d]">{date}</b>
                {es ? "Fecha" : "Date"}
              </div>
              <div>
                <b className="block text-[#14213d]">{certificate.curriculumVersion}</b>
                {es ? "Versión" : "Version"}
              </div>
              <div>
                <b className="block text-[#14213d]">{certificate.verificationId}</b>
                {es ? "ID del certificado" : "Certificate ID"}
              </div>
            </div>
            <p className="mt-7 max-w-3xl text-[10px] leading-4 text-slate-500">
              {es
                ? "Credencial educativa emitida por Nyrava Guardians para registrar finalización de su currículo interno."
                : "Educational credential issued by Nyrava Guardians to record completion of its internal curriculum."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
