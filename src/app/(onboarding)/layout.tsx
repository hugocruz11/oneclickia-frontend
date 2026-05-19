import { AuthProvider } from "@/contexts/AuthContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-full flex-col items-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">OneClickIA</h1>
          <p className="mt-1 text-sm text-muted">
            Configura tu marca para empezar
          </p>
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </AuthProvider>
  );
}
