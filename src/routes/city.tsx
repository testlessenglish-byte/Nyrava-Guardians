import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/city")({
  ssr: false,
  component: () => <Navigate to="/world/central-city" replace />,
});
