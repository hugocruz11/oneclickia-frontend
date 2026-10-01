const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Stable backend error code (projects module), e.g. "DEPENDENCY_CYCLE". */
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** localStorage key of the active organization (projects module). */
export const ORG_STORAGE_KEY = "oneclickia_org";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Bearer + active org headers for raw fetches (downloads, SSE streams). */
export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("oneclickia_token");
  const orgId = localStorage.getItem(ORG_STORAGE_KEY);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (orgId) headers["X-Org-Id"] = orgId;
  return headers;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("oneclickia_token");
    }
    return null;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Active organization for the projects module (ignored elsewhere).
    const orgId =
      typeof window !== "undefined"
        ? localStorage.getItem(ORG_STORAGE_KEY)
        : null;
    if (orgId && !headers["X-Org-Id"]) {
      headers["X-Org-Id"] = orgId;
    }

    // Don't set Content-Type for FormData — browser sets boundary automatically
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Error en la solicitud" }));
      const rawMessage = error.message ?? "Error en la solicitud";
      // NestJS ValidationPipe returns message as string[] — flatten it.
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(". ")
        : String(rawMessage);

      // 402 Payment Required = the user ran out of credits. Broadcast a
      // global event so the CreditsProvider can pop the "out of credits"
      // modal, without a hard redirect that would lose in-progress work.
      // The ApiError still bubbles up so the calling page can react too.
      if (res.status === 402 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("oneclickia:insufficient-credits", { detail: error }),
        );
      }

      // 401 on a non-auth endpoint = session expired. Clear the token
      // and bounce to /login so the user can re-authenticate. For auth
      // endpoints (login/register) we let the error bubble up so the
      // form can show the backend's message in place.
      if (
        res.status === 401 &&
        !path.startsWith("/auth/") &&
        typeof window !== "undefined"
      ) {
        localStorage.removeItem("oneclickia_token");
        // Also clear the httpOnly cookie the proxy reads. Otherwise the
        // proxy still thinks we're logged in and bounces us between the
        // app and /login with a stale session.
        await fetch("/api/auth/set-cookie", { method: "DELETE" }).catch(
          () => {},
        );
        window.location.href = "/login";
      }

      throw new ApiError(
        res.status,
        message,
        typeof error.code === "string" ? error.code : undefined,
      );
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
