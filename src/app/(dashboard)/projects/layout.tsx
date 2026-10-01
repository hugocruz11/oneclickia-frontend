import { OrgGate } from "@/components/projects/OrgGate";

// Módulo de proyectos: requiere una organización activa.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrgGate>{children}</OrgGate>;
}
