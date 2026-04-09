# Plan: Movity Frontend — Next.js 16

## Contexto

El backend de Movity está 100% completo (8 fases). Ahora necesitamos el frontend que conecte con la API REST existente. El diseño está basado en el sistema de Zapier (DESIGN.md ya copiado al proyecto). El proyecto Next.js 16.2.3 ya fue creado en `D:\Github\movity-frontend` con React 19, Tailwind CSS 4, TypeScript y App Router.

**Usuario target:** emprendedores sin experiencia en marketing. La UI debe ser cálida, simple y guiada.

---

## Estructura de Rutas

```
src/
  proxy.ts                              # Auth guard (Next.js 16: proxy reemplaza middleware)
  app/
    layout.tsx                           # Root: Inter font, cream canvas, AuthProvider
    globals.css                          # Tailwind 4 @theme inline con tokens Movity

    (auth)/                              # Grupo: páginas públicas, sin sidebar
      layout.tsx                         # Card centrada sobre cream canvas
      login/page.tsx                     # Email → request magic link
      verify/page.tsx                    # ?token= → /auth/verify → guarda JWT → redirect
      check-email/page.tsx               # "Revisa tu inbox"

    (onboarding)/                        # Grupo: autenticado pero sin onboarding
      layout.tsx                         # Logo + indicador de progreso
      onboarding/page.tsx                # Form: nombre + logo + website URL

    (dashboard)/                         # Grupo: autenticado + onboarded
      layout.tsx                         # Sidebar + top bar
      page.tsx                           # Home → redirige a /ads/search
      brand/page.tsx                     # Ver/editar perfil de marca
      meta/page.tsx                      # Conexión Meta: status, connect, disconnect
      meta/callback/page.tsx             # OAuth callback handler
      ads/
        search/page.tsx                  # Buscar ads ganadores (Foreplay)
        [cachedAdId]/
          page.tsx                       # Detalle del ad + botón "Adaptar copy"
          adapt/page.tsx                 # Upload producto, adaptar copy, elegir variante
          generate/page.tsx              # Generar imágenes, preview formatos
      campaigns/
        page.tsx                         # Lista de campañas con badges de status
        new/page.tsx                     # Form: crear draft (targeting, budget, schedule)
        [id]/page.tsx                    # Detalle campaña: publish/activate/pause

    api/auth/
      set-cookie/route.ts               # Route handler: set/clear httpOnly cookie
```

---

## Componentes

### Primitivos UI (`src/components/ui/`)
- `Button.tsx` — variantes: primary (naranja), dark, ghost, pill. Props: variant, size, loading, disabled
- `Input.tsx` — border sand, focus naranja. Props: label, error, helperText
- `Textarea.tsx` — misma estética que Input
- `Select.tsx` — dropdown estilizado
- `FileUpload.tsx` — drop zone con border sand, preview thumbnail
- `Badge.tsx` — status badges: DRAFT (sand), ACTIVE (verde), PAUSED (muted), ERROR (rojo)
- `Card.tsx` — cream bg, 1px solid #c5c0b1, 5px radius, sin shadow
- `Modal.tsx` — overlay oscuro, contenido tipo card
- `Spinner.tsx` — loading indicator naranja
- `Tabs.tsx` — tabs con inset box-shadow underline (naranja activo)

### Compuestos (`src/components/`)
- `Sidebar.tsx` — nav del dashboard: Buscar Ads, Campañas, Marca, Meta
- `TopBar.tsx` — logo Movity + email usuario + logout
- `AdCard.tsx` — card de resultado Foreplay: imagen, headline, brand, plataforma
- `AdGallery.tsx` — grid de AdCards + "Cargar más" (cursor)
- `CopyVariantPicker.tsx` — 3 variantes seleccionables con headline, description, CTA
- `ImageFormatPreview.tsx` — preview de imágenes generadas feed/vertical/story
- `CampaignForm.tsx` — form multi-sección para draft de campaña
- `InterestAutocomplete.tsx` — búsqueda debounced de intereses Meta
- `CountryPicker.tsx` — multi-select de países
- `CampaignStatusBadge.tsx` — badge con colores por status de campaña

---

## API Client & Auth

### `src/lib/api.ts`
- Wrapper sobre `fetch` nativo (sin Axios — 0 dependencias extra)
- Lee JWT de `localStorage`, lo envía como `Authorization: Bearer`
- Auto-redirect a `/login` si recibe 401
- Maneja FormData (no setea Content-Type para que el browser ponga el boundary)
- Métodos: `get<T>`, `post<T>`, `patch<T>`, `delete<T>`

### `src/lib/types.ts`
- Interfaces TypeScript que espejan los modelos del backend: User, Brand, CachedAd, CopyVariant, GeneratedAdImage, Campaign, MetaAdAccount, MetaPage, etc.

### Auth Flow
1. Login: email → `POST /auth/request-magic-link` → check-email screen
2. Click magic link → `/verify?token=xxx` → `GET /auth/verify?token=xxx`
3. Guarda token en localStorage + httpOnly cookie (vía Route Handler)
4. `proxy.ts` chequea cookie para redirect: sin cookie → `/login`, con cookie + sin onboarding → `/onboarding`
5. Logout: borra localStorage + cookie vía Route Handler → `/login`

### `src/contexts/AuthContext.tsx`
- Client component, wrappea layouts autenticados
- Lee token de localStorage, valida con `GET /auth/me`
- Expone: `{ user, token, isLoading, logout }`

---

## State Management

**Sin librería externa.** React 19 context + useState + custom hooks.

### Hooks (`src/hooks/`)
- `useAuth()` — del AuthContext
- `useBrand()` — GET /brand
- `useOnboardingStatus()` — GET /onboarding/status
- `useMetaStatus()` — GET /connections/meta/status
- `useAdAccounts()` — GET /connections/meta/ad-accounts
- `usePages()` — GET /connections/meta/pages
- `useAdsSearch()` — POST /ads/search con state de resultados
- `useCampaigns()` — GET /campaigns
- `useCampaign(id)` — GET /campaigns/:id
- `useCampaignDefaults()` — GET /campaigns/defaults

---

## Fases de Implementación

### Fase 1: Foundation
**Objetivo:** App corriendo con design system, rutas y layouts.
- `globals.css` con tokens Movity (colores, Inter font)
- Root `layout.tsx` con Inter
- Layouts de los 3 grupos: (auth), (onboarding), (dashboard)
- Componentes UI: Button, Input, Card, Spinner, Badge
- Páginas placeholder para todas las rutas
- `next.config.ts`: port 3001, images remotePatterns para backend

**Verificación:** Navegar entre grupos, ver layouts correctos, componentes UI renderizando.

### Fase 2: Auth Flow
**Objetivo:** Login con magic link funcional end-to-end.
- `src/lib/api.ts` — API client
- `src/lib/types.ts` — interfaces TypeScript
- `src/proxy.ts` — guard de rutas
- `src/app/api/auth/set-cookie/route.ts`
- `src/contexts/AuthContext.tsx`
- Login, verify, check-email pages completas

**Verificación:** Pedir magic link, verificar token, sesión persistente al refresh, logout.

### Fase 3: Onboarding
**Objetivo:** Nuevo usuario completa onboarding.
- `FileUpload.tsx`
- Página de onboarding con form: nombre + logo + URL
- Hook `useOnboardingStatus`

**Verificación:** Usuario nuevo → redirect a onboarding → completar form → redirect a dashboard.

### Fase 4: Brand + Meta
**Objetivo:** Ver/editar marca, conectar Meta.
- Brand page (ver + editar)
- Meta page (connect/disconnect/status)
- Meta OAuth callback page

**Verificación:** Editar marca, conectar cuenta Meta vía OAuth.

### Fase 5: Buscar Ads
**Objetivo:** Buscar y explorar ads ganadores.
- Search page con filtros
- AdCard, AdGallery, SearchFilters
- Paginación con cursor

**Verificación:** Buscar ads, aplicar filtros, paginar, ver detalles.

### Fase 6: Copy + Imágenes
**Objetivo:** Adaptar copy y generar imágenes.
- Ad detail page
- Adapt page (upload producto, ver variantes)
- Generate page (preview formatos)
- CopyVariantPicker, ImageFormatPreview

**Verificación:** Seleccionar ad → adaptar copy → elegir variante → generar imágenes → ver preview.

### Fase 7: Campañas
**Objetivo:** Crear y gestionar campañas Meta.
- Campaign list, new, detail pages
- CampaignForm con InterestAutocomplete, CountryPicker
- Publish, activate, pause actions

**Verificación:** Flujo completo: buscar → adaptar → generar → crear draft → publicar → activar/pausar.

### Fase 8: Polish
- Error boundaries, loading states, 404 custom
- Responsive (breakpoints del DESIGN.md)
- Empty states, toasts de feedback

---

## Decisiones Clave

1. **`proxy.ts` no `middleware.ts`** — Next.js 16 renombró la convención
2. **Client Components para todo lo data-dependent** — el backend es API REST externa con JWT, SSR no aporta beneficio aquí
3. **fetch nativo, sin Axios** — 0 dependencias, suficiente para todo incluyendo multipart
4. **Token dual** — localStorage para API calls del cliente, httpOnly cookie para proxy redirects
5. **Sin Redux/Zustand** — React context + hooks custom es suficiente para este scope
6. **Componentes flat** — `components/ui/` para primitivos, `components/` para dominio. Sin nesting profundo
7. **Puerto 3001** — el backend corre en 3000
