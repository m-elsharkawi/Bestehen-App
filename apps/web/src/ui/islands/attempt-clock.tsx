"use client";

import { useEffect, useState } from "react";

export function AttemptClockIsland({ startedAt }: { readonly startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.max(0, Date.now() - new Date(startedAt).getTime()));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [startedAt]);
  const minutes = Math.floor(elapsed / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1_000);
  return (
    <p aria-live="off" data-attempt-clock="observation-only">
      Elapsed time {minutes}:{seconds.toString().padStart(2, "0")}
    </p>
  );
}
