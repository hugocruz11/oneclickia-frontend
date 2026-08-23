// Diccionario español → inglés.
//
// La clave es el texto en español tal y como aparece en el código. Si una
// clave no existe aquí, la UI muestra el español (nunca una clave cruda),
// así que el archivo puede crecer de forma incremental sin romper nada.
//
// Los marcadores {entreLlaves} son variables: deben aparecer igual en la
// traducción (el orden puede cambiar, el nombre no).
//
// Convención: secciones ordenadas como el árbol de `src/`.

import type { Dictionary } from "../translate";

export const en: Dictionary = {
  // ─── Acciones y palabras sueltas ─────────────────────────────────────
  Guardar: "Save",
  "Guardar cambios": "Save changes",
  "Guardar y continuar →": "Save and continue →",
  Cancelar: "Cancel",
  Editar: "Edit",
  Eliminar: "Delete",
  Crear: "Create",
  Buscar: "Search",
  "Buscar…": "Search…",
  Copiar: "Copy",
  "✓ Copiado": "✓ Copied",
  Quitar: "Remove",
  Agregar: "Add",
  Seleccionar: "Select",
  Seleccionada: "Selected",
  "Seleccionado ✓": "Selected ✓",
  Completar: "Complete",
  Regenerar: "Regenerate",
  Generar: "Generate",
  Renombrar: "Rename",
  Publicar: "Publish",
  Despublicar: "Unpublish",
  Desconectar: "Disconnect",
  Conectado: "Connected",
  Desconectado: "Disconnected",
  Conectada: "Connected",
  Desconectada: "Disconnected",
  Anterior: "Previous",
  Siguiente: "Next",
  "← Anterior": "← Previous",
  "Siguiente →": "Next →",
  "← Atrás": "Back",
  "← Paso anterior": "← Previous step",
  Cerrar: "Close",
  "Cargando...": "Loading...",
  "Guardando...": "Saving...",
  "Guardando…": "Saving…",
  "Generando…": "Generating…",
  "Buscando...": "Searching...",
  "Subiendo...": "Uploading...",
  "Actualizando…": "Updating…",
  "Guardado ✓": "Saved ✓",
  "Guardada ✓": "Saved ✓",
  Guardado: "Saved",
  Listo: "Ready",
  Incompleto: "Incomplete",
  Total: "Total",
  total: "total",
  "/ día": "/ day",
  "{amount}/día": "{amount}/day",
  a: "to",
  opcional: "optional",
  Todos: "All",
  Todas: "All",
  Activas: "Active",
  Pausadas: "Paused",
  Restringido: "Restricted",
  Principal: "Main",
  Referencia: "Reference",
  Producto: "Product",
  Anuncio: "Ad",
  Anuncios: "Ads",
  Video: "Video",
  Videos: "Videos",
  Imágenes: "Images",
  Contenido: "Content",
  Configuración: "Settings",
  Conexión: "Connection",
  Conexiones: "Connections",
  Navegación: "Navigation",
  "Cambiar idioma": "Change language",
  "OneClickIA — inicio": "OneClickIA — home",
  "Abrir menú de navegación": "Open navigation menu",
  "Cerrar sesión": "Log out",
  "Modo oscuro": "Dark mode",
  "Modo claro": "Light mode",
  "Activar modo oscuro": "Switch to dark mode",
  "Activar modo claro": "Switch to light mode",
  créditos: "credits",
  "créditos/mes": "credits/month",
  "créditos disponibles": "credits available",
  "Plan {plan} — {count} créditos": "{plan} plan — {count} credits",

  // ─── Navegación (Sidebar) ────────────────────────────────────────────
  Descubrir: "Discover",
  Analizar: "Analyze",
  "Mi negocio": "My business",
  "Buscar Ads": "Search Ads",
  "Buscar Videos": "Search Videos",
  Favoritos: "Favorites",
  "Videos guardados": "Saved videos",
  Campañas: "Campaigns",
  "Landing pages": "Landing pages",
  Analytics: "Analytics",
  Públicos: "Audiences",
  "Mi Marca": "My Brand",
  "Mis Productos": "My Products",
  "Planes y créditos": "Plans and credits",
  "Costos IA": "AI costs",

  // ─── Formularios / campos comunes ────────────────────────────────────
  Nombre: "Name",
  "Nombre:": "Name:",
  "Nombre (opcional)": "Name (optional)",
  "Tu nombre": "Your name",
  Email: "Email",
  "Email *": "Email *",
  "Email:": "Email:",
  Contraseña: "Password",
  "Contraseña *": "Password *",
  "Confirmar contraseña *": "Confirm password *",
  "Mostrar contraseña": "Show password",
  "Ocultar contraseña": "Hide password",
  "Mínimo 8 caracteres": "At least 8 characters",
  "Mínimo 8 caracteres.": "At least 8 characters.",
  Descripción: "Description",
  "Descripción (opcional)": "Description (optional)",
  Título: "Title",
  Titular: "Headline",
  Headline: "Headline",
  CTA: "CTA",
  Texto: "Text",
  Fondo: "Background",
  "Sitio web": "Website",
  Instagram: "Instagram",
  Logo: "Logo",
  Tipografía: "Typeface",
  Cantidad: "Quantity",
  Formato: "Format",
  Orden: "Sort",
  "Ordenar por": "Sort by",
  Resultados: "Results",
  Desde: "From",
  Hasta: "To",
  Inicio: "Start",
  Fin: "End",
  "Fin (opcional)": "End (optional)",
  Fechas: "Dates",
  Duración: "Duration",
  Edad: "Age",
  Género: "Gender",
  Hombre: "Male",
  Mujer: "Female",
  Hombres: "Men",
  Mujeres: "Women",
  Países: "Countries",
  Ciudades: "Cities",
  Intereses: "Interests",
  "Idiomas:": "Languages:",
  Nichos: "Niches",
  Categorías: "Categories",

  // ─── Subida de archivos ──────────────────────────────────────────────
  "Arrastra un archivo o": "Drag a file or",
  "haz clic para subir": "click to upload",
  "PNG, JPG o WEBP (max 5MB)": "PNG, JPG or WEBP (max 5MB)",
  "PNG, JPG o WEBP (max 5MB).": "PNG, JPG or WEBP (max 5MB).",
  "Quitar imagen": "Remove image",
  "Máx. {max} · La primera es la principal.":
    "Max {max} · The first one is the main image.",
  "Imagen {n}": "Image {n}",
  "Ver {label} en grande": "View {label} larger",
  "Ampliar imagen": "Enlarge image",
  "Imagen generada": "Generated image",

  // ─── Paginación y listas ─────────────────────────────────────────────
  "{from}–{to} de {total}": "{from}–{to} of {total}",
  "Página {page} de {total}": "Page {page} of {total}",
  "Personalizado…": "Custom…",
  Hoy: "Today",
  Ayer: "Yesterday",
  "Últimos 7 días": "Last 7 days",
  "Últimos 14 días": "Last 14 days",
  "Últimos 30 días": "Last 30 days",
  "Este mes": "This month",
  "Mes pasado": "Last month",
  Máximo: "Maximum",

  // ─── Países ──────────────────────────────────────────────────────────
  Colombia: "Colombia",
  México: "Mexico",
  Argentina: "Argentina",
  Chile: "Chile",
  Perú: "Peru",
  Ecuador: "Ecuador",
  Venezuela: "Venezuela",
  Bolivia: "Bolivia",
  Paraguay: "Paraguay",
  Uruguay: "Uruguay",
  Guatemala: "Guatemala",
  "Costa Rica": "Costa Rica",
  Panamá: "Panama",
  "República Dominicana": "Dominican Republic",
  Honduras: "Honduras",
  "El Salvador": "El Salvador",
  Nicaragua: "Nicaragua",
  "Puerto Rico": "Puerto Rico",
  "Estados Unidos": "United States",
  España: "Spain",
  Brasil: "Brazil",
  Español: "Spanish",
  Inglés: "English",
  Portugués: "Portuguese",

  // ─── Selectores de segmentación ──────────────────────────────────────
  "Países objetivo": "Target countries",
  "Seleccionar países...": "Select countries...",
  "1 país seleccionado": "1 country selected",
  "{count} países seleccionados": "{count} countries selected",
  "Ciudades objetivo": "Target cities",
  "Buscar ciudades...": "Search cities...",
  "Si eliges ciudades, la campaña se segmentará solo a esas ciudades (en lugar del país). Escribe al menos 2 caracteres.":
    "If you pick cities, the campaign targets only those cities (instead of the whole country). Type at least 2 characters.",
  "Buscar intereses...": "Search interests...",
  "Escribe al menos 2 caracteres para buscar.":
    "Type at least 2 characters to search.",
  "Públicos personalizados": "Custom audiences",
  "Seleccionar públicos...": "Select audiences...",
  "1 público seleccionado": "1 audience selected",
  "{count} públicos seleccionados": "{count} audiences selected",
  "No hay públicos en esta cuenta": "No audiences in this account",
  "¿Necesitas crear uno?": "Need to create one?",
  "Ir a Públicos": "Go to Audiences",
  "No se pudieron cargar los públicos.": "Could not load the audiences.",

  // ─── Objetivos y metas de Meta ───────────────────────────────────────
  Reconocimiento: "Awareness",
  Tráfico: "Traffic",
  Interacción: "Engagement",
  "Clientes potenciales": "Leads",
  "Promoción de la app": "App promotion",
  Ventas: "Sales",
  "Visitas a la página de destino": "Landing page views",
  "Clics en el enlace": "Link clicks",
  Impresiones: "Impressions",
  "Alcance único diario": "Daily unique reach",
  Conversiones: "Conversions",
  "Valor de las conversiones": "Conversion value",
  "Interacciones con la publicación": "Post engagement",
  "Reproducciones de ThruPlay": "ThruPlay views",
  "Recuerdo del anuncio": "Ad recall lift",
  "Instalaciones de la app": "App installs",
  "Maximizar el número de visitas a la página de destino":
    "Maximize landing page views",
  "Maximizar el número de clics en el enlace": "Maximize link clicks",
  "Maximizar el número de impresiones": "Maximize impressions",
  "Maximizar el alcance único diario": "Maximize daily unique reach",
  "Maximizar el número de conversiones": "Maximize conversions",
  "Maximizar el valor de las conversiones": "Maximize conversion value",
  "Maximizar el número de interacciones con la publicación":
    "Maximize post engagement",
  "Maximizar las reproducciones de ThruPlay": "Maximize ThruPlay views",
  "Maximizar el recuerdo del anuncio": "Maximize ad recall lift",
  "Maximizar el número de instalaciones de la app": "Maximize app installs",
  "{goal} (recomendado)": "{goal} (recommended)",

  // ─── CTAs de Meta ────────────────────────────────────────────────────
  "Más información": "Learn more",
  "Comprar ahora": "Shop now",
  Comprar: "Buy",
  Registrarse: "Sign up",
  Suscribirse: "Subscribe",
  Descargar: "Download",
  "Pedir ahora": "Order now",
  "Reservar ahora": "Book now",
  Reservar: "Book",
  Contactar: "Contact us",
  Contáctanos: "Contact us",
  "Obtener oferta": "Get offer",
  "Obtener cotización": "Get quote",
  "Aplicar ahora": "Apply now",
  "Enviar mensaje": "Send message",
  "Ver más": "See more",
  "Ver menú": "See menu",

  // ─── Estados de campaña ──────────────────────────────────────────────
  Borrador: "Draft",
  "Publicando...": "Publishing...",
  Pausada: "Paused",
  Activa: "Active",
  Error: "Error",
  Archivada: "Archived",
  Eliminada: "Deleted",
  "En proceso": "In process",
  "Con problemas": "With issues",
  "Campaña pausada": "Campaign paused",
  "Grupo pausado": "Ad set paused",
  "En revisión": "In review",
  "Falta facturación": "Billing info missing",
  Preaprobado: "Pre-approved",
  Rechazado: "Rejected",
  Publicada: "Published",

  // ─── Formatos de anuncio ─────────────────────────────────────────────
  "Feed (1:1)": "Feed (1:1)",
  "Vertical (4:5)": "Vertical (4:5)",
  "Story (9:16)": "Story (9:16)",
  "Todos los formatos": "All formats",
  "Facebook Feed": "Facebook Feed",
  "Facebook Móvil": "Facebook Mobile",
  "Instagram Feed": "Instagram Feed",
  "Instagram Story": "Instagram Story",
  Patrocinado: "Sponsored",

  // ─── Templates de estáticos ──────────────────────────────────────────
  "Problema / Solución": "Problem / Solution",
  "Split dolor → alivio: el problema a un lado, el producto como solución al otro.":
    "Pain → relief split: the problem on one side, your product as the fix on the other.",
  "UGC-Native": "UGC-Native",
  "Estética orgánica de contenido real, como el post de una amiga en el feed.":
    "Organic, real-content look — like a friend's post in the feed.",
  "Us vs. Them": "Us vs. Them",
  "Comparación: la opción genérica vs. la tuya en lo que al cliente le importa.":
    "Comparison: the generic option vs. yours on what the customer cares about.",
  "Data Callout": "Data Callout",
  "Producto al centro con sus ingredientes o componentes etiquetados alrededor.":
    "Product front and center with its ingredients or components labeled around it.",
  "Reasons Why": "Reasons Why",
  "3 beneficios clave como checklist o callouts alrededor del producto.":
    "3 key benefits as a checklist or callouts around the product.",
  "Prueba Social": "Social Proof",
  "Reseñas, estrellas, testimonios y badges: la voz del cliente carga el peso.":
    "Reviews, stars, testimonials and badges — the customer's voice does the work.",
  "Grid / Bundle": "Grid / Bundle",
  "“Esto es lo que recibes”: varios productos juntos como paquete de valor.":
    "“Here's what you get”: several products together as a value bundle.",
  "Oferta / Promo": "Offer / Promo",
  "Oferta y urgencia como protagonistas. El precio solo aparece si lo escribiste tú.":
    "Offer and urgency take the lead. The price only shows if you typed it in.",

  // ─── Errores y avisos ────────────────────────────────────────────────
  "Error en la solicitud": "Request failed",
  "Ocurrió un error. Intenta de nuevo.":
    "Something went wrong. Please try again.",
  "Respuesta inesperada del servidor.": "Unexpected response from the server.",
  "Error al cargar.": "Failed to load.",
  "Error al cargar el estado.": "Failed to load the status.",
  "Error al cargar el estado de Meta.": "Failed to load the Meta status.",
  "Error al cargar campañas.": "Failed to load campaigns.",
  "Error al cargar la campaña.": "Failed to load the campaign.",
  "Error al cargar el video.": "Failed to load the video.",
  "Error al cargar el copy guardado.": "Failed to load the saved copy.",
  "Error al crear la campaña.": "Failed to create the campaign.",
  "Error al eliminar la campaña.": "Failed to delete the campaign.",
  "Error al publicar la campaña.": "Failed to publish the campaign.",
  "Error al activar la campaña.": "Failed to activate the campaign.",
  "Error al pausar la campaña.": "Failed to pause the campaign.",
  "Error al guardar los cambios.": "Failed to save your changes.",
  "Error al buscar ads.": "Failed to search ads.",
  "Error al buscar videos.": "Failed to search videos.",
  "Error al analizar el video.": "Failed to analyze the video.",
  "Error al regenerar el análisis.": "Failed to regenerate the analysis.",
  "Error al adaptar el copy.": "Failed to adapt the copy.",
  "Error al generar el copy.": "Failed to generate the copy.",
  "Error al generar el texto de la publicación.":
    "Failed to generate the post text.",
  "Error al generar imágenes.": "Failed to generate images.",
  "Error al generar variantes.": "Failed to generate variants.",
  "Error al editar la imagen.": "Failed to edit the image.",
  "Error al refrescar el creativo.": "Failed to refresh the creative.",
  "Error al iniciar la conexión.": "Failed to start the connection.",
  "Error al iniciar la conexión con Meta.":
    "Failed to start the Meta connection.",
  "Error al desconectar.": "Failed to disconnect.",
  "Error al desconectar Meta.": "Failed to disconnect Meta.",
  "Error de conexión": "Connection error",
  "No se pudo crear.": "Could not create it.",
  "No se pudo guardar.": "Could not save.",
  "No se pudo guardar este paso.": "Could not save this step.",
  "No se pudo guardar el paso 1.": "Could not save step 1.",
  "No se pudo guardar la edición.": "Could not save the edit.",
  "No se pudo guardar el copy.": "Could not save the copy.",
  "No se pudo eliminar.": "Could not delete it.",
  "No se pudo renombrar.": "Could not rename it.",
  "No se pudo generar.": "Could not generate it.",
  "No se pudo cancelar.": "Could not cancel.",
  "No se pudo abrir el pago.": "Could not open the checkout.",
  "No se pudo iniciar la suscripción.": "Could not start the subscription.",
  "No se pudo subir el archivo.": "Could not upload the file.",
  "No se pudo cambiar el estado.": "Could not change the status.",
  "No se pudo actualizar el estado.": "Could not update the status.",
  "No se pudo actualizar el presupuesto.": "Could not update the budget.",
  "No se pudo cargar el copy.": "Could not load the copy.",
  "No se pudo cargar el producto.": "Could not load the product.",
  "No se pudo crear el producto.": "Could not create the product.",
  "No se pudo crear el público.": "Could not create the audience.",
  "No se pudieron cargar los productos.": "Could not load the products.",
  "No se pudieron cargar los favoritos.": "Could not load your favorites.",
  "No se pudieron cargar los copys guardados.":
    "Could not load your saved copy.",
  "No se pudieron cargar los costos.": "Could not load the costs.",
  "No se leer tus ad accounts.": "Could not read your ad accounts.",
  "No se pudo leer tus ad accounts. Asegurate de tener Meta conectado.":
    "Could not read your ad accounts. Make sure Meta is connected.",
  "No encontrada.": "Not found.",
  "No se encontró la campaña.": "Campaign not found.",
  "No se encontró la marca.": "Brand not found.",
  "No se encontró el anuncio. Vuelve a buscarlo.":
    "Ad not found. Search for it again.",
  "No se encontró la información del anuncio. Vuelve a buscarlo.":
    "Ad details not found. Search for it again.",
  "Completa todas las preguntas para continuar.":
    "Answer every question to continue.",
  "El logo es obligatorio.": "The logo is required.",
  "El nombre de la marca es obligatorio.": "The brand name is required.",
  "El nombre del producto es obligatorio.": "The product name is required.",
  "La URL del sitio web es obligatoria.": "The website URL is required.",
  "La contraseña debe tener al menos 8 caracteres.":
    "The password must be at least 8 characters.",
  "Las contraseñas no coinciden.": "The passwords don't match.",
  "Sube al menos una imagen del producto.":
    "Upload at least one product image.",
  "Selecciona un producto.": "Pick a product.",
  "Selecciona un producto antes de generar el copy.":
    "Pick a product before generating the copy.",
  "Selecciona un producto antes de usar el copy.":
    "Pick a product before using the copy.",
  "Selecciona un producto antes de usar el copy guardado.":
    "Pick a product before using the saved copy.",
  "Escribe un slug para la landing.": "Enter a slug for the landing page.",
  "Describe lo que quieres para el anuncio (obligatorio en modo “Déjalo todo a la IA”).":
    "Describe what you want for the ad (required in “Let the AI handle it” mode).",
  "Valor inválido.": "Invalid value.",
  "Acceso restringido a administradores.": "Admins only.",
  "Avisos:": "Warnings:",

  // ─── Autenticación ───────────────────────────────────────────────────
  "Campañas de ads en minutos": "Ad campaigns in minutes",
  "Iniciar sesión": "Log in",
  "Inicia sesión": "Log in",
  "Ingresa tu email y contraseña para continuar.":
    "Enter your email and password to continue.",
  "¿No tienes cuenta?": "Don't have an account?",
  Regístrate: "Sign up",
  "Crear cuenta": "Create account",
  "Empieza a generar campañas con IA en minutos.":
    "Start generating AI campaigns in minutes.",
  "¿Ya tienes cuenta?": "Already have an account?",

  // ─── Landing pública (marketing) ─────────────────────────────────────
  "OneClickIA — Campañas de ads en minutos":
    "OneClickIA — Ad campaigns in minutes",
  "Crea campañas publicitarias en Meta Ads de forma automática con inteligencia artificial.":
    "Create Meta Ads campaigns automatically with artificial intelligence.",
  "Campañas de Meta Ads con IA": "AI-powered Meta Ads campaigns",
  "Crea campañas publicitarias en minutos, no en días":
    "Build ad campaigns in minutes, not days",
  "OneClickIA encuentra anuncios y videos ganadores, genera tus copys, imágenes y guiones con inteligencia artificial, y deja tu campaña lista para publicar en Meta.":
    "OneClickIA finds winning ads and videos, generates your copy, images and scripts with AI, and leaves your campaign ready to publish on Meta.",
  "Empezar gratis": "Start free",
  "Ver planes": "See plans",
  "Encuentra anuncios ganadores": "Find winning ads",
  "Busca los creativos que ya están funcionando en tu nicho y úsalos como base.":
    "Search the creatives already working in your niche and use them as a starting point.",
  "Copys e imágenes con IA": "AI copy and images",
  "Genera variantes de texto e imágenes para Meta adaptadas a tu marca en minutos.":
    "Generate text and image variants for Meta, tailored to your brand, in minutes.",
  "Analiza videos ganadores": "Analyze winning videos",
  "Desglosa con IA la estructura de los videos que mejor funcionan (hook, ángulos, CTA) y conviértela en un guion listo para replicar.":
    "Use AI to break down the structure of top-performing videos (hook, angles, CTA) and turn it into a script you can reuse.",
  "Publica en Meta gratis": "Publish to Meta for free",
  "Crea la campaña lista para publicar directamente en Meta.":
    "Build the campaign ready to publish straight to Meta.",
  "Marcas que crean campañas en minutos": "Brands launching campaigns in minutes",
  "5 de 5 estrellas": "5 out of 5 stars",
  "Lancé mi primera campaña en una tarde. Antes tardaba una semana con una agencia.":
    "I launched my first campaign in an afternoon. It used to take a week with an agency.",
  "Tienda de skincare": "Skincare store",
  "Los copys y las imágenes salen listos para Meta. Bajé muchísimo el costo por creativo.":
    "The copy and images come out ready for Meta. My cost per creative dropped a lot.",
  "Marca de suplementos": "Supplement brand",
  "Encontrar anuncios ganadores y adaptarlos a mi marca me ahorra horas cada semana.":
    "Finding winning ads and adapting them to my brand saves me hours every week.",
  "E-commerce de moda": "Fashion e-commerce",
  "Planes para cada etapa": "Plans for every stage",
  "Los créditos se consumen al generar con IA. Publicar en Meta es gratis.":
    "Credits are spent when generating with AI. Publishing to Meta is free.",
  Mensual: "Monthly",
  Anual: "Annual",
  "★ Más elegido": "★ Most popular",
  Popular: "Popular",
  "USD/mes": "USD/month",
  USD: "USD",
  "Ahorras {amount}/año": "You save {amount}/year",
  "{amount} USD facturado al año": "{amount} USD billed yearly",
  "Crear cuenta gratis": "Create a free account",
  "Empezar con {plan}": "Start with {plan}",
  "Sin permanencia · cancela cuando quieras":
    "No lock-in · cancel any time",
  "Empieza gratis, sin tarjeta de crédito.":
    "Start free, no credit card required.",
  "Prueba la plataforma con créditos gratis y cancela cuando quieras.":
    "Try the platform with free credits and cancel whenever you want.",
  "Pago seguro con Mercado Pago": "Secure payment with Mercado Pago",
  "Empieza gratis, sin tarjeta": "Start free, no card",
  "Cancela cuando quieras": "Cancel any time",
  "Publicación oficial en Meta": "Official Meta publishing",
  "Compara los planes": "Compare the plans",
  Incluye: "Includes",
  "Créditos por mes": "Credits per month",
  "Buscar anuncios y videos ganadores": "Search winning ads and videos",
  "Análisis de videos con IA": "AI video analysis",
  "Publicación en Meta gratis": "Free Meta publishing",
  "Variantes A/B": "A/B variants",
  "Prioridad de procesamiento": "Processing priority",
  "Negocios vinculados": "Linked businesses",
  Privacidad: "Privacy",
  Términos: "Terms",

  // ─── Legales ─────────────────────────────────────────────────────────
  "Política de Privacidad": "Privacy Policy",
  "Política de Privacidad — OneClickIA": "Privacy Policy — OneClickIA",
  "Política de privacidad de OneClickIA, plataforma SaaS para creación de campañas publicitarias con IA.":
    "Privacy policy for OneClickIA, a SaaS platform for building ad campaigns with AI.",
  "Última actualización: 2026": "Last updated: 2026",
  "En **OneClickIA** nos comprometemos a proteger la privacidad de nuestros usuarios. Esta política describe qué datos recolectamos, cómo los usamos y cómo los protegemos.":
    "At **OneClickIA** we are committed to protecting our users' privacy. This policy describes what data we collect, how we use it and how we protect it.",
  "1. Información que recolectamos": "1. Information we collect",
  "Recolectamos información que tú nos proporcionas directamente al registrarte (email, nombre, contraseña), información sobre tu marca (nombre, logo, sitio web, descripciones) y datos de uso de la plataforma (campañas creadas, anuncios generados).":
    "We collect information you provide directly when signing up (email, name, password), information about your brand (name, logo, website, descriptions) and platform usage data (campaigns created, ads generated).",
  "2. Integraciones con terceros": "2. Third-party integrations",
  "Para que la plataforma funcione, conectamos con servicios de terceros: Meta (Facebook/Instagram Ads) para publicar campañas, Google Gemini para generación de copy e imágenes, y Foreplay para inspiración de anuncios. Tus credenciales OAuth se almacenan cifradas (AES-256).":
    "For the platform to work we connect to third-party services: Meta (Facebook/Instagram Ads) to publish campaigns, Google Gemini to generate copy and images, and Foreplay for ad inspiration. Your OAuth credentials are stored encrypted (AES-256).",
  "3. Uso de la información": "3. How we use the information",
  "Usamos tu información exclusivamente para operar la plataforma: generar anuncios personalizados, publicarlos en las plataformas que autorizas, y proveer analítica de rendimiento. No vendemos tus datos a terceros.":
    "We use your information solely to operate the platform: generate personalized ads, publish them on the platforms you authorize, and provide performance analytics. We do not sell your data to third parties.",
  "4. Almacenamiento y seguridad": "4. Storage and security",
  "Tus datos se almacenan en servidores cifrados. Las contraseñas se guardan con hash bcrypt. Las credenciales de plataformas externas (Meta, Google) se cifran con AES-256-GCM antes de persistirse.":
    "Your data is stored on encrypted servers. Passwords are stored as bcrypt hashes. Credentials for external platforms (Meta, Google) are encrypted with AES-256-GCM before being persisted.",
  "5. Tus derechos": "5. Your rights",
  "Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados en cualquier momento contactándonos. También puedes desconectar tus integraciones externas (Meta, etc.) desde el panel de la aplicación en cualquier momento.":
    "You can request full deletion of your account and all associated data at any time by contacting us. You can also disconnect your external integrations (Meta, etc.) from the app dashboard at any time.",
  "6. Contacto": "6. Contact",
  "Si tienes preguntas sobre esta política, puedes contactarnos en":
    "If you have questions about this policy, you can reach us at",
  "Para la versión completa con todos los detalles legales, también puedes consultar nuestra":
    "For the full version with all the legal detail, you can also read our",
  "versión extendida en Notion": "extended version on Notion",

  "Términos del Servicio": "Terms of Service",
  "Términos del Servicio — OneClickIA": "Terms of Service — OneClickIA",
  "Términos del servicio de OneClickIA.": "OneClickIA terms of service.",
  "Al usar **OneClickIA** aceptas estos términos. Léelos con atención.":
    "By using **OneClickIA** you accept these terms. Please read them carefully.",
  "1. El servicio": "1. The service",
  "OneClickIA es una plataforma SaaS que automatiza la creación de campañas publicitarias usando inteligencia artificial. Permite generar copy e imágenes para anuncios, gestionar campañas en plataformas como Meta Ads, y analizar rendimiento.":
    "OneClickIA is a SaaS platform that automates the creation of ad campaigns using artificial intelligence. It lets you generate ad copy and images, manage campaigns on platforms such as Meta Ads, and analyze performance.",
  "2. Uso aceptable": "2. Acceptable use",
  "Te comprometes a usar OneClickIA solo para fines legales. No puedes generar contenido que viole derechos de autor, sea engañoso, ilegal, o viole las políticas de las plataformas publicitarias conectadas.":
    "You agree to use OneClickIA only for lawful purposes. You may not generate content that infringes copyright, is misleading or illegal, or violates the policies of the connected advertising platforms.",
  "3. Tu contenido": "3. Your content",
  "Mantienes todos los derechos sobre el contenido que subes (logos, imágenes, copy de tu marca). Nos otorgas una licencia limitada para procesarlo y generar variaciones de anuncios para tu marca.":
    "You keep all rights to the content you upload (logos, images, your brand's copy). You grant us a limited license to process it and generate ad variations for your brand.",
  "4. Integraciones con terceros": "4. Third-party integrations",
  "OneClickIA usa servicios de terceros (Meta Ads API, Google Gemini, Foreplay). El uso de esos servicios está también sujeto a sus propios términos. Eres responsable de cumplir las políticas publicitarias de cada plataforma donde publiques anuncios.":
    "OneClickIA uses third-party services (Meta Ads API, Google Gemini, Foreplay). Use of those services is also subject to their own terms. You are responsible for complying with the advertising policies of every platform where you publish ads.",
  "5. Costo y facturación": "5. Pricing and billing",
  "Algunas funcionalidades pueden requerir suscripción de pago. Los precios y condiciones se publicarán antes de cobrar. Puedes cancelar tu suscripción en cualquier momento.":
    "Some features may require a paid subscription. Prices and terms are published before any charge. You can cancel your subscription at any time.",
  "6. Cancelación": "6. Cancellation",
  "Puedes eliminar tu cuenta en cualquier momento. Eliminaremos tus datos según describe nuestra":
    "You can delete your account at any time. We will delete your data as described in our",
  "7. Limitación de responsabilidad": "7. Limitation of liability",
  'OneClickIA se provee "tal cual". No garantizamos resultados específicos de las campañas publicitarias. El rendimiento de los anuncios depende de muchos factores fuera de nuestro control.':
    'OneClickIA is provided "as is". We do not guarantee specific advertising results. Ad performance depends on many factors outside our control.',
  "8. Contacto": "8. Contact",
  "Para preguntas sobre estos términos:": "For questions about these terms:",

  "Eliminación de Datos": "Data Deletion",
  "Eliminación de Datos — OneClickIA": "Data Deletion — OneClickIA",
  "Cómo eliminar tus datos de OneClickIA, incluyendo los datos obtenidos a través de Meta (Facebook/Instagram).":
    "How to delete your OneClickIA data, including data obtained through Meta (Facebook/Instagram).",
  "En **OneClickIA** puedes eliminar tus datos en cualquier momento. Esta página explica qué datos almacenamos de tu cuenta de Meta (Facebook/Instagram) y cómo eliminarlos.":
    "At **OneClickIA** you can delete your data at any time. This page explains what data we store from your Meta (Facebook/Instagram) account and how to delete it.",
  "1. Qué datos de Meta almacenamos": "1. What Meta data we store",
  "Cuando conectas tu cuenta de Meta, guardamos un token de acceso (cifrado con AES-256-GCM), tu identificador de usuario de Meta y los metadatos de las cuentas publicitarias y Páginas que autorizas. Usamos estos datos exclusivamente para crear y administrar tus campañas publicitarias dentro de la plataforma.":
    "When you connect your Meta account we store an access token (encrypted with AES-256-GCM), your Meta user ID, and metadata for the ad accounts and Pages you authorize. We use this data solely to create and manage your ad campaigns inside the platform.",
  "2. Eliminar tus datos de Meta (inmediato)":
    "2. Delete your Meta data (immediate)",
  "La forma más rápida es desconectar la integración desde la propia aplicación:":
    "The fastest way is to disconnect the integration from the app itself:",
  "Inicia sesión en tu cuenta de OneClickIA.":
    "Log in to your OneClickIA account.",
  "Ve a la sección **Conexiones** / **Meta**.":
    "Go to the **Connections** / **Meta** section.",
  "Pulsa **“Desconectar”**.": "Click **“Disconnect”**.",
  "Al desconectar, eliminamos de inmediato y de forma permanente de nuestra base de datos el token de acceso, tu identificador de usuario de Meta y todos los metadatos de cuentas publicitarias y Páginas asociados. Esta acción es irreversible.":
    "On disconnect we immediately and permanently delete the access token, your Meta user ID and all associated ad account and Page metadata from our database. This action is irreversible.",
  "3. Eliminar tu cuenta completa": "3. Delete your entire account",
  "Si deseas eliminar tu cuenta de OneClickIA y todos los datos asociados (perfil, marca, campañas e integraciones), puedes solicitarlo escribiéndonos al correo de contacto que aparece más abajo. Procesamos estas solicitudes en un plazo máximo de 30 días.":
    "If you want to delete your OneClickIA account and all associated data (profile, brand, campaigns and integrations), you can request it by writing to the contact email below. We process these requests within 30 days.",
  "4. Eliminación por solicitud": "4. Deletion on request",
  "También puedes solicitar la eliminación de tus datos en cualquier momento enviando un correo a":
    "You can also request deletion of your data at any time by emailing",
  "con el asunto “Solicitud de eliminación de datos”. Incluye el correo electrónico asociado a tu cuenta para que podamos identificarla.":
    "with the subject “Data deletion request”. Include the email address linked to your account so we can identify it.",
  "5. Contacto": "5. Contact",
  "Para cualquier duda sobre la eliminación de datos, contáctanos en":
    "For any questions about data deletion, contact us at",

  // ─── Onboarding ──────────────────────────────────────────────────────
  "Configura tu marca para empezar": "Set up your brand to get started",
  "Paso {step} de {total}": "Step {step} of {total}",
  "Paso {n}": "Step {n}",
  "Identidad básica": "Basic identity",
  "Lo esencial de tu marca: nombre, logo, web y los primeros 3 puntos de identidad. (Se guarda y puedes retomar después.)":
    "The essentials of your brand: name, logo, website and the first 3 identity questions. (It's saved, so you can come back later.)",
  "Nombre comercial *": "Trade name *",
  "Ej: MUMU": "e.g. MUMU",
  "Logo de la marca *": "Brand logo *",
  "Logo de la marca (ya cargado)": "Brand logo (already uploaded)",
  "Se usará en tus anuncios generados.": "It will be used in your generated ads.",
  "Ya tienes un logo guardado. Sube uno nuevo solo si quieres reemplazarlo.":
    "You already have a saved logo. Upload a new one only if you want to replace it.",
  "URL del sitio web *": "Website URL *",
  "https://www.tumarca.com": "https://www.yourbrand.com",
  "Instagram (opcional)": "Instagram (optional)",
  "URL de Instagram": "Instagram URL",
  "https://instagram.com/tumarca": "https://instagram.com/yourbrand",
  "Descripción de Instagram": "Instagram description",
  "Qué publicas, qué vendes, a quién te diriges...":
    "What you post, what you sell, who you're talking to...",
  "Útil si no tienes web pública o quieres complementar.":
    "Useful if you don't have a public website, or to add extra context.",
  "Identidad de marca": "Brand identity",
  "1. Nombre comercial, razón social, año y canal de venta *":
    "1. Trade name, legal name, founding year and sales channel *",
  "Ej: MUMU — razón social Bienestar Natural SAS. Fundada en 2021 en Medellín, Colombia. Canal principal: e-commerce propio (Shopify) + Farmatodo.":
    "e.g. MUMU — legal name Bienestar Natural SAS. Founded in 2021 in Medellín, Colombia. Main channel: own e-commerce (Shopify) + Farmatodo.",
  "Nombre legal si es distinto al comercial, año, país de origen, canal principal.":
    "Legal name if different from the trade name, year, country of origin, main channel.",
  "2. Mercados actuales y mercados meta *": "2. Current and target markets *",
  "Ej: Hoy: Colombia (80% e-commerce). Meta año 2: México y Chile. Año 3: distribución en farmacias latinoamericanas.":
    "e.g. Today: Colombia (80% e-commerce). Year 2 goal: Mexico and Chile. Year 3: distribution in Latin American pharmacies.",
  "Geografía actual y expansión planeada (países, ciudades, segmentos).":
    "Current geography and planned expansion (countries, cities, segments).",
  "3. Misión: ¿por qué existe tu marca más allá de vender? *":
    "3. Mission: why does your brand exist beyond selling? *",
  "Ej: Demostrar que cuidarse bien no requiere ni sufrimiento ni una licenciatura en nutrición.":
    "e.g. To prove that taking care of yourself requires neither suffering nor a nutrition degree.",
  "El propósito real, no el eslogan.": "The real purpose, not the tagline.",

  "Personalidad y tono": "Personality and tone",
  "Cómo se comporta tu marca: persona, voz, prohibiciones y referentes. Define el tono de todos los creativos.":
    "How your brand behaves: persona, voice, no-gos and references. It sets the tone of every creative.",
  "4. Si tu marca fuera una persona, ¿cómo sería? *":
    "4. If your brand were a person, what would they be like? *",
  "Ej: Mujer de 35 años, profesional, que se cuida sin obsesionarse. Vive en Medellín, va al pilates dos veces por semana, lee etiquetas antes de comprar pero no es extremista. Habla con honestidad, no promete milagros.":
    "e.g. A 35-year-old professional woman who takes care of herself without obsessing. Lives in Medellín, does pilates twice a week, reads labels before buying but isn't extreme about it. Speaks honestly, doesn't promise miracles.",
  "Edad, perfil, carácter, qué hace, cómo se ve. Esta persona define el tono de todos los creativos.":
    "Age, profile, character, what they do, how they look. This person sets the tone of every creative.",
  "5. Tono de voz: 3-5 adjetivos + cómo se manifiesta en el copy *":
    "5. Tone of voice: 3-5 adjectives + how it shows up in the copy *",
  'Ej: Empático, honesto, directo, sin condescendencia. En la práctica: habla de tú a tú, no usa jerga wellness, nunca dice "babe" ni "sis", frases cortas, evita superlativos.':
    'e.g. Empathetic, honest, direct, never condescending. In practice: speaks peer-to-peer, avoids wellness jargon, never says "babe" or "sis", short sentences, avoids superlatives.',
  "3-5 adjetivos que describen el tono y un ejemplo de cómo se manifiesta.":
    "3-5 adjectives describing the tone, plus an example of how it shows up.",
  "6. ¿Qué NUNCA diría, haría ni parecería tu marca? *":
    "6. What would your brand NEVER say, do or look like? *",
  "Ej: 1) Nunca lenguaje de vergüenza corporal. 2) Nunca prometer resultados sin esfuerzo. 3) Nunca testimonios falsos. 4) Nunca sonar desesperada. 5) Nunca comparar con estándares irreales.":
    "e.g. 1) Never body-shaming language. 2) Never promise effortless results. 3) Never fake testimonials. 4) Never sound desperate. 5) Never compare against unrealistic standards.",
  "Las 5 prohibiciones de tono y comunicación.":
    "The 5 tone and communication no-gos.",
  "7. ¿Qué marcas admiras por su forma de comunicarse y qué replicarías? *":
    "7. Which brands do you admire for how they communicate, and what would you copy? *",
  "Ej: Patagonia por su honestidad radical. Oatly por su irreverencia sin perder credibilidad. Nubank por hablarle a adultos como adultos.":
    "e.g. Patagonia for its radical honesty. Oatly for being irreverent without losing credibility. Nubank for talking to adults like adults.",
  "De cualquier industria — lo importante es qué tiene esa comunicación que te gustaría replicar.":
    "From any industry — what matters is what about that communication you'd like to replicate.",

  Filosofía: "Philosophy",
  "La creencia central de tu marca — el discurso que enfrenta el statu quo de tu categoría.":
    "Your brand's core belief — the argument that challenges your category's status quo.",
  "8. ¿Cuál es la creencia central o filosofía de tu marca? *":
    "8. What is your brand's core belief or philosophy? *",
  'Ej. calzado: "Creemos que un zapato puede ser elegante Y cómodo — la industria lleva 50 años diciéndote que tienes que elegir." Ej. ropa: "Creemos que el cuerpo no tiene que adaptarse a la talla — la ropa tiene que adaptarse al cuerpo."':
    'e.g. footwear: "We believe a shoe can be elegant AND comfortable — the industry has spent 50 years telling you to pick one." e.g. clothing: "We believe the body shouldn\'t adapt to the size — the clothes should adapt to the body."',
  "¿Qué cree tu marca que es verdad en su categoría que otros no dicen? Una creencia poderosa enfrenta el statu quo.":
    "What does your brand believe is true in its category that others won't say? A strong belief challenges the status quo.",

  "Identidad visual": "Visual identity",
  "Cómo se ve tu marca — colores, tipografías, estética y referencias visuales.":
    "How your brand looks — colors, typefaces, aesthetic and visual references.",
  "9. ¿Cuál es la identidad visual de tu marca? *":
    "9. What is your brand's visual identity? *",
  "Ej: Colores: verde menta #A8D8B9 + negro carbón #1C1C1C + blanco hueso #F9F7F2. Tipografía: sans-serif geométrica (Neue Haas Grotesk), serif clásica para cuerpo (Freight Text). Estética: limpia, espacio en blanco, fotografía de producto sobre fondos neutros. Referencias: Aesop, Muji, Kinfolk.":
    "e.g. Colors: mint green #A8D8B9 + charcoal black #1C1C1C + bone white #F9F7F2. Typefaces: geometric sans-serif (Neue Haas Grotesk), classic serif for body copy (Freight Text). Aesthetic: clean, lots of white space, product photography on neutral backgrounds. References: Aesop, Muji, Kinfolk.",
  "Colores corporativos (con códigos si los tienes), tipografías, estética general, estilo fotográfico y referencias visuales. Si no tienes identidad definida, describe cómo quisieras que se vea.":
    "Brand colors (with hex codes if you have them), typefaces, overall aesthetic, photography style and visual references. If you don't have a defined identity yet, describe how you'd like it to look.",

  "Posicionamiento competitivo": "Competitive positioning",
  "Tu lugar en el mercado: rango de precio, competidores y el hueco que solo tu marca llena.":
    "Your place in the market: price range, competitors, and the gap only your brand fills.",
  "10. Rango de precio y percepción *": "10. Price range and perception *",
  "Selecciona un rango": "Select a range",
  "Value (económico)": "Value (budget)",
  "Mid-market (medio)": "Mid-market",
  "Premium accesible": "Accessible premium",
  Premium: "Premium",
  "Ultra premium": "Ultra premium",
  "Sin definir": "Not set",
  "10. ¿Qué comunica ese posicionamiento? *":
    "10. What does that positioning communicate? *",
  "Ej: Premium accesible — por encima de marcas genéricas pero por debajo de marcas importadas de lujo. El precio comunica calidad real sin pagar por la etiqueta.":
    "e.g. Accessible premium — above generic brands but below imported luxury ones. The price signals real quality without paying for the label.",
  "Explica qué transmite tu rango de precio al cliente.":
    "Explain what your price range signals to the customer.",
  "11. Competidores directos de tu MARCA *":
    "11. Direct competitors of your BRAND *",
  "Ej: Competidor 1: Totto — masiva, buena distribución, diseño genérico. Nos eligen cuando quieren más personalidad. Competidor 2: Osprey — importada premium, $800K+, sin servicio local.":
    "e.g. Competitor 1: Totto — mass market, good distribution, generic design. People pick us when they want more personality. Competitor 2: Osprey — imported premium, $800K+, no local support.",
  "Para cada competidor: nombre, posicionamiento y por qué un cliente te elegiría sobre ellos.":
    "For each competitor: name, positioning, and why a customer would pick you over them.",
  "12. ¿En qué es notablemente mejor tu marca? *":
    "12. What is your brand notably better at? *",
  "Ej: Soporte postventa en español, tiempo de entrega en Colombia, adaptación del producto al clima tropical.":
    "e.g. After-sales support in Spanish, delivery times in Colombia, product adapted to a tropical climate.",
  "Sé honesto y específico — no 'calidad' en abstracto.":
    "Be honest and specific — not 'quality' in the abstract.",
  "12. ¿Cuál es el hueco de mercado que ocupas? *":
    "12. What market gap do you fill? *",
  "Ej: La única marca de accesorios técnicos diseñada para el contexto latinoamericano — el calor, las lluvias, el transporte público.":
    "e.g. The only technical accessories brand designed for the Latin American context — the heat, the rain, public transport.",
  "El hueco que ningún competidor está llenando.":
    "The gap no competitor is filling.",
  "Terminar y empezar": "Finish and start",
  Terminar: "Finish",

  // ─── Marca (dashboard) ───────────────────────────────────────────────
  "Información completa de tu marca: identidad básica, las 12 preguntas del diagnóstico y los análisis automáticos del sitio web y logo.":
    "Everything about your brand: basic identity, the 12 diagnostic questions, and the automatic website and logo analysis.",
  "Revisa la información de tu marca": "Review your brand information",
  "Esto es lo que captamos del onboarding. Si algo no está bien, puedes editarlo antes de empezar a crear campañas.":
    "This is what we captured during onboarding. If something's off, you can edit it before you start creating campaigns.",
  "Editar información": "Edit information",
  "Todo bien, continuar": "Looks good, continue",
  "Sin nombre": "Untitled",
  "Ya tienes un logo. Sube uno nuevo para reemplazarlo.":
    "You already have a logo. Upload a new one to replace it.",
  "Identidad de la marca": "Brand identity",
  "1. Nombre, año, país y canal de venta":
    "1. Name, year, country and sales channel",
  "2. Mercados actuales y mercados meta": "2. Current and target markets",
  "3. Misión: por qué existe tu marca": "3. Mission: why your brand exists",
  "4. Persona de marca": "4. Brand persona",
  "5. Tono de voz": "5. Tone of voice",
  "6. Prohibiciones de comunicación": "6. Communication no-gos",
  "7. Marcas que admira y qué replicaría":
    "7. Brands you admire and what you'd replicate",
  "8. Creencia central / anti-narrativa": "8. Core belief / anti-narrative",
  "9. Colores, tipografías, estética, referencias":
    "9. Colors, typefaces, aesthetic, references",
  "10. Rango de precio y percepción": "10. Price range and perception",
  Tier: "Tier",
  "Qué comunica ese posicionamiento...":
    "What that positioning communicates...",
  "Sin definir el tier.": "Tier not set.",
  "Sin descripción del posicionamiento.": "No positioning description.",
  "11. Competidores directos y diferenciación":
    "11. Direct competitors and differentiation",
  "12a. En qué es mejor tu marca": "12a. What your brand is better at",
  "12b. Hueco de mercado que ocupa": "12b. Market gap you fill",
  "Análisis automáticos (extraídos con IA)":
    "Automatic analysis (extracted with AI)",
  "Resumen del sitio web": "Website summary",
  "Análisis del logo": "Logo analysis",
  "Resumen de Instagram": "Instagram summary",
  "Colores de la marca": "Brand colors",
  "+ Agregar color": "+ Add color",
  "Sin colores definidos.": "No colors defined.",
  "Fuentes de datos": "Data sources",
  "Indica si cada campo provino del onboarding (form), del análisis automático de la web (web) o del logo (manual).":
    "Shows whether each field came from onboarding (form), the automatic website analysis (web) or the logo (manual).",
  "Sin resumen.": "No summary.",
  "Sin análisis.": "No analysis.",
  "Sin responder.": "Not answered.",
  "Se aplica a todas tus imágenes y se guarda como tu preferencia. Déjalo vacío para que la IA elija.":
    "Applies to all your images and is saved as your preference. Leave it empty to let the AI choose.",
  'Ej: "Montserrat", "Bebas Neue en mayúsculas", "una serif elegante"…':
    'e.g. "Montserrat", "Bebas Neue in caps", "an elegant serif"…',

  // ─── Productos ───────────────────────────────────────────────────────
  "Mis productos": "My products",
  "Cada producto que quieras pautar debe tener su perfil completo. La IA usa estas respuestas para generar mejores anuncios.":
    "Every product you want to advertise needs a complete profile. The AI uses these answers to generate better ads.",
  "+ Nuevo producto": "+ New product",
  "Nuevo producto": "New product",
  "Todavía no tienes productos": "You don't have any products yet",
  "Crea tu primer producto y completa las 10 preguntas del diagnóstico para que la IA pueda generar anuncios con contexto real.":
    "Create your first product and answer the 10 diagnostic questions so the AI can generate ads with real context.",
  "Crear mi primer producto": "Create my first product",
  "(sin nombre)": "(untitled)",
  "¿Eliminar este producto? No podrá usarse en futuros anuncios.":
    "Delete this product? It won't be usable in future ads.",
  "Faltan preguntas por contestar — no se podrá usar en anuncios hasta completar.":
    "Some questions are unanswered — it can't be used in ads until it's complete.",
  "← Volver a productos": "← Back to products",
  "Empecemos con lo esencial: el nombre y hasta 3 imágenes. Después podrás completar las 10 preguntas que la IA usa para generar anuncios con contexto real.":
    "Let's start with the essentials: the name and up to 3 images. Afterwards you can answer the 10 questions the AI uses to generate ads with real context.",
  "Nombre del producto *": "Product name *",
  "Ej: Jeans tiro alto MUMU": "e.g. MUMU high-waisted jeans",
  "Imágenes del producto *": "Product images *",
  "Se usan como referencia en cada anuncio generado con IA.":
    "Used as a reference in every AI-generated ad.",
  "Continuar al diagnóstico →": "Continue to the questionnaire →",
  "Básicos del producto": "Product basics",
  "Confirma el nombre y las imágenes. Para cambiarlas, sube nuevas (reemplazan todas).":
    "Confirm the name and images. To change them, upload new ones (they replace all).",
  "Imágenes actuales. Para reemplazarlas, sube nuevas abajo.":
    "Current images. To replace them, upload new ones below.",
  "Nuevas imágenes": "New images",
  "Reemplazar imágenes (opcional)": "Replace images (optional)",
  "Si subes imágenes aquí, sobrescriben las actuales al guardar.":
    "If you upload images here, they overwrite the current ones on save.",
  "¿Qué es y de qué está hecho?": "What is it and what's it made of?",
  "Atributos físicos, composición y anti-posicionamiento. Es la base material del producto.":
    "Physical attributes, composition and anti-positioning. The material foundation of the product.",
  "1. ¿Qué es este producto? *": "1. What is this product? *",
  "Ej: Jeans tiro alto. Denim stretch 98% algodón / 2% lycra. Tallas 26-38. Colores: negro, azul stone, gris pizarra, camel. Largo 30 y 32. Corte recto. Costuras en hilo mostaza.":
    "e.g. High-waisted jeans. Stretch denim 98% cotton / 2% lycra. Sizes 26-38. Colors: black, stone blue, slate grey, camel. Inseam 30 and 32. Straight cut. Mustard-thread stitching.",
  "Tipo de objeto/servicio + atributos físicos: colores, tamaños, materiales, dimensiones, presentaciones.":
    "Type of object/service + physical attributes: colors, sizes, materials, dimensions, formats.",
  "2. ¿De qué está hecho o qué lo compone? *":
    "2. What is it made of, or what makes it up? *",
  "Ej: Espuma HD-36 (soporte lumbar sin hundirse) + malla transpirable (no acalora la espalda en jornadas largas) + base aluminio 5 ruedas (gira 360° sin rayar el piso).":
    "e.g. HD-36 foam (lumbar support that doesn't sag) + breathable mesh (keeps your back cool on long days) + 5-wheel aluminum base (spins 360° without scratching the floor).",
  "Materiales, ingredientes, tecnologías clave — cada uno con su función y el beneficio que da al usuario.":
    "Materials, ingredients, key technologies — each with its function and the benefit it gives the user.",
  "3. ¿Qué NO es este producto? *": "3. What is this product NOT? *",
  "Ej: No es sustituto de comidas, no es para bajar de peso, no es un detox agresivo.":
    "e.g. It's not a meal replacement, it's not for weight loss, it's not an aggressive detox.",
  "El anti-posicionamiento del producto es el copy más diferenciador.":
    "A product's anti-positioning is the most differentiating copy you have.",
  "USP y mecanismo": "USP and mechanism",
  "La propuesta única y por qué funciona el producto. Aquí vive el corazón del anuncio.":
    "The unique proposition and why the product works. This is the heart of the ad.",
  "4. Features → beneficio funcional → beneficio emocional *":
    "4. Features → functional benefit → emotional benefit *",
  "Ej: Pesa 400g → Caminas 8h sin dolor de espalda → Llegar al destino con energía, no agotada.":
    "e.g. Weighs 400g → You walk 8h without back pain → You arrive with energy, not exhausted.",
  "Las 5 características más importantes. Formato: Característica → Funcional → Emocional. Incluye beneficio de identidad (en quién se convierte el usuario).":
    "The 5 most important features. Format: Feature → Functional → Emotional. Include the identity benefit (who the user becomes).",
  "5. USP del producto *": "5. Product USP *",
  'Ej: El único zapato que se ve elegante y no destruye tus pies en 8 horas de pie. Filosófica: elegancia y comodidad no son opuestos. Funcional: suela de amortiguación 3 capas. Emocional: llegar a casa sin sentir los pies. Hook: "Elegante. Sin dolor." Subtítulo: "El zapato que los médicos usan cuando nadie los mira."':
    'e.g. The only shoe that looks elegant and doesn\'t destroy your feet after 8 hours standing. Philosophical: elegance and comfort aren\'t opposites. Functional: 3-layer cushioned sole. Emotional: getting home without feeling your feet. Hook: "Elegant. Painless." Subhead: "The shoe doctors wear when nobody\'s looking."',
  "USP en una oración + 3 capas (filosófica, funcional, emocional) + 3 formatos: hook 3-5 palabras, subtítulo landing 8-15 palabras, body 40-60 palabras.":
    "USP in one sentence + 3 layers (philosophical, functional, emotional) + 3 formats: 3-5 word hook, 8-15 word landing subhead, 40-60 word body.",
  "6. ¿Por qué funciona este producto? *": "6. Why does this product work? *",
  'Ej: Simple: "La mayoría de colchones crea puntos de presión que te despiertan. Este los redistribuye." Técnico: "La espuma viscoelástica detecta puntos de tensión y los absorbe uniformemente." Narrativo: "Llevamos décadas durmiendo como nos dijeron. Nosotros preguntamos: ¿y si el colchón se adaptara al cuerpo?"':
    'e.g. Simple: "Most mattresses create pressure points that wake you up. This one redistributes them." Technical: "The viscoelastic foam detects tension points and absorbs them evenly." Narrative: "We\'ve spent decades sleeping the way we were told. We asked: what if the mattress adapted to the body?"',
  "Mecanismo en 3 niveles: Simple (2 frases para hook), Técnico (landing/email), Narrativo (brand video / founder story).":
    "Mechanism at 3 levels: Simple (2 sentences for a hook), Technical (landing/email), Narrative (brand video / founder story).",
  "Uso y precio": "Use and price",
  "Cómo se vive el producto y cómo se justifica lo que cuesta.":
    "How the product is experienced and how its price is justified.",
  "7. ¿Cómo se usa, se lleva puesto o se experimenta? *":
    "7. How is it used, worn or experienced? *",
  "Ej: Primario: noche, 20 min de ritual propio después de acostar a los hijos. Enciende con cerillos, no encendedor. Dura 50 horas. Secundario: decoración en cenas. Situacional: regalo de cumpleaños, regalo corporativo. Estacional: Día de la Madre, Navidad.":
    "e.g. Primary: at night, a 20-minute ritual after putting the kids to bed. Lit with matches, not a lighter. Burns for 50 hours. Secondary: decoration at dinners. Situational: birthday gift, corporate gift. Seasonal: Mother's Day, Christmas.",
  "Ritual completo: momento del día, frecuencia, pasos, tiempo. Incluye casos de uso secundarios, situacionales y de regalo.":
    "The full ritual: time of day, frequency, steps, duration. Include secondary, situational and gifting use cases.",
  "8. ¿Cuánto cuesta y cómo se justifica el precio? *":
    "8. How much does it cost and how is the price justified? *",
  "Ej: $380.000 / 5 años / 365 días = $208 por día. Reframe 1 vs. fast fashion: dura 5 años, no 1 temporada. Reframe 2 cotidiano: menos que el café del mes. Reframe 3 inversión: primera impresión en entrevistas. Reframe 4 costo de no tenerla: comprar algo de emergencia en el aeropuerto. Garantía: cambio gratis 30 días.":
    "e.g. $380,000 / 5 years / 365 days = $208 per day. Reframe 1 vs. fast fashion: lasts 5 years, not 1 season. Reframe 2 everyday: less than a month of coffee. Reframe 3 investment: first impression in interviews. Reframe 4 cost of not having it: emergency purchase at the airport. Warranty: free exchange within 30 days.",
  "Precio desagregado (por uso/día/porción) + 4 reframes + garantía o política de devolución.":
    "Price broken down (per use/day/serving) + 4 reframes + warranty or return policy.",
  "Cliente y voz": "Customer and voice",
  "Quién compra el producto y con qué palabras habla de su problema. Aquí está el copy más poderoso.":
    "Who buys the product and the words they use to describe their problem. This is where the strongest copy lives.",
  "9. ¿Quién compra este producto? Avatar completo *":
    "9. Who buys this product? Full avatar *",
  'Ej: Andrés, 34, Bogotá, ingeniero remoto, $5.5M/mes. JTBD funcional: no terminar el día con dolor. Emocional: sentir oficina seria en casa. Social: que sus clientes vean profesionalismo. Trigger: lleva 3 semanas con dolor. FEEL antes: "llego a las 3pm destrozado". FEEL después: "termino el día con energía". BELIEVE antes: "la silla no importa tanto". BELIEVE después: "el entorno de trabajo es parte del rendimiento".':
    'e.g. Andrés, 34, Bogotá, remote engineer, $5.5M/month. Functional JTBD: not ending the day in pain. Emotional: feeling like a real office at home. Social: clients seeing professionalism. Trigger: three weeks of back pain. FEEL before: "by 3pm I\'m wrecked". FEEL after: "I finish the day with energy". BELIEVE before: "the chair doesn\'t matter that much". BELIEVE after: "your work environment is part of your performance".',
  "Avatar (nombre mental, edad, ciudad, ingresos, ocupación) + JTBD (funcional, emocional, social) + 3 triggers que detonan la compra + Before/After en 5 dimensiones (HAVE, FEEL, STATUS, CAN DO, BELIEVE).":
    "Avatar (a name you picture, age, city, income, occupation) + JTBD (functional, emotional, social) + 3 purchase triggers + Before/After across 5 dimensions (HAVE, FEEL, STATUS, CAN DO, BELIEVE).",
  "10. ¿Qué dicen los clientes sobre este producto? *":
    "10. What do customers say about this product? *",
  'Ej: "llevo 3 meses usándolos trabajando de pie y ya no llego destruido a casa". Objeción: "$280.000 es mucho para un zapato" → Contraargumento: es el costo de 1 sesión de fisioterapia. Proof point: garantía 2 años. Google: "zapatos para trabajar de pie sin dolor", "calzado formal cómodo hombre Colombia".':
    'e.g. "I\'ve worn them for 3 months working on my feet and I don\'t get home wrecked anymore". Objection: "$280,000 is a lot for a shoe" → Counter: that\'s the cost of one physio session. Proof point: 2-year warranty. Google: "shoes for working on your feet without pain", "comfortable men\'s formal shoes Colombia".',
  "8 frases textuales entre comillas (sin editar — usa palabras exactas de reviews, DMs, conversaciones). Principales objeciones + contraargumento + proof point. Búsquedas en Google cuando tienen el problema.":
    "8 verbatim quotes (unedited — use the exact words from reviews, DMs, conversations). Main objections + counterargument + proof point. What they Google when they have the problem.",

  // ─── Conexiones ──────────────────────────────────────────────────────
  "Gestiona tus integraciones con Shopify y Meta.":
    "Manage your Shopify and Meta integrations.",
  "Proveedores de conexión": "Connection providers",
  "Conecta tu cuenta de Meta para publicar campañas publicitarias.":
    "Connect your Meta account to publish ad campaigns.",
  "Cuenta de Meta": "Meta account",
  "Conectar Meta": "Connect Meta",
  "¿Por qué conectar Meta?": "Why connect Meta?",
  "Publica campañas directamente desde OneClickIA":
    "Publish campaigns straight from OneClickIA",
  "Gestiona tus anuncios sin salir de la plataforma":
    "Manage your ads without leaving the platform",
  "Activa y pausa campañas con un solo clic":
    "Activate and pause campaigns with one click",
  "Conectando con Meta Ads...": "Connecting to Meta Ads...",
  "Volver a Conexiones": "Back to Connections",
  "Conecta tu tienda para crear landing pages por avatar bajo tu propio dominio y enlazarlas a tus productos.":
    "Connect your store to create per-avatar landing pages under your own domain and link them to your products.",
  "¡Tienda Shopify conectada!": "Shopify store connected!",
  "Instalación pendiente": "Installation pending",
  "Tienda:": "Store:",
  "Guardamos las credenciales de **{shop}**, pero falta terminar de instalar la app. Vuelve a pulsar “Conectar” para autorizar la instalación en tu tienda.":
    "We saved the credentials for **{shop}**, but the app install isn't finished. Click “Connect” again to authorize the installation in your store.",
  "Paso 1 · Crea y configura tu app en Shopify":
    "Step 1 · Create and configure your app in Shopify",
  "Entra a": "Go to",
  "Abajo a la derecha, haz clic en el botón **“Crear app”** (en la barra “Obtén credenciales de la API”). *No* uses la opción de CLI (`npm init…`).":
    "At the bottom right, click the **“Create app”** button (in the “Get API credentials” bar). Do *not* use the CLI option (`npm init…`).",
  "Ponle un nombre a la app (ej. “OneClickIA”). Al crearla, Shopify te lleva automáticamente a la página de configuración (la **“versión”** de la app) — ahí va todo lo siguiente.":
    "Give the app a name (e.g. “OneClickIA”). Once created, Shopify takes you straight to the configuration page (the app **“version”**) — everything below goes there.",
  "En **URL de la app** pon cualquier URL https válida (no la usamos). Puedes pegar la misma URL del proxy de abajo.":
    "In **App URL** put any valid https URL (we don't use it). You can paste the same proxy URL from below.",
  "**Desmarca** la casilla **“Incrustar la app en el panel de control de Shopify”** (nuestra app no va incrustada en el admin).":
    "**Uncheck** the **“Embed app in Shopify admin”** box (our app is not embedded in the admin).",
  "En **Acceso → Alcances** escribe: `{scopes}`.":
    "Under **Access → Scopes** enter: `{scopes}`.",
  "**Marca** la casilla **“Usar flujo de instalación heredado”**.":
    "**Check** the **“Use legacy install flow”** box.",
  "Es obligatoria: habilita el flujo OAuth con redirección que usamos.":
    "It's required: it enables the redirect-based OAuth flow we use.",
  "En **URLs de redireccionamiento** pega:": "Under **Redirect URLs** paste:",
  "URL de redireccionamiento": "Redirect URL",
  "Despliega **Proxy de la app** (al final del formulario) y pon estos tres valores (así las landings se sirven bajo tu dominio):":
    "Expand **App proxy** (at the end of the form) and set these three values (so landings are served under your domain):",
  "Prefijo de subruta": "Subpath prefix",
  Subruta: "Subpath",
  "URL de proxy": "Proxy URL",
  "Haz clic en **Publicar**. Se abrirá la ventana “¿Publicar esta versión nueva?” con dos campos **opcionales** (solo etiquetas internas, no afectan la conexión). Puedes dejarlos vacíos, o copiar estos:":
    "Click **Publish**. The “Publish this new version?” dialog opens with two **optional** fields (internal labels only, they don't affect the connection). You can leave them empty, or copy these:",
  "Nombre de la versión": "Version name",
  "Mensaje de la versión": "Version message",
  "El nombre solo admite letras, números y guiones (sin espacios ni acentos).":
    "The name only allows letters, numbers and hyphens (no spaces or accents).",
  "Luego confirma con **Publicar**.": "Then confirm with **Publish**.",
  "Tras publicar, en el **menú lateral izquierdo** de la app haz clic en **Configuración**.":
    "After publishing, click **Configuration** in the app's **left sidebar**.",
  "En la sección **Credenciales**:": "In the **Credentials** section:",
  "**ID de cliente** → cópialo (es tu **API key**).":
    "**Client ID** → copy it (that's your **API key**).",
  "**Secreto** → haz clic en el **ojo**": "**Secret** → click the **eye**",
  "para revelarlo y cópialo (es tu **API secret**).":
    "to reveal it and copy it (that's your **API secret**).",
  "Pega ambos en el **Paso 2**.": "Paste both into **Step 2**.",
  "Paso 2 · Pega los datos de tu app": "Step 2 · Paste your app's details",
  "Dominio de tu tienda": "Your store domain",
  "Es tu dominio `.myshopify.com` (no tu dominio personalizado). Lo encuentras en tu admin de Shopify → **Configuración → Dominios**, o en la URL `admin.shopify.com/store/<nombre>` (tu dominio es `<nombre>.myshopify.com`).":
    "This is your `.myshopify.com` domain (not your custom domain). Find it in your Shopify admin → **Settings → Domains**, or in the URL `admin.shopify.com/store/<name>` (your domain is `<name>.myshopify.com`).",
  "API key": "API key",
  "API secret key": "API secret key",
  "ej. 1a2b3c4d5e6f...": "e.g. 1a2b3c4d5e6f...",
  "Conectar e instalar": "Connect and install",
  "Te llevaremos a tu tienda para autorizar la instalación de tu app. Al volver, la conexión quedará lista.":
    "We'll take you to your store to authorize the app install. When you come back, the connection will be ready.",
  "Productos ({count})": "Products ({count})",
  "No se encontraron productos (o aún cargando).":
    "No products found (or still loading).",

  // ─── Campañas ────────────────────────────────────────────────────────
  "Gestiona tus campañas de Meta Ads.": "Manage your Meta Ads campaigns.",
  "Nueva campaña": "New campaign",
  "OneClickIA ({count})": "OneClickIA ({count})",
  "Meta Ads": "Meta Ads",
  "Meta Ads ({count})": "Meta Ads ({count})",
  "Aún no tienes campañas creadas desde OneClickIA.":
    "You haven't created any campaigns from OneClickIA yet.",
  "¿Estás seguro de eliminar esta campaña?":
    "Are you sure you want to delete this campaign?",
  "No se encontraron campañas en tu cuenta de Meta Ads.":
    "No campaigns found in your Meta Ads account.",
  "Buscar campaña…": "Search campaign…",
  "No hay campañas que coincidan con el filtro.":
    "No campaigns match the filter.",
  "{amount} / día": "{amount} / day",
  "{amount} total": "{amount} total",
  "Sin presupuesto": "No budget",
  Gasto: "Spend",
  "Impr.": "Impr.",
  Clics: "Clicks",
  CTR: "CTR",
  "← Volver a campañas": "← Back to campaigns",
  "Volver a campañas": "Back to campaigns",
  "← Volver a {name}": "← Back to {name}",
  "Grupos de anuncios": "Ad sets",
  "Esta campaña no tiene grupos de anuncios.":
    "This campaign has no ad sets.",
  "Este grupo de anuncios no tiene anuncios.":
    "This ad set has no ads.",
  "Ver preview": "View preview",
  "Ocultar preview": "Hide preview",
  "{duration} activo": "{duration} running",
  "{days} días": "{days} days",
  "{months} meses": "{months} months",
  "{years}a": "{years}y",
  "{years}a {months}m": "{years}y {months}m",
  "1 año y {months} meses": "1 year and {months} months",
  "{years} años y {months} meses": "{years} years and {months} months",

  Campaña: "Campaign",
  "Refrescar creativo": "Refresh creative",
  "Error en: {step}": "Error at: {step}",
  "Preview del anuncio": "Ad preview",
  "Visualiza cómo se verá tu anuncio en Meta.":
    "See how your ad will look on Meta.",
  "Cargando preview de Meta...": "Loading the Meta preview...",
  "Creativos del anuncio": "Ad creatives",
  "Imagen principal": "Main image",
  " + 1 variante para A/B testing": " + 1 variant for A/B testing",
  " + {count} variantes para A/B testing":
    " + {count} variants for A/B testing",
  "Variante {n}": "Variant {n}",
  "Variante {n} · {format}": "Variant {n} · {format}",
  "Copy del anuncio": "Ad copy",
  "Presupuesto y duración": "Budget and schedule",
  Presupuesto: "Budget",
  Objetivo: "Objective",
  "Meta del grupo": "Ad set goal",
  Segmentación: "Targeting",
  "{min} – {max} años": "{min} – {max} years old",
  "Estructura en Meta": "Structure on Meta",
  "Grupo de anuncios": "Ad set",
  "Publicar en Meta": "Publish to Meta",
  "Reintentar publicación": "Retry publishing",
  "Activar campaña": "Activate campaign",
  "Pausar campaña": "Pause campaign",
  "Publicando en Meta... ({secs}s)": "Publishing to Meta... ({secs}s)",
  "La publicación está tardando más de lo normal.":
    "Publishing is taking longer than usual.",
  "Puede ser un timeout de red. La publicación es idempotente — reintentar continuará desde el paso donde se quedó, sin duplicar nada en Meta.":
    "It could be a network timeout. Publishing is idempotent — retrying picks up from where it stopped, without duplicating anything on Meta.",

  "Editar campaña": "Edit campaign",
  "← Volver a la campaña": "← Back to the campaign",
  "Volver a la campaña": "Back to the campaign",
  "No se puede editar mientras la campaña se está publicando. Espera a que termine.":
    "You can't edit while the campaign is publishing. Wait until it finishes.",
  "Esta campaña está publicada en Meta. Los cambios de presupuesto, segmentación y copy se sincronizan con Meta al guardar. El objetivo no se puede cambiar.":
    "This campaign is live on Meta. Budget, targeting and copy changes sync to Meta when you save. The objective can't be changed.",
  "Objetivo y presupuesto": "Objective and budget",
  "Tipo de presupuesto": "Budget type",
  Diario: "Daily",
  "Monto ({currency})": "Amount ({currency})",
  "Ej: 5.000": "e.g. 5,000",
  "El objetivo no se puede cambiar en una campaña ya publicada.":
    "The objective can't be changed on a campaign that's already published.",
  "Edad mín.": "Min age",
  "Edad máx.": "Max age",
  "Botón (CTA)": "Button (CTA)",
  "URL de destino": "Destination URL",

  "Configura los detalles de tu campaña publicitaria.":
    "Configure the details of your ad campaign.",
  "Primero debes generar una imagen para crear una campaña.":
    "You need to generate an image first to create a campaign.",
  "Necesitas conectar tu cuenta de Meta y tener al menos una cuenta publicitaria y una página para crear campañas.":
    "You need to connect your Meta account and have at least one ad account and one Page to create campaigns.",
  "Cuenta y página": "Account and Page",
  "Cuenta publicitaria": "Ad account",
  "Selecciona una cuenta": "Select an account",
  "Página de Facebook": "Facebook Page",
  "Selecciona una página": "Select a Page",
  "Campaña en Meta": "Campaign on Meta",
  "Puedes crear una campaña nueva o agregar este anuncio a una campaña existente.":
    "You can create a new campaign or add this ad to an existing one.",
  "Crear nueva": "Create new",
  "Crear nuevo": "Create new",
  "Usar existente": "Use existing",
  "Nombre de la campaña": "Campaign name",
  "Ej: Campaña Verano 2026": "e.g. Summer 2026 Campaign",
  "Si lo dejas vacío se usará el headline del copy.":
    "If you leave it empty we'll use the copy's headline.",
  "Campaña existente": "Existing campaign",
  "Selecciona una campaña": "Select a campaign",
  "Crea un grupo nuevo o agrega el anuncio a uno existente.":
    "Create a new ad set or add the ad to an existing one.",
  "Cargando grupos...": "Loading ad sets...",
  "Grupo de anuncios existente": "Existing ad set",
  "Selecciona un grupo": "Select an ad set",
  "Nombre del grupo de anuncios": "Ad set name",
  "Ej: Mujeres 25-45 Colombia": "e.g. Women 25-45 Colombia",
  "Si lo dejas vacío se generará automáticamente.":
    "If you leave it empty we'll generate it automatically.",
  "Nombre del anuncio": "Ad name",
  "Ej: Variante A - Imagen principal": "e.g. Variant A - Main image",
  "Llamado a la acción": "Call to action",
  "Objetivo de rendimiento": "Performance goal",
  "Cómo mides el éxito de tus anuncios. Se recomienda según el objetivo de la campaña.":
    "How you measure your ads' success. Recommended based on the campaign objective.",
  "Mínimo recomendado: 5.000 {currency}":
    "Recommended minimum: 5,000 {currency}",
  "Usar una landing (opcional)": "Use a landing page (optional)",
  "— Elegir landing publicada —": "— Pick a published landing —",
  "https://tu-sitio.com": "https://your-site.com",
  "Elige una landing arriba o pega tu URL. Vacío = URL de tu marca.":
    "Pick a landing above or paste your URL. Empty = your brand's URL.",
  "Fecha de inicio": "Start date",
  "Fecha de fin (requerida)": "End date (required)",
  "Fecha de fin (opcional)": "End date (optional)",
  "Edad mínima": "Minimum age",
  "Edad máxima": "Maximum age",
  "Crear borrador de campaña": "Create campaign draft",

  // ─── Buscar ads / detalle / adaptar ──────────────────────────────────
  "Encuentra anuncios ganadores para inspirar tu campaña.":
    "Find winning ads to inspire your campaign.",
  "Ej: suplementos naturales, ropa deportiva, café artesanal...":
    "e.g. natural supplements, sportswear, specialty coffee...",
  "Mayor duración": "Longest running",
  "Más recientes": "Newest",
  "Más antiguos": "Oldest",
  "Más relevantes": "Most relevant",
  "Más tiempo activos": "Longest running",
  "¿Prefieres crear tu propio anuncio?": "Prefer to build your own ad?",
  "Sube tus propias imágenes de referencia y describe exactamente lo que necesitas.":
    "Upload your own reference images and describe exactly what you need.",
  "Crear personalizado": "Create custom",
  "Cargar más": "Load more",
  "No se encontraron anuncios para esa búsqueda.":
    "No ads found for that search.",
  "¿No encuentras lo que buscas?": "Can't find what you're looking for?",
  "Crea tu propio anuncio desde cero. Sube una imagen de referencia, tu producto y describe lo que necesitas.":
    "Build your own ad from scratch. Upload a reference image, your product, and describe what you need.",
  "Crear anuncio personalizado": "Create custom ad",
  "Top para tu marca": "Top pick for your brand",
  Live: "Live",
  "Quitar de favoritos": "Remove from favorites",
  "Guardar en favoritos": "Save to favorites",
  "Agregar a favoritos": "Add to favorites",
  "← Volver a resultados": "← Back to results",
  "Volver a buscar": "Back to search",
  "Sin título": "Untitled",
  "Tiempo activo": "Time running",
  "Texto del anuncio": "Ad text",
  "Call to Action": "Call to action",
  Clasificación: "Classification",
  "Categoría de producto": "Product category",
  "Adaptar copy a mi marca": "Adapt copy to my brand",
  "Adaptar copy": "Adapt copy",
  "← Volver al anuncio": "← Back to the ad",
  "Primero necesitas un producto": "You need a product first",
  "Para adaptar el copy a tu marca necesitamos al menos un producto con su información completa. Crea uno y vuelve a este paso.":
    "To adapt the copy to your brand we need at least one product with complete information. Create one and come back to this step.",
  "Adapta el copy de “{headline}” a tu marca.":
    "Adapt the copy of “{headline}” to your brand.",
  "este anuncio": "this ad",
  "Copy original del anuncio": "Original ad copy",
  "Producto a pautar": "Product to advertise",
  "Generar nuevo": "Generate new",
  "Usar copy guardado": "Use saved copy",
  "¿Qué quieres adaptar?": "What do you want to adapt?",
  "Describe en tus palabras qué cambios quieres en el copy. La IA usará estas instrucciones junto con la información de tu marca y producto.":
    "Describe in your own words what you want changed in the copy. The AI combines these instructions with your brand and product information.",
  "Ej: Quiero que el tono sea más juvenil y directo, enfocado en el beneficio de ahorro de tiempo. Menciona que tenemos envío gratis en Colombia.":
    "e.g. I want a younger, more direct tone focused on the time-saving benefit. Mention that we offer free shipping in Colombia.",
  "Adaptando el copy a tu marca…": "Adapting the copy to your brand…",
  "Elige una variante": "Pick a variant",
  "Selecciona la que mejor represente tu marca.":
    "Choose the one that best represents your brand.",
  "Generar imágenes": "Generate images",
  "Copy guardado": "Saved copy",
  "Usar este": "Use this one",
  "Se usará con el producto:": "It will be used with the product:",
  'Aún no has guardado ningún copy. Genera uno y presiona "Guardar".':
    'You haven\'t saved any copy yet. Generate one and press "Save".',
  "¿Eliminar este copy guardado?": "Delete this saved copy?",

  // ─── Generar imágenes ────────────────────────────────────────────────
  "Primero debes adaptar el copy. Vuelve al anuncio.":
    "You need to adapt the copy first. Go back to the ad.",
  "← Volver a variantes": "← Back to variants",
  "Genera creativos publicitarios con IA.":
    "Generate ad creatives with AI.",
  "Copy seleccionado — Variante {n}": "Selected copy — Variant {n}",
  "Imágenes de referencia": "Reference images",
  "La IA usará estas imágenes como base para generar tu creativo.":
    "The AI will use these images as the basis for your creative.",
  "Ad original": "Original ad",
  "Tu producto": "Your product",
  "Dirección creativa de la imagen": "Creative direction for the image",
  "Dirección creativa de la imagen (opcional)":
    "Creative direction for the image (optional)",
  "Describe cómo quieres que se vea tu anuncio. Si lo dejas vacío, la IA replicará el estilo del ad original.":
    "Describe how you want your ad to look. If you leave it empty, the AI will mirror the original ad's style.",
  "Describe cómo quieres que se vea tu anuncio. Si lo dejas vacío, la IA usará un estilo limpio y acorde a tu marca.":
    "Describe how you want your ad to look. If you leave it empty, the AI will use a clean style that matches your brand.",
  "Ej: Fondo blanco minimalista con el producto centrado. Luces tipo estudio profesional. Estilo limpio y moderno.":
    "e.g. Minimal white background with the product centered. Professional studio lighting. Clean, modern style.",
  "Formatos a generar": "Formats to generate",
  "Selecciona al menos uno.": "Select at least one.",
  "Precio (opcional)": "Price (optional)",
  "Ej: $49.900 COP": "e.g. $49,900 COP",
  "Si no pones precio, se eliminará cualquier precio que aparezca en el diseño original.":
    "If you leave the price empty, any price in the original design will be removed.",
  "Continuar a revisión →": "Continue to review →",
  "Regenerar imágenes": "Regenerate images",
  "Generando creativos con IA…": "Generating creatives with AI…",
  "Imágenes generadas": "Generated images",
  "Revisa los creativos. Puedes pedir cambios o generar variantes.":
    "Review the creatives. You can request changes or generate variants.",
  "Editar imagen": "Edit image",
  "Describe qué quieres cambiar. La IA editará la imagen manteniendo el resto intacto.":
    "Describe what you want changed. The AI edits the image and leaves the rest intact.",
  "Formato a editar": "Format to edit",
  "Imagen a editar": "Image to edit",
  "Ej: Quita las maletas del fondo, deja solo mi producto centrado. Cambia el color del banner a azul oscuro.":
    "e.g. Remove the suitcases in the background, leave only my product centered. Change the banner color to dark blue.",
  "Ej: Cambia el fondo a un degradado azul oscuro. Haz el texto más grande.":
    "e.g. Change the background to a dark blue gradient. Make the text bigger.",
  "Aplicar cambios": "Apply changes",
  "Aplicar cambios a los {n} formatos": "Apply changes to all {n} formats",
  "← Volver a generar": "← Back to generating",
  "Generar variantes": "Generate variants",
  "Crear campaña": "Create campaign",
  "Crear campaña (1 anuncio)": "Create campaign (1 ad)",
  "Crear campaña ({n} anuncios)": "Create campaign ({n} ads)",
  "Imagen base aprobada": "Approved base image",
  "Tipo de variantes": "Variant type",
  "Elige hasta {max} tipos de anuncio para el A/B testing. Se genera una variante por tipo, manteniendo tu producto, tu marca y el mismo copy, en cada tamaño que generaste ({formats}).":
    "Pick up to {max} ad types for A/B testing. One variant is generated per type, keeping your product, your brand and the same copy, in every size you generated ({formats}).",
  "Elige al menos un tipo de anuncio": "Pick at least one ad type",
  "Generar {variants} × {formats}": "Generate {variants} × {formats}",
  "1 variante": "1 variant",
  "{n} variantes": "{n} variants",
  "1 tamaño": "1 size",
  "{n} tamaños": "{n} sizes",
  "Generando {n} variantes en {formats}…":
    "Generating {n} variants in {formats}…",
  "Variantes generadas": "Generated variants",
  "Una variante por tipo de anuncio, en cada tamaño que generaste. Selecciona las que quieres usar: cada variante seleccionada se convierte en un anuncio independiente dentro de tu campaña (con todos sus tamaños).":
    "One variant per ad type, in every size you generated. Select the ones you want to use: each selected variant becomes its own ad inside your campaign (with all its sizes).",
  "Tu marca": "Your brand",
  "Se creará 1 anuncio": "1 ad will be created",
  "Se crearán {n} anuncios": "{n} ads will be created",
  "— uno por cada imagen seleccionada ({n} de {total}).":
    "— one per selected image ({n} of {total}).",
  "Selecciona al menos una imagen. Se creará un anuncio por cada una.":
    "Select at least one image. One ad will be created per image.",
  "← Volver a editar": "← Back to editing",
  "Regenerar variantes": "Regenerate variants",

  // ─── Anuncio personalizado ───────────────────────────────────────────
  "← Volver a buscar ads": "← Back to ad search",
  "Para crear un anuncio personalizado necesitamos al menos un producto con su información completa. Crea uno y vuelve a este paso.":
    "To create a custom ad we need at least one product with complete information. Create one and come back to this step.",
  "Genera un creativo nuevo y publícalo como anuncio fresco en el grupo de tu campaña.":
    "Generate a fresh creative and publish it as a new ad in your campaign's ad set.",
  "Describe lo que necesitas y la IA generará el copy e imágenes para tu campaña.":
    "Describe what you need and the AI will generate the copy and images for your campaign.",
  "Paso {step} de {total}: {label}": "Step {step} of {total}: {label}",
  "1. Copy": "1. Copy",
  "2. Variante": "2. Variant",
  "3. Imagen": "3. Image",
  "4. Revisar": "4. Review",
  "Imagen de referencia (opcional)": "Reference image (optional)",
  "Imagen de referencia": "Reference image",
  "Elige hasta 5 tipos de anuncio o sube tu propia imagen como inspiración visual. Cada template define el tipo de anuncio (la IA crea una composición original con tu producto y tu marca, no copia la imagen de ejemplo). Si eliges varios templates, el copy es uno solo y se genera una imagen por template.":
    "Pick up to 5 ad types or upload your own image as visual inspiration. Each template defines the ad type (the AI creates an original composition with your product and brand — it doesn't copy the sample image). If you pick several templates, there's a single copy and one image per template.",
  "Usar un template": "Use a template",
  "Subir nueva": "Upload new",
  "La IA usará esta imagen como inspiración para el estilo visual.":
    "The AI will use this image as inspiration for the visual style.",
  "Elige un copy guardado": "Pick a saved copy",
  "Selecciona el copy que quieres reutilizar, luego configura el producto y la imagen de referencia antes de continuar.":
    "Select the copy you want to reuse, then set the product and reference image before continuing.",
  "Usar este copy": "Use this copy",
  "Cargando copy guardado...": "Loading the saved copy...",
  "Déjalo todo a la IA": "Let the AI handle it",
  "La IA crea el creativo con total libertad a partir de tu producto y de lo que describas. No se usan templates ni el contexto de tu marca (colores, logo, identidad).":
    "The AI creates the creative with full freedom from your product and what you describe. No templates and no brand context (colors, logo, identity) are used.",
  "Describe tu anuncio (obligatorio)": "Describe your ad (required)",
  "Describe tu anuncio (opcional)": "Describe your ad (optional)",
  "En modo “Déjalo todo a la IA” es obligatorio: cuéntale a la IA exactamente el anuncio que quieres (estilo, escena, mensaje, oferta…).":
    "In “Let the AI handle it” mode this is required: tell the AI exactly the ad you want (style, scene, message, offer…).",
  "Complemento opcional: si quieres algo más personalizado para tu template, cuéntale a la IA qué tipo de anuncio quieres. Si lo dejas vacío, la IA se basará en tu producto, marca y template.":
    "Optional extra: if you want something more tailored for your template, tell the AI what kind of ad you want. If you leave it empty, the AI works from your product, brand and template.",
  "Ej: Quiero un anuncio para promocionar nuestro nuevo kit de skincare natural. El tono debe ser fresco y juvenil, enfocado en ingredientes orgánicos. Incluir una oferta de lanzamiento del 20% de descuento.":
    "e.g. I want an ad promoting our new natural skincare kit. The tone should be fresh and young, focused on organic ingredients. Include a 20% launch discount offer.",
  "Idioma del anuncio": "Ad language",
  "Generando copy con IA…": "Generating copy with AI…",
  "Generar copy": "Generate copy",
  "Elige el copy de la imagen": "Pick the on-image copy",
  "Este es el headline y el CTA que irán sobre la imagen. El texto de la publicación (título y descripción) se genera después.":
    "This is the headline and CTA that go on the image. The post text (title and description) is generated afterwards.",
  "Regenerar copy": "Regenerate copy",
  "Continuar con imagen": "Continue to the image",
  "Copy de la imagen — Variante {n}": "On-image copy — Variant {n}",
  "Se generará una imagen por cada template elegido, usando estas referencias.":
    "One image will be generated per chosen template, using these references.",
  "← Cambiar variante": "← Change variant",
  "{n}. {name}": "{n}. {name}",
  "Se generó una imagen por template. Puedes pedir cambios; se publicarán como anuncios.":
    "One image was generated per template. You can request changes; they'll be published as ads.",
  "Texto de la publicación": "Post text",
  "Regenerar texto": "Regenerate text",
  "El título aparece bajo la imagen y la descripción es el texto principal del anuncio. Puedes editarlos.":
    "The title appears under the image and the description is the ad's primary text. You can edit both.",
  "Generando el texto de la publicación…": "Generating the post text…",
  "Titular bajo la imagen": "Headline under the image",
  "Texto principal del anuncio": "The ad's primary text",
  "Pausar el anuncio anterior": "Pause the previous ad",
  "Se publicará como anuncio nuevo en el mismo grupo. Si lo dejas sin pausar, ambos correrán para comparar (A/B).":
    "It will be published as a new ad in the same ad set. If you don't pause the old one, both run so you can compare (A/B).",
  "Regenerar desde cero": "Regenerate from scratch",
  "Configurar variantes": "Configure variants",
  "Genera hasta 10 variantes por formato para A/B testing. Cada variante respeta el tamaño del formato base.":
    "Generate up to 10 variants per format for A/B testing. Each variant keeps the base format's size.",
  "{action} {count} para {format}": "{action} {count} for {format}",
  "Generar para todos los formatos": "Generate for every format",
  "Generando {formats}…": "Generating {formats}…",
  "Selecciona las que quieres usar. Cada imagen seleccionada se convierte en un anuncio independiente dentro de tu campaña.":
    "Select the ones you want to use. Each selected image becomes its own ad inside your campaign.",

  // ─── Videos ──────────────────────────────────────────────────────────
  "Encuentra anuncios en video de la competencia y úsalos como plantilla para tu marca. La IA extrae la estructura del script y la convierte en un template universal con variables para que puedas reusarlo.":
    "Find your competitors' video ads and use them as a template for your brand. The AI extracts the script structure and turns it into a universal template with variables you can reuse.",
  "Palabra clave": "Keyword",
  "Ej: skincare natural, batidos detox, maletas viaje":
    "e.g. natural skincare, detox smoothies, travel luggage",
  "Buscar videos": "Search videos",
  "Buscando videos en Foreplay...": "Searching videos on Foreplay...",
  "No se encontraron videos para esta búsqueda.":
    "No videos found for this search.",
  "Cargando video...": "Loading video...",
  "← Volver a buscar videos": "← Back to video search",
  Transcripción: "Transcript",
  "Estructura del anuncio": "Ad structure",
  "La IA analiza el script del video y extrae su estructura como un template universal neutro. Reemplazás las variables entre [CORCHETES] con tu producto y tenés un anuncio nuevo listo.":
    "The AI analyzes the video script and extracts its structure as a neutral, universal template. Replace the variables in [BRACKETS] with your product and you have a new ad ready.",
  "Analizar con IA": "Analyze with AI",
  "Analizando el video con Gemini... esto puede tardar 30s-1min.":
    "Analyzing the video with Gemini... this can take 30s-1min.",
  "Análisis previo (cacheado).": "Previous analysis (cached).",
  "Análisis recién generado.": "Freshly generated analysis.",
  "Template universal": "Universal template",
  "Estructura neutra del anuncio, lista para copiar y adaptar a tu producto. Las variables entre [CORCHETES] son los puntos que reemplazás con tus propios datos.":
    "The ad's neutral structure, ready to copy and adapt to your product. The variables in [BRACKETS] are the spots you replace with your own details.",
  "Mi template": "My template",
  "Nombre para este template:": "Name for this template:",
  "Guardado como “{name}”.": "Saved as “{name}”.",
  "¿Regenerar el template? Reemplaza el análisis actual.":
    "Regenerate the template? It replaces the current analysis.",
  "Los anuncios y videos que guardaste para inspirarte más tarde.":
    "The ads and videos you saved for inspiration later.",
  "Todos ({count})": "All ({count})",
  "Imágenes ({count})": "Images ({count})",
  "Videos ({count})": "Videos ({count})",
  "Aún no tienes favoritos en esta categoría.":
    "You don't have any favorites in this category yet.",
  "Busca anuncios o videos y toca el corazón para guardarlos aquí.":
    "Search ads or videos and tap the heart to save them here.",
  "Buscar imágenes": "Search images",
  "Tu librería de estructuras de video guardadas. Cada una es un snapshot independiente — regenerar el blueprint original no las afecta.":
    "Your library of saved video structures. Each one is an independent snapshot — regenerating the original blueprint doesn't affect them.",
  "Cargando blueprints guardados...": "Loading saved blueprints...",
  "Aún no tienes blueprints guardados.":
    "You don't have any saved blueprints yet.",
  "Nuevo nombre:": "New name:",
  "¿Eliminar “{name}”?": "Delete “{name}”?",
  "← Volver a videos guardados": "← Back to saved videos",
  "Ver video original →": "View original video →",
  "Guardado el {date}": "Saved on {date}",

  // ─── Landings ────────────────────────────────────────────────────────
  "Crea una landing por avatar para tus campañas. Se publican bajo el dominio de tu tienda Shopify (App Proxy).":
    "Create one landing page per avatar for your campaigns. They're published under your Shopify store's domain (App Proxy).",
  "Nueva landing": "New landing page",
  "Slug (URL)": "Slug (URL)",
  "salud-intestinal": "gut-health",
  "Salud intestinal": "Gut health",
  "Producto Shopify (checkout)": "Shopify product (checkout)",
  "— Sin producto —": "— No product —",
  "Producto de la app (para el copy)": "App product (for the copy)",
  "— Ninguno —": "— None —",
  "Avatar / ángulo (a quién le vendes)": "Avatar / angle (who you're selling to)",
  "Avatar / ángulo": "Avatar / angle",
  "Avatar (etiqueta)": "Avatar (label)",
  "Ej: mujeres con problemas de digestión, cansadas de los polvos verdes de mal sabor":
    "e.g. women with digestive issues, tired of bad-tasting green powders",
  "Ej: mujeres con problemas de digestión, cansadas de los polvos verdes":
    "e.g. women with digestive issues, tired of green powders",
  "Creando y generando…": "Creating and generating…",
  "Crear y generar con IA": "Create and generate with AI",
  "La IA diseña la landing completa con la identidad de tu marca":
    "The AI designs the whole landing page with your brand identity",
  " (15 créditos)": " (15 credits)",
  " Conecta tu tienda en “Tienda Shopify” para elegir un producto.":
    " Connect your store under “Shopify store” to pick a product.",
  "Aún no tienes landings.": "You don't have any landing pages yet.",
  "{count} vistas": "{count} views",
  "{count} clics": "{count} clicks",
  " · {pct}% CTR": " · {pct}% CTR",
  "¿Eliminar la landing “{name}”? No se puede deshacer.":
    "Delete the “{name}” landing page? This can't be undone.",
  "← Landings": "← Landing pages",
  "Vista previa": "Preview",
  "¿Eliminar esta landing? Esta acción no se puede deshacer.":
    "Delete this landing page? This action can't be undone.",
  "Guardado a las {time}.": "Saved at {time}.",
  "URL para tu anuncio:": "URL for your ad:",
  "(publícala para que sea visible)": "(publish it to make it visible)",
  Vistas: "Views",
  "Clics al CTA": "CTA clicks",
  "Generar con IA": "Generate with AI",
  "Describe el avatar/ángulo y la IA **diseña toda la landing** con la identidad de tu marca.":
    "Describe the avatar/angle and the AI **designs the entire landing page** with your brand identity.",
  "Instrucciones extra (opcional)": "Extra instructions (optional)",
  "Tono, ofertas, datos a destacar…": "Tone, offers, data to highlight…",
  "Generar landing": "Generate landing page",
  "Regenerar landing": "Regenerate landing page",
  "SEO título": "SEO title",
  "SEO descripción": "SEO description",
  "HTML de la landing": "Landing page HTML",
  "La IA diseñó esta página completa con la identidad de tu marca. Puedes ajustar el HTML aquí (avanzado) o pulsar “Regenerar landing” arriba. El botón de compra, precio y pixel se inyectan solos — no los toques.":
    "The AI designed this full page with your brand identity. You can tweak the HTML here (advanced) or press “Regenerate landing page” above. The buy button, price and pixel are injected automatically — don't touch them.",
  "Usa “Vista previa” (arriba) para ver el resultado. Recuerda Guardar.":
    "Use “Preview” (above) to see the result. Remember to save.",
  "Colores y logo de la landing. Se toman de tu marca al crearla; ajústalos aquí. (La IA cambia los textos, no estos colores.)":
    "The landing page's colors and logo. They're taken from your brand when it's created; adjust them here. (The AI changes the text, not these colors.)",
  "Color principal (botón)": "Primary color (button)",
  "URL del logo (opcional)": "Logo URL (optional)",
  "https://.../logo.png": "https://.../logo.png",
  "Hero — titular": "Hero — headline",
  "Hero — subtítulo": "Hero — subheadline",
  "Dolor — título": "Pain — title",
  "Dolor — puntos (uno por línea)": "Pain — bullets (one per line)",
  "Beneficios — título": "Benefits — title",
  "Beneficios — “Título :: Descripción” (uno por línea)":
    "Benefits — “Title :: Description” (one per line)",
  "Mecanismo — título": "Mechanism — title",
  "Mecanismo — texto": "Mechanism — body",
  "Testimonios — “Nombre :: Frase” (uno por línea)":
    "Testimonials — “Name :: Quote” (one per line)",
  "Oferta — titular": "Offer — headline",
  "Oferta — nota": "Offer — note",
  "FAQ — “Pregunta :: Respuesta” (una por línea)":
    "FAQ — “Question :: Answer” (one per line)",

  // ─── Públicos ────────────────────────────────────────────────────────
  "Crea públicos en Meta subiendo un CSV con correos de tus clientes. Los datos se hashean (SHA-256) antes de enviarse.":
    "Create Meta audiences by uploading a CSV of your customers' emails. The data is hashed (SHA-256) before being sent.",
  "No hay cuentas publicitarias de Meta conectadas. Conectá Meta primero desde la sección Meta Ads.":
    "No Meta ad accounts connected. Connect Meta first from the Meta Ads section.",
  "+ Crear público": "+ Create audience",
  "Nombre del público": "Audience name",
  "Ej: Clientes VIP Q1 2026": "e.g. VIP customers Q1 2026",
  "Origen de los datos": "Data source",
  "Datos recolectados directo del cliente":
    "Data collected directly from the customer",
  "Datos de un partner / agencia": "Data from a partner / agency",
  Ambos: "Both",
  "Subida enviada a Meta ({count} correos).":
    "Upload sent to Meta ({count} emails).",
  "Total leídos: {total} · Inválidos: {invalid} · Duplicados: {duplicates}. Meta tarda unos minutos en actualizar el tamaño.":
    "Total read: {total} · Invalid: {invalid} · Duplicates: {duplicates}. Meta takes a few minutes to update the size.",
  "Aún no hay públicos en esta cuenta.": "No audiences in this account yet.",
  "Creá el primero con el botón de arriba.":
    "Create the first one with the button above.",
  "Tamaño aprox:": "Approx. size:",
  "Actualizado: {date}": "Updated: {date}",
  "Subir CSV": "Upload CSV",
  "¿Eliminar este público? Esta acción es irreversible en Meta.":
    "Delete this audience? This action is irreversible on Meta.",

  // ─── Analytics ───────────────────────────────────────────────────────
  "Cargando métricas de Meta Ads...": "Loading Meta Ads metrics...",
  "Métricas de tus campañas publicitarias.":
    "Metrics for your ad campaigns.",
  "Aún no hay datos. Publica una campaña para ver métricas.":
    "No data yet. Publish a campaign to see metrics.",
  "Rendimiento de tus campañas en Meta Ads.":
    "Performance of your Meta Ads campaigns.",
  "Gasto total": "Total spend",
  Alcance: "Reach",
  "CTR promedio": "Average CTR",
  "CPC promedio": "Average CPC",
  "CPA promedio": "Average CPA",
  "ROAS global": "Overall ROAS",
  "Totales de 1 campaña filtrada.": "Totals for 1 filtered campaign.",
  "Totales de {count} campañas filtradas.":
    "Totals for {count} filtered campaigns.",
  "Detalle por campaña": "Campaign breakdown",
  CPC: "CPC",
  CPM: "CPM",
  "Freq.": "Freq.",
  CPA: "CPA",
  ROAS: "ROAS",
  Veredicto: "Verdict",
  Sugerencias: "Suggestions",
  "Sin gasto": "No spend",
  Funciona: "Working",
  Revisar: "Review",
  Mejorar: "Needs work",
  "Cargando grupos de anuncios...": "Loading ad sets...",
  "No se encontraron grupos de anuncios.": "No ad sets found.",
  "Cargando anuncios...": "Loading ads...",
  "No se encontraron anuncios.": "No ads found.",
  "Presup.": "Budget",
  "CTR:": "CTR:",
  "≥2% excelente": "≥2% excellent",
  "1-2% aceptable": "1-2% acceptable",
  "<1% mejorar": "<1% needs work",
  "Freq:": "Freq:",
  "≤2 ok": "≤2 ok",
  "2-3.5 atención": "2-3.5 watch it",
  ">3.5 fatiga": ">3.5 fatigue",
  "CPA:": "CPA:",
  "≤$20 bueno": "≤$20 good",
  "$20-50 medio": "$20-50 average",
  ">$50 caro": ">$50 expensive",
  "ROAS:": "ROAS:",
  "≥3x premium": "≥3x premium",
  "1.5-3x sostiene": "1.5-3x sustainable",
  "<1.5x pierde": "<1.5x losing money",
  "la campaña": "the campaign",
  "el grupo de anuncios": "the ad set",
  "el anuncio": "the ad",
  "Reactivar campaña": "Reactivate campaign",
  "Pausar grupo": "Pause ad set",
  "Reactivar grupo": "Reactivate ad set",
  "Pausar anuncio": "Pause ad",
  "Reactivar anuncio": "Reactivate ad",
  "Pausar urgente": "Pause urgently",
  "Llevas {spend} sin un solo clic. Pausa {entity} y revisa segmentación/creativo antes de seguir gastando.":
    "You've spent {spend} without a single click. Pause {entity} and review targeting/creative before spending more.",
  "Refresca los creativos": "Refresh the creatives",
  "Frecuencia de {freq} indica fatiga de audiencia. Cambia la imagen o el copy para evitar quemar la audiencia.":
    "A frequency of {freq} means audience fatigue. Change the image or the copy to avoid burning the audience.",
  "Pausar mientras refrescas": "Pause while you refresh",
  "Considera pausar {entity} hasta tener creativos nuevos para no seguir gastando con CTR caído.":
    "Consider pausing {entity} until you have new creatives, so you stop spending with a dropping CTR.",
  "CTR bajo": "Low CTR",
  "CTR de {ctr}% es bajo. Pausa o reduce presupuesto y revisa el creativo/audiencia.":
    "A CTR of {ctr}% is low. Pause or lower the budget and review the creative/audience.",
  "Bajar presupuesto a {amount}": "Lower the budget to {amount}",
  "Reducir el gasto diario un 40% mientras pruebas variantes. (Actual: {current}/día)":
    "Cut daily spend by 40% while you test variants. (Currently: {current}/day)",
  "Subir presupuesto a {amount}": "Raise the budget to {amount}",
  "CTR {ctr}% y frecuencia {freq} indican que rinde y aún hay margen. Sube +20% para escalar sin sobrecargar. (Actual: {current}/día)":
    "A {ctr}% CTR and {freq} frequency show it's performing with room to spare. Raise it +20% to scale without overloading. (Currently: {current}/day)",
  "{name} estaba pausado con CTR {ctr}% y frecuencia {freq}. Vale la pena reactivarlo.":
    "{name} was paused with a {ctr}% CTR and {freq} frequency. It's worth reactivating.",
  "Sugerencias para {name}": "Suggestions for {name}",
  "¿Pausar “{name}”?": "Pause “{name}”?",
  "¿Reactivar “{name}”?": "Reactivate “{name}”?",
  "Nuevo presupuesto diario para “{name}” (USD):":
    "New daily budget for “{name}” (USD):",
  "Subir presupuesto": "Raise budget",
  "Bajar presupuesto": "Lower budget",
  Pausar: "Pause",
  Reactivar: "Reactivate",

  // ─── Planes y créditos ───────────────────────────────────────────────
  "Los créditos se consumen al generar copys, imágenes y análisis de video. Publicar campañas en Meta es gratis.":
    "Credits are spent generating copy, images and video analysis. Publishing campaigns to Meta is free.",
  "Plan actual:": "Current plan:",
  " (incluye {count} comprados)": " (includes {count} purchased)",
  "Cancelar suscripción": "Cancel subscription",
  "Al cancelar conservas los créditos que ya pagaste.":
    "If you cancel you keep the credits you've already paid for.",
  "¿Cancelar tu suscripción? Conservas los créditos que ya pagaste.":
    "Cancel your subscription? You keep the credits you've already paid for.",
  "¡Pago confirmado! Tus créditos se actualizan en unos segundos.":
    "Payment confirmed! Your credits update in a few seconds.",
  "¡Suscripción autorizada! Tus créditos se acreditan cuando Mercado Pago confirma el primer cobro (suele tardar unos segundos).":
    "Subscription authorized! Your credits are added once Mercado Pago confirms the first charge (usually a few seconds).",
  "Tu pago está en proceso. Los créditos se acreditan cuando Mercado Pago lo apruebe.":
    "Your payment is processing. Credits are added once Mercado Pago approves it.",
  "Operación cancelada. No se cobró nada.":
    "Operation cancelled. Nothing was charged.",
  Suscripciones: "Subscriptions",
  "Facturación anual: pagas una vez al año y ahorras {pct}%.":
    "Annual billing: you pay once a year and save {pct}%.",
  "**Sin permanencia.** Pago seguro con Mercado Pago · cancela cuando quieras · conservas los créditos que ya pagaste.":
    "**No lock-in.** Secure payment with Mercado Pago · cancel any time · you keep the credits you've paid for.",
  Actual: "Current",
  "{usd} USD/año · ≈ {cop}": "{usd} USD/year · ≈ {cop}",
  "≈ {cop}/mes": "≈ {cop}/month",
  "Plan actual": "Current plan",
  Gratis: "Free",
  Suscribirme: "Subscribe",
  "Precios en USD; se cobra en pesos a la tasa TRM del día. Pago seguro procesado por Mercado Pago. La suscripción se renueva automáticamente {period}; puedes cancelarla cuando quieras.":
    "Prices in USD; charged in Colombian pesos at the day's TRM rate. Payment securely processed by Mercado Pago. The subscription renews automatically {period}; you can cancel it any time.",
  "cada año": "every year",
  "cada mes": "every month",
  "Packs de créditos": "Credit packs",
  "¿Te quedaste corto este mes? Compra créditos extra que no caducan.":
    "Ran short this month? Buy extra credits that never expire.",
  "se cobra {amount}": "charged as {amount}",
  "{count} créditos · no caducan": "{count} credits · never expire",
  "Te quedaste sin créditos": "You're out of credits",
  "Esta acción necesita {required} créditos y te quedan {available}.":
    "This action needs {required} credits and you have {available} left.",
  "No tienes créditos suficientes para esta acción.":
    "You don't have enough credits for this action.",
  "Sube de plan o compra un paquete de créditos para continuar.":
    "Upgrade your plan or buy a credit pack to continue.",
  "Ver planes y créditos": "See plans and credits",
  "Ahora no": "Not now",

  // ─── Costos de IA (admin) ────────────────────────────────────────────
  "Costos de IA": "AI costs",
  "Gasto real en Gemini por usuario y por servicio, en USD (lo que cobra Google) y su equivalente en pesos colombianos a {rate} COP/USD{source}.":
    "Actual Gemini spend per user and per service, in USD (what Google charges) and its equivalent in Colombian pesos at {rate} COP/USD{source}.",
  " (TRM {date})": " (TRM {date})",
  " (tasa de respaldo)": " (fallback rate)",
  "Costo total": "Total cost",
  "Costo tokens": "Token cost",
  "Costo grounding": "Grounding cost",
  Llamadas: "Calls",
  "Tokens totales": "Total tokens",
  "Costo por modelo": "Cost by model",
  "Costo por usuario": "Cost by user",
  "Costo por servicio": "Cost by service",
  "No hay consumo registrado en este rango.":
    "No usage recorded in this range.",
  "Haz clic en un usuario para ver su desglose por servicio.":
    "Click a user to see their per-service breakdown.",
  Modelo: "Model",
  Usuario: "User",
  Servicio: "Service",
  Costo: "Cost",
  Tokens: "Tokens",
  "Tokens entrada": "Input tokens",
  "Tokens texto sal.": "Output text tokens",
  "Tokens img sal.": "Output image tokens",
  Grounding: "Grounding",
  "Cargando desglose…": "Loading breakdown…",
  "Sin consumo en este rango.": "No usage in this range.",
  "Desglose por servicio": "Breakdown by service",
  "Copy (texto de anuncios)": "Copy (ad text)",
  "Análisis de video": "Video analysis",
  "Análisis de web (marca)": "Website analysis (brand)",
  "Análisis de logo": "Logo analysis",
  "Generación de imágenes": "Image generation",
  "Edición de imágenes": "Image editing",
  "Variantes de imagen": "Image variants",
  "Imágenes personalizadas": "Custom images",

  // ─── Progreso de IA ──────────────────────────────────────────────────
  "Esto suele tardar ~{estimate}s · {elapsed}s":
    "This usually takes ~{estimate}s · {elapsed}s",
  "Tardando un poco más de lo normal… {elapsed}s":
    "Taking a little longer than usual… {elapsed}s",
};
