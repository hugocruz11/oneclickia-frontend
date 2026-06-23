/**
 * Catálogo de templates de estáticos que el usuario puede elegir como imagen
 * de referencia al crear una campaña personalizada.
 *
 * Los `id` deben coincidir EXACTO con los del backend (`src/ads/static-templates.ts`),
 * porque se envían como `templateId` y mapean a `/assets/templates/{id}.jpg`.
 */
export interface StaticTemplate {
  id: string;
  name: string;
  /** Una línea genérica describiendo qué carga el peso del formato. */
  description: string;
}

export const STATIC_TEMPLATES: StaticTemplate[] = [
  {
    id: "problema-solucion",
    name: "Problema / Solución",
    description: "Split dolor → alivio: el problema a un lado, el producto como solución al otro.",
  },
  {
    id: "ugc-native",
    name: "UGC-Native",
    description: "Estética orgánica de contenido real, como el post de una amiga en el feed.",
  },
  {
    id: "us-vs-them",
    name: "Us vs. Them",
    description: "Comparación: la opción genérica vs. la tuya en lo que al cliente le importa.",
  },
  {
    id: "data-callout",
    name: "Data Callout",
    description: "Producto al centro con sus ingredientes o componentes etiquetados alrededor.",
  },
  {
    id: "reasons-why",
    name: "Reasons Why",
    description: "3 beneficios clave como checklist o callouts alrededor del producto.",
  },
  {
    id: "prueba-social",
    name: "Prueba Social",
    description: "Reseñas, estrellas, testimonios y badges: la voz del cliente carga el peso.",
  },
  {
    id: "grid-bundle",
    name: "Grid / Bundle",
    description: "“Esto es lo que recibes”: varios productos juntos como paquete de valor.",
  },
  {
    id: "oferta-promo",
    name: "Oferta / Promo",
    description: "El precio es el protagonista: precio tachado, oferta, urgencia y CTA.",
  },
];

/** Ruta servida estáticamente de la imagen de ejemplo del template. */
export const templateImageUrl = (id: string) => `/assets/templates/${id}.jpg`;
