import type { ReactNode } from "react";
import {
  Action,
  AppShell,
  AttemptShell,
  ComponentGallery,
  DataRightsStatus,
  DeviceSessionList,
  DraftConflict,
  EvidenceLabel,
  LanguageElementsRegion,
  MockShell,
  ReadinessEvidence,
  ReadingRegion,
  SemanticCard,
  Sequence,
  SessionNotice,
  UploadStatus,
  WritingRegion,
} from "@bestehen/design-system";
import type { WritingRegionVariant } from "@bestehen/design-system";

const gates = (["A", "B", "C", "D", "E", "F"] as const).map((id, index) => ({
  id,
  met: index < 2,
  reason:
    index < 2
      ? "Current direct evidence meets this gate."
      : "More current direct evidence is required.",
}));

export function CoachView() {
  return (
    <AppShell
      activeDestination="coach"
      aside={
        <SemanticCard title="Why this plan">
          <p>Reading evidence is current. A fresh Writing sample is due.</p>
        </SemanticCard>
      }
      eyebrow="Today"
      title="Your next useful session"
    >
      <SemanticCard status="positive" title="Repair one Writing pattern">
        <p>
          Work on the missing content point, then use a fresh prompt without answer-bearing help.
        </p>
        <Action href="/session/synthetic" label="Start 20-minute session" />
      </SemanticCard>
      <p>
        <a href="/train">Choose something else</a>
      </p>
    </AppShell>
  );
}
export function ReadinessView() {
  return (
    <AppShell
      activeDestination="readiness"
      aside={
        <SemanticCard title="Evidence notes">
          <p>Numbers are absent until enough direct evidence exists.</p>
        </SemanticCard>
      }
      eyebrow="Current source cut"
      title="Readiness"
    >
      <ReadinessEvidence gates={gates} state="evidence_building" />
    </AppShell>
  );
}
export function TrainView() {
  return (
    <AppShell activeDestination="train" title="Train">
      <Sequence
        current={1}
        steps={["Choose a skill", "Complete focused practice", "Review the result"]}
      />
      <SemanticCard title="Five-skill foundation route">
        <p>
          A resumable route across Reading, Language Elements, Listening, Writing, and Speaking.
          Plan for 18 to 22 minutes; it stops at 30 minutes.
        </p>
        <Action href="/session/synthetic" label="Continue route" />
      </SemanticCard>
    </AppShell>
  );
}
export function ProgressView() {
  return (
    <AppShell
      activeDestination="progress"
      aside={
        <SemanticCard title="Weakness detail">
          <p>Content-point coverage is improving. A fresh check is due tomorrow.</p>
        </SemanticCard>
      }
      title="Progress"
    >
      <SemanticCard title="What changed">
        <p>No band is shown here. Two direct samples now support the Writing pattern.</p>
      </SemanticCard>
      <SemanticCard status="attention" title="Due review">
        <p>Content-point coverage · due tomorrow</p>
      </SemanticCard>
    </AppShell>
  );
}
export function AccountView({ data = false }: { readonly data?: boolean }) {
  return (
    <AppShell title={data ? "Your data" : "Account"}>
      {data ? (
        <DataRightsStatus />
      ) : (
        <>
          <DeviceSessionList />
          <SemanticCard title="Recent sign-in required">
            <p>Sign in again before revoking other sessions or starting deletion.</p>
          </SemanticCard>
        </>
      )}
    </AppShell>
  );
}
export function SessionView() {
  return (
    <AppShell backHref="/coach" kind="focused" title="Five-skill foundation">
      <Sequence
        current={2}
        steps={["Reading", "Language Elements", "Listening", "Writing", "Speaking"]}
      />
      <p>
        Your checkpoint keeps completed parts. A partial probe contributes evidence building, not a
        placement claim.
      </p>
      <Action href="/attempt/synthetic-reading" label="Continue" />
    </AppShell>
  );
}
export function AttemptView({
  kind = "reading",
  writingVariant = "editor",
}: {
  readonly kind?: "reading" | "language" | "writing";
  readonly writingVariant?: WritingRegionVariant;
}) {
  const region: ReactNode =
    kind === "language" ? (
      <LanguageElementsRegion />
    ) : kind === "writing" ? (
      <WritingRegion variant={writingVariant} />
    ) : (
      <ReadingRegion />
    );
  return (
    <AttemptShell
      action={<Action label="Submit answer" />}
      conditions={["Practice timing", "No answer-bearing help", "Server decides validity"]}
      title={kind === "language" ? "Language Elements" : kind === "writing" ? "Writing" : "Reading"}
    >
      {region}
    </AttemptShell>
  );
}
export function ResultView() {
  return (
    <AppShell backHref="/coach" kind="focused" title="Result">
      <EvidenceLabel reason="The task completed under the recorded conditions." validity="valid" />
      <SemanticCard title="What this shows">
        <p>One Reading pattern is stable. It does not set an overall level or pass claim.</p>
      </SemanticCard>
      <SemanticCard title="Repair">
        <p>Check the connector in the second paragraph, then try one fresh item.</p>
      </SemanticCard>
    </AppShell>
  );
}
export function MockView({ result = false }: { readonly result?: boolean }) {
  return (
    <MockShell remaining={result ? "Finished" : "24:18"}>
      {result ? (
        <>
          <EvidenceLabel
            reason="One block was interrupted and is named separately."
            validity="partially_valid"
          />
          <p>Raw points are shown only for comparable valid blocks.</p>
        </>
      ) : (
        <>
          <p lang="de">Bearbeiten Sie alle Aufgaben ohne Hilfe.</p>
          <Action label="Continue measured block" />
        </>
      )}
    </MockShell>
  );
}
export function StateView({ name }: { readonly name: string }) {
  if (name === "gallery")
    return (
      <AppShell kind="bare" title="Component gallery">
        <ComponentGallery />
      </AppShell>
    );
  if (name === "conflict")
    return (
      <AppShell kind="focused" title="Recover writing draft">
        <DraftConflict />
      </AppShell>
    );
  if (name === "transfer")
    return (
      <AppShell kind="focused" title="Speaking transfer">
        <UploadStatus progress={38} state="sending" />
        <UploadStatus state="not_sent" />
      </AppShell>
    );
  return (
    <AppShell kind="bare" title="Session state">
      <SessionNotice state="expired_mid_attempt" />
    </AppShell>
  );
}
