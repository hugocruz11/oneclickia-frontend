import { AuthProvider } from "@/contexts/AuthContext";
import { getT } from "@/i18n/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getT();

  return (
    <AuthProvider>
      <div className="relative flex min-h-full flex-col items-center px-4 py-12">
        <div className="absolute right-4 top-4">
          <LocaleSwitcher />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">OneClickIA</h1>
          <p className="mt-1 text-sm text-muted">
            {t("Configura tu marca para empezar")}
          </p>
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </AuthProvider>
  );
}
