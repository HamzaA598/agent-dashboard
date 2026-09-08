"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AutoRefresherParams {
  durationMs?: number;
  enabled: boolean;
}

export function AutoRefresher({ durationMs, enabled }: AutoRefresherParams) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      router.refresh();
    }, durationMs ?? 5000);

    return () => clearInterval(id);
  }, [router, durationMs, enabled]);

  return null;
}
