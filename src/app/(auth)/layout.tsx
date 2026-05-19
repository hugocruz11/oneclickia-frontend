export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-ink">OneClickIA</h1>
        <p className="mt-1 text-sm text-muted">
          Campañas de ads en minutos
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
