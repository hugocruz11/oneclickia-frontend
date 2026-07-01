export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-oki-trim.png"
          alt="OneClickIA"
          className="mx-auto h-12 w-auto"
        />
        <p className="mt-2 text-sm text-muted">
          Campañas de ads en minutos
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
