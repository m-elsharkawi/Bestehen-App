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

/** The presentation-only seam accepted from a versioned server UI projection. */
export interface ProjectionCardContract {
  readonly state: string;
  readonly title: string;
  readonly message: string;
  readonly status: NonNullable<SemanticCardContract["status"]>;
  readonly affectedScope: readonly string[];
  readonly action?: { readonly label: string; readonly href: string };
}
