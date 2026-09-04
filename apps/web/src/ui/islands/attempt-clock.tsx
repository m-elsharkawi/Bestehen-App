"use client";

import { useEffect, useState } from "react";
import { startClockObservation } from "./clock-observation";

export function AttemptClockIsland({
  startedAt,
  attemptId,
}: {
  readonly startedAt: string;
  readonly attemptId: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  useEffect(() => {
    return startClockObservation(attemptId, startedAt, (value, recovery) => {
      setElapsed(value);
      setInterrupted(recovery);
    });
  }, [attemptId, startedAt]);
  const minutes = Math.floor(elapsed / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1_000);
  return (
    <>
      <p aria-live="off" data-attempt-clock="observation-only">
        Elapsed time {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      <p role="status">
        {interrupted
          ? "Timing continuity needs review. Your work is preserved and can continue as practice."
          : ""}
      </p>
    </>
  );
}
