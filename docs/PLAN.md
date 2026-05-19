# Plan: OneClickIA Frontend â€” Next.js 16

## Contexto

El backend de OneClickIA estÃ¡ 100% completo (8 fases). Ahora necesitamos el frontend que conecte con la API REST existente. El diseÃ±o estÃ¡ basado en el sistema de Zapier (DESIGN.md ya copiado al proyecto). El proyecto Next.js 16.2.3 ya fue creado en `D:\Github\oneclickia-frontend` con React 19, Tailwind CSS 4, TypeScript y App Router.

**Usuario target:** emprendedores sin experiencia en marketing. La UI debe ser cÃ¡lida, simple y guiada.

---

## Estructura de Rutas

```
src/
  proxy.ts                              # Auth guard (Next.js 16: proxy reemplaza middleware)
  app/
    layout.tsx                           # Root: Inter font, cream canvas, AuthProvider
    globals.css                          # Tailwind 4 @theme inline con tokens OneClickIA

    (auth)/                              # Grupo: pÃ¡ginas pÃºblicas, sin sidebar
      layout.tsx                         # Card centrada sobre cream canvas
      login/page.tsx                     # Email â†’ request magic link
      verify/page.tsx                    # ?token= â†’ /auth/verify â†’ guarda JWT â†’ redirect
      check-email/page.tsx               # "Revisa tu inbox"

    (onboarding)/                        # Grupo: autenticado pero sin onboarding
      layout.tsx                         # Logo + indicador de progreso
      onboarding/page.tsx                # Form: nombre + logo + website URL

    (dashboard)/                         # Grupo: autenticado + onboarded
      layout.tsx                         # Sidebar + top bar
      page.tsx                           # Home â†’ redirige a /ads/search
      brand/page.tsx                     # Ver/editar perfil de marca
      meta/page.tsx                      # ConexiÃ³n Meta: status, connect, disconnect
      meta/callback/page.tsx             # OAuth callback handler
      ads/
        search/page.tsx                  # Buscar ads ganadores (Foreplay)
        [cachedAdId]/
          page.tsx                       # Detalle del ad + botÃ³n "Adaptar copy"
          adapt/page.tsx                 # Upload producto, adaptar copy, elegir variante
          generate/page.tsx              # Generar imÃ¡genes, preview formatos
      campaigns/
        page.tsx                         # Lista de campaÃ±as con badges de status
        new/page.tsx                     # Form: crear draft (targeting, budget, schedule)
        [id]/page.tsx                    # Detalle campaÃ±a: publish/activate/pause

    api/auth/
      set-cookie/route.ts               # Route handler: set/clear httpOnly cookie
```

---

## Componentes

### Primitivos UI (`src/components/ui/`)
- `Button.tsx` â€” variantes: primary (naranja), dark, ghost, pill. Props: variant, size, loading, disabled
- `Input.tsx` â€” border sand, focus naranja. Props: label, error, helperText
- `Textarea.tsx` â€” misma estÃ©tica que Input
- `Select.tsx` â€” dropdown estilizado
- `FileUpload.tsx` â€” drop zone con border sand, preview thumbnail
- `Badge.tsx` â€” status badges: DRAFT (sand), ACTIVE (verde), PAUSED (muted), ERROR (rojo)
- `Card.tsx` â€” cream bg, 1px solid #c5c0b1, 5px radius, sin shadow
- `Modal.tsx` â€” overlay oscuro, contenido tipo card
- `Spinner.tsx` â€” loading indicator naranja
- `Tabs.tsx` â€” tabs con inset box-shadow underline (naranja activo)

### Compuestos (`src/components/`)
- `Sidebar.tsx` â€” nav del dashboard: Buscar Ads, CampaÃ±as, Marca, Meta
- `TopBar.tsx` â€” logo OneClickIA + email usuario + logout
- `AdCard.tsx` â€” card de resultado Foreplay: imagen, headline, brand, plataforma
- `AdGallery.tsx` â€” grid de AdCards + "Cargar mÃ¡s" (cursor)
- `CopyVariantPicker.tsx` â€” 3 variantes seleccionables con headline, description, CTA
- `ImageFormatPreview.tsx` â€” preview de imÃ¡genes generadas feed/vertical/story
- `CampaignForm.tsx` â€” form multi-secciÃ³n para draft de campaÃ±a
- `InterestAutocomplete.tsx` â€” bÃºsqueda debounced de intereses Meta
- `CountryPicker.tsx` â€” multi-select de paÃ­ses
- `CampaignStatusBadge.tsx` â€” badge con colores por status de campaÃ±a

---

## API Client & Auth

### `src/lib/api.ts`
- Wrapper sobre `fetch` nativo (sin Axios â€” 0 dependencias extra)
- Lee JWT de `localStorage`, lo envÃ­a como `Authorization: Bearer`
- Auto-redirect a `/login` si recibe 401
- Maneja FormData (no setea Content-Type para que el browser ponga el boundary)
- MÃ©todos: `get<T>`, `post<T>`, `patch<T>`, `delete<T>`

### `src/lib/types.ts`
- Interfaces TypeScript que espejan los modelos del backend: User, Brand, CachedAd, CopyVariant, GeneratedAdImage, Campaign, MetaAdAccount, MetaPage, etc.

### Auth Flow
1. Login: email â†’ `POST /auth/request-magic-link` â†’ check-email screen
2. Click magic link â†’ `/verify?token=xxx` â†’ `GET /auth/verify?token=xxx`
3. Guarda token en localStorage + httpOnly cookie (vÃ­a Route Handler)
4. `proxy.ts` chequea cookie para redirect: sin cookie â†’ `/login`, con cookie + sin onboarding â†’ `/onboarding`
5. Logout: borra localStorage + cookie vÃ­a Route Handler â†’ `/login`

### `src/contexts/AuthContext.tsx`
- Client component, wrappea layouts autenticados
- Lee token de localStorage, valida con `GET /auth/me`
- Expone: `{ user, token, isLoading, logout }`

---

## State Management

**Sin librerÃ­a externa.** React 19 context + useState + custom hooks.

### Hooks (`src/hooks/`)
- `useAuth()` â€” del AuthContext
- `useBrand()` â€” GET /brand
- `useOnboardingStatus()` â€” GET /onboarding/status
- `useMetaStatus()` â€” GET /connections/meta/status
- `useAdAccounts()` â€” GET /connections/meta/ad-accounts
- `usePages()` â€” GET /connections/meta/pages
- `useAdsSearch()` â€” POST /ads/search con state de resultados
- `useCampaigns()` â€” GET /campaigns
- `useCampaign(id)` â€” GET /campaigns/:id
- `useCampaignDefaults()` â€” GET /campaigns/defaults

---

## Fases de ImplementaciÃ³n

### Fase 1: Foundation
**Objetivo:** App corriendo con design system, rutas y layouts.
- `globals.css` con tokens OneClickIA (colores, Inter font)
- Root `layout.tsx` con Inter
- Layouts de los 3 grupos: (auth), (onboarding), (dashboard)
- Componentes UI: Button, Input, Card, Spinner, Badge
- PÃ¡ginas placeholder para todas las rutas
- `next.config.ts`: port 3001, images remotePatterns para backend

**VerificaciÃ³n:** Navegar entre grupos, ver layouts correctos, componentes UI renderizando.

### Fase 2: Auth Flow
**Objetivo:** Login con magic link funcional end-to-end.
- `src/lib/api.ts` â€” API client
- `src/lib/types.ts` â€” interfaces TypeScript
- `src/proxy.ts` â€” guard de rutas
- `src/app/api/auth/set-cookie/route.ts`
- `src/contexts/AuthContext.tsx`
- Login, verify, check-email pages completas

**VerificaciÃ³n:** Pedir magic link, verificar token, sesiÃ³n persistente al refresh, logout.

### Fase 3: Onboarding
**Objetivo:** Nuevo usuario completa onboarding.
- `FileUpload.tsx`
- PÃ¡gina de onboarding con form: nombre + logo + URL
- Hook `useOnboardingStatus`

**VerificaciÃ³n:** Usuario nuevo â†’ redirect a onboarding â†’ completar form â†’ redirect a dashboard.

### Fase 4: Brand + Meta
**Objetivo:** Ver/editar marca, conectar Meta.
- Brand page (ver + editar)
- Meta page (connect/disconnect/status)
- Meta OAuth callback page

**VerificaciÃ³n:** Editar marca, conectar cuenta Meta vÃ­a OAuth.

### Fase 5: Buscar Ads
**Objetivo:** Buscar y explorar ads ganadores.
- Search page con filtros
- AdCard, AdGallery, SearchFilters
- PaginaciÃ³n con cursor

**VerificaciÃ³n:** Buscar ads, aplicar filtros, paginar, ver detalles.

### Fase 6: Copy + ImÃ¡genes
**Objetivo:** Adaptar copy y generar imÃ¡genes.
- Ad detail page
- Adapt page (upload producto, ver variantes)
- Generate page (preview formatos)
- CopyVariantPicker, ImageFormatPreview

**VerificaciÃ³n:** Seleccionar ad â†’ adaptar copy â†’ elegir variante â†’ generar imÃ¡genes â†’ ver preview.

### Fase 7: CampaÃ±as
**Objetivo:** Crear y gestionar campaÃ±as Meta.
- Campaign list, new, detail pages
- CampaignForm con InterestAutocomplete, CountryPicker
- Publish, activate, pause actions

**VerificaciÃ³n:** Flujo completo: buscar â†’ adaptar â†’ generar â†’ crear draft â†’ publicar â†’ activar/pausar.

### Fase 8: Polish
- Error boundaries, loading states, 404 custom
- Responsive (breakpoints del DESIGN.md)
- Empty states, toasts de feedback

---

## Decisiones Clave

1. **`proxy.ts` no `middleware.ts`** â€” Next.js 16 renombrÃ³ la convenciÃ³n
2. **Client Components para todo lo data-dependent** â€” el backend es API REST externa con JWT, SSR no aporta beneficio aquÃ­
3. **fetch nativo, sin Axios** â€” 0 dependencias, suficiente para todo incluyendo multipart
4. **Token dual** â€” localStorage para API calls del cliente, httpOnly cookie para proxy redirects
5. **Sin Redux/Zustand** â€” React context + hooks custom es suficiente para este scope
6. **Componentes flat** â€” `components/ui/` para primitivos, `components/` para dominio. Sin nesting profundo
7. **Puerto 3001** â€” el backend corre en 3000
