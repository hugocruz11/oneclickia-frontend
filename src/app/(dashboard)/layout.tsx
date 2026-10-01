import { AuthProvider } from "@/contexts/AuthContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { OrgProvider } from "@/contexts/OrgContext";
import { DashboardShell } from "@/components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CreditsProvider>
        <OrgProvider>
          <DashboardShell>{children}</DashboardShell>
        </OrgProvider>
      </CreditsProvider>
    </AuthProvider>
  );
}
