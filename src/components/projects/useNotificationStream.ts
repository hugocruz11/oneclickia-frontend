"use client";

import { useEffect, useRef } from "react";
import { apiUrl, authHeaders } from "@/lib/api";

const MAX_BACKOFF_MS = 30_000;
const FAILURES_BEFORE_POLLING = 3;
const POLL_MS = 60_000;
const RETRY_STREAM_MS = 5 * 60_000;

/**
 * Live notification signals via SSE consumed with fetch (so the Bearer
 * header can be sent). Reconnects with backoff; after repeated failures
 * falls back to polling and retries the stream every 5 minutes.
 * `onSignal` is called for every new notification (and on each poll).
 */
export function useNotificationStream(enabled: boolean, onSignal: () => void) {
  const callback = useRef(onSignal);
  useEffect(() => {
    callback.current = onSignal;
  }, [onSignal]);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let controller: AbortController | null = null;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const schedule = (fn: () => void, ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };

    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => callback.current(), POLL_MS);
    };
    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    };

    async function connect() {
      if (stopped) return;
      controller = new AbortController();
      try {
        const res = await fetch(apiUrl("/notifications/stream"), {
          headers: { ...authHeaders(), Accept: "text/event-stream" },
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
        failures = 0;
        stopPolling();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) >= 0) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const event = /^event: ?(.*)$/m.exec(chunk)?.[1]?.trim();
            if (event === "notification") callback.current();
          }
        }
        throw new Error("stream closed");
      } catch {
        if (stopped) return;
        failures++;
        if (failures >= FAILURES_BEFORE_POLLING) {
          startPolling();
          schedule(() => {
            failures = 0;
            void connect();
          }, RETRY_STREAM_MS);
        } else {
          schedule(() => void connect(), Math.min(1000 * 2 ** failures, MAX_BACKOFF_MS));
        }
      }
    }

    void connect();
    return () => {
      stopped = true;
      controller?.abort();
      if (timer) clearTimeout(timer);
      stopPolling();
    };
  }, [enabled]);
}
