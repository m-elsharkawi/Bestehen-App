import type { ReactNode, SVGProps } from "react";

export const iconNames = [
  "coach",
  "readiness",
  "train",
  "progress",
  "reading",
  "listening",
  "writing",
  "speaking",
  "measured-time",
  "evidence",
  "exam-date",
  "safe-correct",
  "borderline",
  "not-ready",
  "evidence-building",
  "stale-recheck",
  "our-fault",
  "transcript",
  "lock",
  "upload",
] as const;
export type IconName = (typeof iconNames)[number];

const paths: Record<IconName, ReactNode> = {
  coach: (
    <>
      <path d="M22 17a2 2 0 0 1-2 2H6.8a2 2 0 0 0-1.4.6l-2.2 2.2A.7.7 0 0 1 2 21.3V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2Z" />
      <path d="M7 7h8M7 11h10M7 15h6" />
    </>
  ),
  readiness: (
    <>
      <path d="m12 14 4-4" />
      <path d="M3.3 19a10 10 0 1 1 17.4 0" />
    </>
  ),
  train: (
    <>
      <path d="m9.6 14.4 4.8-4.8" />
      <path d="M2.5 21.5 21.5 2.5M5.3 21.5l7.5-7.9M11.2 6.4l7.5-3.9" />
    </>
  ),
  progress: (
    <>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </>
  ),
  reading: (
    <>
      <path d="M12 5v16" />
      <path d="M20 19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a5 5 0 0 0-4 2 5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a5 5 0 0 1 4 2 5 5 0 0 1 4-2Z" />
    </>
  ),
  listening: (
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  ),
  writing: (
    <>
      <path d="M13 21h8" />
      <path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8L2 21.4a.5.5 0 0 0 .6.6L7 20.7a2 2 0 0 0 .8-.5Z" />
    </>
  ),
  speaking: (
    <>
      <path d="M12 19v3M19 10v2a7 7 0 0 1-14 0v-2" />
      <rect x="9" y="2" width="6" height="13" rx="3" />
    </>
  ),
  "measured-time": (
    <>
      <path d="M10 2h4M12 14l3-3" />
      <circle cx="12" cy="14" r="8" />
    </>
  ),
  evidence: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m1 10 2 2 4-4" />
    </>
  ),
  "exam-date": (
    <>
      <path d="M8 2v3M16 2v3M3 9h18m-12 6 2 2 4-4" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </>
  ),
  "safe-correct": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  borderline: (
    <>
      <path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3" />
      <path d="M12 9v4m0 4h.01" />
    </>
  ),
  "not-ready": (
    <>
      <path d="M12 8v4m0 4h.01" />
      <path d="M15.3 2a2 2 0 0 1 1.4.6l4.7 4.7a2 2 0 0 1 .6 1.4v6.6a2 2 0 0 1-.6 1.4l-4.7 4.7a2 2 0 0 1-1.4.6H8.7a2 2 0 0 1-1.4-.6l-4.7-4.7a2 2 0 0 1-.6-1.4V8.7a2 2 0 0 1 .6-1.4l4.7-4.7A2 2 0 0 1 8.7 2Z" />
    </>
  ),
  "evidence-building": <circle cx="12" cy="12" r="9" strokeDasharray="3 4" />,
  "stale-recheck": (
    <>
      <path d="M3 12a9 9 0 0 1 15.7-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.7 6.3L3 16m0 5v-5h5" />
    </>
  ),
  "our-fault": (
    <>
      <path d="M12 20h.01M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-2-1.6M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5" />
      <path d="m2 2 20 20" />
    </>
  ),
  transcript: (
    <>
      <path d="M12 5v16" />
      <path d="M20 19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a5 5 0 0 0-4 2 5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a5 5 0 0 1 4 2 5 5 0 0 1 4-2Z" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  upload: (
    <>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  readonly name: IconName;
  readonly size?: 15 | 20 | 24;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
