type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "muted"
  | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-sand-light text-charcoal border-sand",
  success: "bg-green-50 text-success-text border-green-200",
  warning: "bg-amber-50 text-warning border-amber-200",
  error: "bg-red-50 text-error border-red-200",
  muted: "bg-sand-light text-muted border-sand",
  orange: "bg-orange/10 text-orange border-orange/20",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
