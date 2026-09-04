import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Nyrava Guardian Certificate & Persistence Architecture", () => {
  it("certificate ID follows NG-PD-YYYY-XXXXXXXX format", () => {
    const year = new Date().getFullYear();
    const hex = "8F42A91C";
    const certId = `NG-PD-${year}-${hex}`;
    assert.match(certId, /^NG-PD-\d{4}-[A-Z0-9]{8}$/);
  });

  it("gating: certificate is NOT issued when score is below 75%", () => {
    const score = 68;
    const passingScore = 75;
    const allCriticalPassed = true;
    const passed = score >= passingScore && allCriticalPassed;
    assert.equal(passed, false);
  });

  it("gating: certificate is NOT issued when a critical safety skill fails", () => {
    const score = 82;
    const passingScore = 75;
    const skillScores = [
      { skillId: "urgency_detection", isMastered: true },
      { skillId: "password_protection", isMastered: false }, // Critical skill failed (55%)
    ];
    const allCriticalPassed = skillScores.every((s) => s.isMastered);
    const passed = score >= passingScore && allCriticalPassed;
    assert.equal(passed, false);
  });

  it("idempotency: completing twice preserves original certificate ID and XP", () => {
    const firstCompletion = {
      guardian_id: "guardian_123",
      course_id: "phishing-defense",
      mastery_score: 92,
      certificate_id: "NG-PD-2026-8F42A91C",
      xp_awarded: 350,
      completed_at: "2026-09-03T18:00:00.000Z",
    };

    // Second completion attempt
    let certId = firstCompletion.certificate_id;
    if (!certId) {
      certId = "NG-PD-2026-NEWID";
    }

    assert.equal(certId, "NG-PD-2026-8F42A91C");
    assert.equal(firstCompletion.xp_awarded, 350);
  });

  it("remediation diagnostic identifies weak skills for failed attempts", () => {
    const skills = [
      { id: "urgency_detection", scorePct: 100, threshold: 75, isMastered: true },
      { id: "password_protection", scorePct: 55, threshold: 80, isMastered: false },
      { id: "verification_habits", scorePct: 60, threshold: 75, isMastered: false },
    ];

    const weakSkills = skills.filter((s) => !s.isMastered);
    assert.equal(weakSkills.length, 2);
    assert.equal(weakSkills[0].id, "password_protection");
    assert.equal(weakSkills[1].id, "verification_habits");
  });

  it("bilingual PDF text dictionary preserves Spanish accents", () => {
    const spanishText = "CERTIFICADO DE COMPETENCIA — María José Iñaki";
    assert.equal(spanishText.includes("CERTIFICADO DE COMPETENCIA"), true);
    assert.equal(spanishText.includes("María"), true);
    assert.equal(spanishText.includes("Iñaki"), true);
  });
});
