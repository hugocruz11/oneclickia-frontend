/**
 * `?next=` destination after login/register. Only internal invite links
 * are allowed (prevents open redirects).
 */
export function safeNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^\/invite\/[A-Za-z0-9_-]+$/.test(next) ? next : null;
}
