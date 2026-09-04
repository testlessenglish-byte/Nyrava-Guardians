import { createFileRoute, Navigate } from "@tanstack/react-router";
import { IslaBrandOverlays } from "@/components/isla/isla-brand-overlays";

export const Route = createFileRoute("/isla")({
  ssr: false,
  component: () => (
    <>
      <IslaBrandOverlays />
      <Navigate to="/world/isla-central" replace />
    </>
  ),
});
