import type { ReactNode } from "react";

export type NavigationDestination = "coach" | "readiness" | "train" | "progress";
export type ShellKind = "protected" | "bare" | "focused";

export interface ShellSlots {
  readonly title: string;
  readonly eyebrow?: string;
  readonly activeDestination?: NavigationDestination;
  readonly kind?: ShellKind;
  readonly children: ReactNode;
  readonly banner?: ReactNode;
  readonly aside?: ReactNode;
  readonly backHref?: string;
}

export interface ActionContract {
  readonly label: string;
  readonly href?: string;
  readonly variant?: "primary" | "secondary" | "quiet" | "destructive";
  readonly disabledReason?: string;
}

export interface SemanticCardContract {
  readonly title: string;
  readonly children: ReactNode;
  readonly status?: "neutral" | "positive" | "attention" | "risk" | "system";
  readonly headingLevel?: 2 | 3;
}
