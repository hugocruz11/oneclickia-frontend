// Iconos de marca (logos de terceros) con sus colores oficiales. Van aparte
// del set monocromo de Icon.tsx porque las marcas tienen color fijo y no
// deben heredar currentColor ni el grosor de trazo del resto.

export type BrandName = "shopify" | "meta";

interface BrandIconProps {
  name: BrandName;
  size?: number;
  className?: string;
}

export function BrandIcon({ name, size = 18, className = "" }: BrandIconProps) {
  if (name === "shopify") {
    // Bolsa de Shopify en verde de marca con la "S" blanca.
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <path
          fill="#95BF47"
          d="M6.4 6.1a.9.9 0 0 1 .9-.8H9V5c0-1.7 1.3-3.1 3-3.1s3 1.4 3 3.1v.3h1.7c.46 0 .85.34.9.8L19.9 20a.9.9 0 0 1-.9 1H5a.9.9 0 0 1-.9-1zM10.6 5.3h2.8V5c0-.95-.63-1.7-1.4-1.7s-1.4.75-1.4 1.7z"
        />
        <text
          x="12"
          y="16.2"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill="#ffffff"
        >
          S
        </text>
      </svg>
    );
  }

  // Meta: lazo de infinito en azul de marca.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0081FB"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12c0-2.5 1.55-4.4 3.7-4.4 2.7 0 4.1 2.9 5.3 4.4 1.2 1.5 2.6 4.4 5.3 4.4 2.15 0 3.7-1.9 3.7-4.4s-1.55-4.4-3.7-4.4c-2.7 0-4.1 2.9-5.3 4.4-1.2 1.5-2.6 4.4-5.3 4.4C4.55 16.4 3 14.5 3 12z" />
    </svg>
  );
}
