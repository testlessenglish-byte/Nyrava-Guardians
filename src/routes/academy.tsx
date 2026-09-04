import { createFileRoute } from "@tanstack/react-router";
import { AcademyCourseDashboard } from "@/components/academy/academy-course-dashboard";
import { CertificateGallery } from "@/components/academy/certificate-gallery";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Nyrava Academy — Classes, Tests & Certificates" },
      {
        name: "description",
        content:
          "Complete Nyrava Guardians digital-safety classes, pass scored assessments, and earn educational certificates.",
      },
      { property: "og:title", content: "Nyrava Academy — Classes, Tests & Certificates" },
      {
        property: "og:description",
        content: "Game-based classes with real assessments and earned Guardian progress.",
      },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
  return (
    <>
      <AcademyCourseDashboard />
      <CertificateGallery />
    </>
  );
}
