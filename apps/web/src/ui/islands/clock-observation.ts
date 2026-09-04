import type { ClockObservation } from "./objective-continuity";

const observations = new Map<string, ClockObservation>();
export const readClockObservation = (attemptId: string) => observations.get(attemptId);

export function startClockObservation(
  attemptId: string,
  startedAt: string,
  changed: (elapsed: number, interrupted: boolean) => void,
) {
  const monotonicStart = performance.now();
  const wallStart = Date.now();
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  let last = monotonicStart;
  let visibilityChanges = document.hidden ? 1 : 0;
  const stallIntervals: { startedAtMs: number; endedAtMs: number }[] = [];
  const update = () => {
    const current = performance.now();
    const elapsed = current - monotonicStart;
    if (current - last > 5_000 && stallIntervals.length < 200)
      stallIntervals.push({ startedAtMs: last - monotonicStart, endedAtMs: elapsed });
    last = current;
    const skew = Date.now() - wallStart - elapsed;
    const recovered =
      navigation?.type === "reload" ||
      navigation?.type === "back_forward" ||
      Math.abs(wallStart - new Date(startedAt).getTime()) > 30_000;
    observations.set(attemptId, {
      monotonicElapsedMs: Math.floor(elapsed),
      visibilityChanges,
      stallIntervals: [...stallIntervals],
      wallClockSkewMs: skew,
      timeOrigin: performance.timeOrigin,
      contextStartedAt: new Date(wallStart).toISOString(),
      recoveredFromAnotherContext: recovered,
    });
    changed(
      Math.max(elapsed, Date.now() - new Date(startedAt).getTime()),
      recovered || visibilityChanges > 0 || stallIntervals.length > 0 || Math.abs(skew) > 1_000,
    );
  };
  const visibility = () => {
    visibilityChanges++;
    update();
  };
  const timer = window.setInterval(update, 1_000);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("pageshow", update);
  update();
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("pageshow", update);
    observations.delete(attemptId);
  };
}
