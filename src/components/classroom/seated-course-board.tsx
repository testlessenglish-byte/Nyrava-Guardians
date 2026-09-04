import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Play, X, Shield, Award, Sparkles, Download, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ClassroomRoom } from "@/components/meta/classroom-scene";
import { useGuardian } from "@/lib/guardian-context";
import {
  getAuthoritativeCourseCompletion,
  type GuardianCourseCompletion,
} from "@/lib/guardian-completions";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { CertificateModal } from "../progression/certificate-modal";

interface CourseInfo {
  id: string;
  title: { en: string; es: string };
  category: { en: string; es: string };
  summary: { en: string; es: string };
  skills: string[];
  xp: number;
  credits: number;
}

const ROOM_COURSES: Record<ClassroomRoom, CourseInfo> = {
  security: {
    id: "phishing-defense",
    title: {
      en: "Phishing Defense & Cyber Security",
      es: "Defensa contra Phishing y Ciberseguridad",
    },
    category: { en: "Security Foundations", es: "Fundamentos de Seguridad" },
    summary: {
      en: "Learn to identify suspicious email senders, verify domain URLs, detect social engineering traps, and report security incidents safely.",
      es: "Aprende a identificar remitentes sospechosos, verificar URLs de dominios, detectar trampas de ingeniería social y reportar incidentes de seguridad.",
    },
    skills: ["URL Inspection", "Sender Verification", "Incident Reporting", "Phishing Defense"],
    xp: 350,
    credits: 100,
  },
  builder: {
    id: "builder-lab",
    title: {
      en: "Robotics, Coding & AI Workflows",
      es: "Robótica, Código y Flujos de IA",
    },
    category: { en: "Engineering & Innovation", es: "Ingeniería e Innovación" },
    summary: {
      en: "Master logic structures, algorithm design, hardware safety, and responsible AI agent configuration.",
      es: "Domina estructuras lógicas, diseño de algoritmos, seguridad de hardware y configuración responsable de agentes de IA.",
    },
    skills: ["Algorithm Logic", "Hardware Safety", "AI Configuration", "Clean Code"],
    xp: 400,
    credits: 120,
  },
  communication: {
    id: "communication-studio",
    title: {
      en: "Digital Civility & Media Studio",
      es: "Civismo Digital y Estudio de Medios",
    },
    category: { en: "Communication & Ethics", es: "Comunicación y Ética" },
    summary: {
      en: "Practice constructive online discourse, evaluate digital footprints, and prevent cyberbullying.",
      es: "Practica el discurso constructivo en línea, evalúa huellas digitales y previene el ciberacoso.",
    },
    skills: ["Digital Civility", "Media Literacy", "Privacy Control", "Positive Discourse"],
    xp: 300,
    credits: 90,
  },
  truth: {
    id: "truth-lab",
    title: {
      en: "Fact Verification & Deepfake Analysis",
      es: "Verificación de Hechos y Análisis de Deepfakes",
    },
    category: { en: "Truth & Information Lab", es: "Laboratorio de Verdad e Información" },
    summary: {
      en: "Analyze synthetic media, cross-examine source credentials, and identify manipulated digital evidence.",
      es: "Analiza medios sintéticos, examina credenciales de fuentes e identifica evidencia digital manipulada.",
    },
    skills: ["Media Authentication", "Source Verification", "Deepfake Detection", "Fact Checking"],
    xp: 450,
    credits: 150,
  },
};

const NEXT_COURSE_MAP: Record<string, { id: string; title: { en: string; es: string } }> = {
  "phishing-defense": {
    id: "password-safety",
    title: { en: "Password Protection", es: "Protección de Contraseñas" },
  },
  "password-safety": {
    id: "personal-information",
    title: { en: "Personal Information Safety", es: "Seguridad de Información Personal" },
  },
  "personal-information": {
    id: "builder-lab",
    title: { en: "Robotics & AI Workflows", es: "Robótica y Flujos de IA" },
  },
  "builder-lab": {
    id: "communication-studio",
    title: { en: "Digital Civility & Media", es: "Civismo Digital y Medios" },
  },
  "communication-studio": {
    id: "truth-lab",
    title: { en: "Fact Verification & Deepfakes", es: "Verificación de Hechos y Deepfakes" },
  },
};

export function SeatedCourseBoard({
  room = "security",
  locale = "en-US",
  onStartTest,
  onStandUp,
}: {
  room?: ClassroomRoom;
  locale?: string;
  onStartTest: (targetMissionId?: string) => void;
  onStandUp: () => void;
}) {
  const es = locale.startsWith("es");
  const { guardianId } = useGuardian();
  const course = ROOM_COURSES[room] ?? ROOM_COURSES.security;

  const [completion, setCompletion] = useState<GuardianCourseCompletion | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAuthoritativeCourseCompletion(guardianId || "guest_guardian", course.id).then((rec) => {
      if (!cancelled) setCompletion(rec);
    });
    return () => {
      cancelled = true;
    };
  }, [guardianId, course.id]);

  const isCompleted = completion?.status === "COMPLETED";
  const nextCourse = NEXT_COURSE_MAP[course.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-cyan-500/40 bg-slate-900/95 p-6 md:p-8 shadow-2xl text-slate-100 space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                  {es ? course.category.es : course.category.en}
                </span>
                {isCompleted && (
                  <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/40 uppercase">
                    🟢 {es ? "DOMINADO" : "MASTERED"} ({completion.mastery_score}%)
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white">
                {es ? course.title.es : course.title.en}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStandUp}
            className="text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Mastered Certificate Callout */}
        {isCompleted && completion && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-emerald-200 flex items-center gap-1.5">
                <Award className="size-4 text-emerald-400" />
                {es ? "🏆 Certificado de Competencia Disponible" : "🏆 Certificate of Competency Available"}
              </p>
              <p className="text-[10px] font-mono text-emerald-300/80">
                ID: {completion.certificate_id} · Badge: {completion.badge_id.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCertModal(true)}
                className="border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs"
              >
                <Eye className="size-3.5 mr-1" />
                {es ? "Ver" : "View"}
              </Button>
              <Button
                size="sm"
                onClick={() => generateCertificatePdf(completion, es ? "es" : "en")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                <Download className="size-3.5 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        )}

        {/* Overview Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <BookOpen className="size-4" />
            <span>{es ? "Resumen de la Lección" : "Lesson Overview"}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {es ? course.summary.es : course.summary.en}
          </p>
        </div>

        {/* Tested Skills */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {es ? "Habilidades Evaluadas" : "Evaluated Skills"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {course.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-bold text-cyan-300"
              >
                <Shield className="size-3 text-cyan-400" /> {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Rewards Row */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs font-black">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="size-4" />
            <span>+{course.xp} XP</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Award className="size-4" />
            <span>+{course.credits} Credits</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onStandUp}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white font-bold"
          >
            {es ? "Levantarse" : "Stand Up"}
          </Button>

          {isCompleted && nextCourse ? (
            <Button
              onClick={() => onStartTest(nextCourse.id)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg"
            >
              {es ? `Siguiente Misión: ${nextCourse.title.es}` : `Next Mission: ${nextCourse.title.en}`}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => onStartTest(course.id)}
              className={
                isCompleted
                  ? "bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
              }
            >
              <Play className="size-4 mr-1 fill-current" />
              {isCompleted
                ? es ? "Repasar Curso" : "Review Course"
                : es ? "Iniciar Curso (6 Etapas)" : "Start Course (6 Stages)"}
            </Button>
          )}
        </div>

        {/* Modal View */}
        {completion && (
          <CertificateModal
            completion={completion}
            locale={locale}
            open={showCertModal}
            onClose={() => setShowCertModal(false)}
          />
        )}
      </div>
    </div>
  );
}
