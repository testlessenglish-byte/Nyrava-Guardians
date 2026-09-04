import jsPDF from "jspdf";
import { type GuardianCourseCompletion } from "./guardian-completions";

/**
 * Generates an official, high-quality Nyrava Guardian Certificate PDF.
 * Uses A4 Landscape layout, dark navy branding, gold & cyan borders, UTF-8 Spanish accent support,
 * and outputs a real downloadable .pdf file.
 */
export function generateCertificatePdf(
  completion: GuardianCourseCompletion,
  locale: "en" | "es" = "en"
) {
  const isEs = locale === "es" || completion.certificate_language === "es";

  // Create A4 Landscape PDF (297mm width x 210mm height)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = 297;
  const height = 210;

  // 1. Dark Background Fill (#07111F)
  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, width, height, "F");

  // 2. Decorative Double Border (Outer Cyan, Inner Gold)
  doc.setLineWidth(1.5);
  doc.setDrawColor(34, 211, 238); // Cyan-400
  doc.rect(10, 10, width - 20, height - 20, "S");

  doc.setLineWidth(0.8);
  doc.setDrawColor(251, 191, 36); // Amber-400
  doc.rect(14, 14, width - 28, height - 28, "S");

  // Corner Accents
  doc.setFillColor(251, 191, 36);
  doc.circle(14, 14, 2.5, "F");
  doc.circle(width - 14, 14, 2.5, "F");
  doc.circle(14, height - 14, 2.5, "F");
  doc.circle(width - 14, height - 14, 2.5, "F");

  // 3. Header Branding
  doc.setTextColor(34, 211, 238); // Cyan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NYRAVA GUARDIAN ACADEMY", width / 2, 28, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  const titleText = isEs ? "CERTIFICADO DE COMPETENCIA" : "CERTIFICATE OF COMPETENCY";
  doc.text(titleText, width / 2, 40, { align: "center" });

  // Divider Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(251, 191, 36);
  doc.line(70, 44, width - 70, 44);

  // 4. Recipient Name
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // Slate-400
  const subText = isEs ? "Este certificado reconoce que" : "This certificate recognizes that";
  doc.text(subText, width / 2, 54, { align: "center" });

  doc.setFontSize(22);
  doc.setTextColor(251, 191, 36); // Amber Gold
  doc.setFont("helvetica", "bold");
  const guardianName = completion.guardian_name || "Guardian";
  doc.text(guardianName, width / 2, 66, { align: "center" });

  // 5. Course Title & Achievement Statement
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  const statement = isEs
    ? "ha demostrado con éxito su competencia en la evaluación de ciberseguridad:"
    : "has successfully demonstrated competency in the cyber safety assessment:";
  doc.text(statement, width / 2, 76, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  const courseTitle = isEs ? completion.course_title.es : completion.course_title.en;
  doc.text(courseTitle, width / 2, 86, { align: "center" });

  // 6. Metrics Box (Badge, Score, Date, Cert ID)
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.roundedRect(30, 94, width - 60, 26, 4, 4, "F");
  doc.setDrawColor(51, 65, 85);
  doc.roundedRect(30, 94, width - 60, 26, 4, 4, "S");

  doc.setFontSize(10);
  doc.setTextColor(34, 211, 238);
  doc.setFont("helvetica", "bold");

  const badgeText = isEs
    ? `Insignia: ${completion.badge_name.es}`
    : `Badge: ${completion.badge_name.en}`;
  const scoreText = isEs
    ? `Dominio: ${completion.mastery_score}%`
    : `Mastery Score: ${completion.mastery_score}%`;
  const dateObj = new Date(completion.completed_at || Date.now());
  const dateStr = dateObj.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateLabel = isEs ? `Fecha: ${dateStr}` : `Date: ${dateStr}`;
  const idLabel = `ID: ${completion.certificate_id}`;

  doc.text(badgeText, 40, 106, { align: "left" });
  doc.text(scoreText, 110, 106, { align: "left" });
  doc.text(dateLabel, 175, 106, { align: "left" });
  doc.text(idLabel, 40, 114, { align: "left" });

  // 7. Demonstrated Skills Section
  doc.setFontSize(11);
  doc.setTextColor(251, 191, 36);
  doc.setFont("helvetica", "bold");
  const skillsHeader = isEs ? "Habilidades Demostradas:" : "Demonstrated Competencies:";
  doc.text(skillsHeader, 30, 130, { align: "left" });

  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.setFont("helvetica", "normal");

  const defaultSkillsEn = [
    "• Recognizing phishing warning signs & fake countdown timers",
    "• Detecting artificial urgency and pressure tactics",
    "• Identifying unsolicited rewards & giveaway scams",
    "• Protecting secret passwords and 2FA verification codes strictly private",
    "• Applying the Guardian Safety Rule: STOP → THINK → CHECK",
  ];
  const defaultSkillsEs = [
    "• Reconocer señales de advertencia de phishing y temporizadores falsos",
    "• Detectar tácticas de presión y urgencia artificial",
    "• Identificar estafas de premios y recompensas no solicitadas",
    "• Proteger contraseñas y códigos 2FA de verificación en privado",
    "• Aplicar la Regla Guardian: ALTO → PIENSA → VERIFICA",
  ];

  const skillLines = isEs ? defaultSkillsEs : defaultSkillsEn;
  let yPos = 138;
  skillLines.forEach((line) => {
    doc.text(line, 35, yPos);
    yPos += 6;
  });

  // 8. Footer & Verification Statement
  doc.setLineWidth(0.3);
  doc.setDrawColor(51, 65, 85);
  doc.line(30, 175, width - 30, 175);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const footerStatement = isEs
    ? "Este certificado reconoce el aprendizaje verificado y la finalización exitosa de la evaluación de competencia Nyrava Guardian."
    : "This certificate recognizes demonstrated learning and successful completion of the Nyrava Guardian competency assessment.";
  doc.text(footerStatement, width / 2, 182, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(34, 211, 238);
  doc.setFont("helvetica", "bold");
  doc.text("Nyrava Guardian — Digital Safety & Learning Systems", width / 2, 190, {
    align: "center",
  });

  // Save PDF file
  const fileName = `Nyrava_Guardian_Certificate_${completion.course_id}_${completion.certificate_id}.pdf`;
  doc.save(fileName);
}
