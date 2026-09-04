import { supabase } from "@/integrations/supabase/client";

export interface SkillScoreDetail {
  skillId: string;
  name: { en: string; es: string };
  scorePct: number;
  threshold: number;
  isMastered: boolean;
}

export interface GuardianCourseCompletion {
  id: string;
  guardian_id: string;
  guardian_name: string;
  course_id: string;
  course_title: { en: string; es: string };
  subject: { en: string; es: string };
  status: "COMPLETED" | "NEEDS_REMEDIATION";
  started_at: string;
  completed_at: string;
  mastery_score: number;
  critical_skills_passed: boolean;
  xp_awarded: number;
  credit_awarded: number;
  badge_id: string;
  badge_name: { en: string; es: string };
  certificate_id: string; // e.g. NG-PD-2026-8F42A91C
  certificate_generated_at: string;
  certificate_language: "en" | "es";
  skill_breakdown: SkillScoreDetail[];
  strengths: { en: string; es: string };
  recommended_practice: { en: string; es: string };
  remediation_attempts: number;
}

const LOCAL_STORAGE_KEY = "nyrava_guardian_course_completions";

function getLocalCompletions(): Record<string, GuardianCourseCompletion> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCompletion(completion: GuardianCourseCompletion) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalCompletions();
    const key = `${completion.guardian_id}:${completion.course_id}`;
    current[key] = completion;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Failed to save local completion cache:", e);
  }
}

/** Generates a unique, non-sensitive Certificate ID: e.g. NG-PD-2026-8F42A91C */
export function generateCertificateId(courseId: string): string {
  const prefix = courseId === "phishing-defense" ? "NG-PD" : "NG-CS";
  const year = new Date().getFullYear();
  const hex = Math.random().toString(36).substring(2, 10).toUpperCase().padEnd(8, "A");
  return `${prefix}-${year}-${hex}`;
}

/** Synchronously read completion from local cache (fast UI render) */
export function getLocalCourseCompletion(
  guardianId: string,
  courseId: string
): GuardianCourseCompletion | null {
  const current = getLocalCompletions();
  const key = `${guardianId}:${courseId}`;
  return current[key] ?? null;
}

/** Fetch authoritative completion from Supabase (or fallback to local cache) */
export async function getAuthoritativeCourseCompletion(
  guardianId: string,
  courseId: string
): Promise<GuardianCourseCompletion | null> {
  // Check local cache first for instant UX
  const cached = getLocalCourseCompletion(guardianId, courseId);

  try {
    const { data, error } = await supabase
      .from("mission_attempts")
      .select("*")
      .eq("user_id", guardianId)
      .eq("mission_id", courseId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return cached;
    }

    const latest = data[0];
    if (latest && latest.learning_evidence) {
      const record = latest.learning_evidence as unknown as GuardianCourseCompletion;
      if (record && record.certificate_id) {
        setLocalCompletion(record);
        return record;
      }
    }
  } catch (err) {
    console.warn("Supabase completion query error, using local cache:", err);
  }

  return cached;
}

/** Save course completion authoritatively to Supabase & local cache. IDEMPOTENT. */
export async function saveAuthoritativeCourseCompletion(
  input: Omit<GuardianCourseCompletion, "id" | "certificate_id" | "certificate_generated_at"> & {
    existingCertificateId?: string;
  }
): Promise<GuardianCourseCompletion> {
  const key = `${input.guardian_id}:${input.course_id}`;
  const existing = getLocalCourseCompletion(input.guardian_id, input.course_id);

  // IDEMPOTENCY CHECK: If already completed with an existing certificate ID, preserve it and return
  let certId = input.existingCertificateId || existing?.certificate_id;
  if (!certId && input.status === "COMPLETED") {
    certId = generateCertificateId(input.course_id);
  } else if (!certId) {
    certId = "PENDING_MASTERY";
  }

  const completionRecord: GuardianCourseCompletion = {
    ...input,
    id: existing?.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    certificate_id: certId,
    certificate_generated_at: existing?.certificate_generated_at || new Date().toISOString(),
  };

  // Update local cache immediately
  setLocalCompletion(completionRecord);

  // Persist to Supabase authoritatively
  try {
    await supabase.from("mission_attempts").insert({
      user_id: input.guardian_id,
      mission_id: input.course_id,
      outcome: `${input.mastery_score}%`,
      created_at: new Date().toISOString(),
      learning_evidence: completionRecord as unknown as Record<string, unknown>,
    } as any);

    // Also sync to guardian_state if completed
    if (input.status === "COMPLETED") {
      const { data: stateData } = await supabase
        .from("guardian_state")
        .select("completed_missions, xp")
        .eq("user_id", input.guardian_id)
        .maybeSingle();

      const completedMissions: string[] = stateData?.completed_missions ?? [];
      const currentXp: number = stateData?.xp ?? 0;

      // Only add XP once if not already present
      const isFirstTime = !completedMissions.includes(input.course_id);
      const newMissions = isFirstTime ? [...completedMissions, input.course_id] : completedMissions;
      const newXp = isFirstTime ? currentXp + input.xp_awarded : currentXp;

      await supabase.from("guardian_state").upsert({
        user_id: input.guardian_id,
        completed_missions: newMissions,
        xp: newXp,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Supabase completion sync warning (using local fallback):", err);
  }

  return completionRecord;
}
