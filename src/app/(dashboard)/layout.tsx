import { AuthProvider } from "@/contexts/AuthContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { DashboardShell } from "@/components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CreditsProvider>
        <DashboardShell>{children}</DashboardShell>
      </CreditsProvider>
    </AuthProvider>
  );
}
