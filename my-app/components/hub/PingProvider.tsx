"use client";

import { useEffect } from "react";

/** Sender ett ping hvert minutt for å holde last_seen oppdatert */
export function PingProvider() {
  useEffect(() => {
    const ping = () => fetch("/api/ping", { method: "POST" }).catch(() => {});
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
