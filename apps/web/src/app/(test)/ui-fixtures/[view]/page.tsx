import { notFound } from "next/navigation";
import { AccessibilityFixture } from "../../../../ui/a11y-fixture";
import { ListeningRuntimeIsland } from "../../../../ui/islands/listening-runtime";
import { ListeningTranscriptIsland } from "../../../../ui/islands/listening-transcript";
import {
  AccountView,
  AttemptView,
  CoachView,
  MockView,
  ProgressView,
  ReadinessView,
  ResultView,
  SessionView,
  StateView,
  TrainView,
} from "../../../../ui/archetypes";

const views = [
  "coach",
  "readiness",
  "train",
  "progress",
  "account",
  "data",
  "session",
  "reading",
  "language",
  "writing",
  "result",
  "mock",
  "mock-result",
  "gallery",
  "conflict",
  "transfer",
  "session-expiry",
  "a11y",
  "listening",
  "listening-result",
] as const;
type View = (typeof views)[number];

export default async function UiFixturePage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly view: string }>;
  readonly searchParams: Promise<{ readonly draft?: string | readonly string[] }>;
}) {
  if (
    process.env.BESTEHEN_APP_ENV !== "test" ||
    process.env.BESTEHEN_RELEASE_COMMIT !== "playwright-synthetic"
  )
    notFound();
  const view = (await params).view;
  const draft = (await searchParams).draft;
  if (!(views as readonly string[]).includes(view)) notFound();
  switch (view as View) {
    case "coach":
      return <CoachView />;
    case "readiness":
      return <ReadinessView />;
    case "train":
      return <TrainView />;
    case "progress":
      return <ProgressView />;
    case "account":
      return <AccountView />;
    case "data":
      return <AccountView data />;
    case "session":
      return <SessionView />;
    case "reading":
      return <AttemptView />;
    case "language":
      return <AttemptView kind="language" />;
    case "writing":
      return (
        <AttemptView kind="writing" writingVariant={draft === "autosave" ? "autosave" : "editor"} />
      );
    case "result":
      return <ResultView />;
    case "mock":
      return <MockView />;
    case "mock-result":
      return <MockView result />;
    case "gallery":
    case "conflict":
    case "transfer":
    case "session-expiry":
      return <StateView name={view} />;
    case "a11y":
      return <AccessibilityFixture />;
    case "listening":
      return (
        <>
          <p>Technical non-speech Listening test fixture. Not approved learner content.</p>
          <ListeningRuntimeIsland
            attemptId="11111111-1111-4111-8111-111111111111"
            continuityScope="technical-browser-test"
          >
            <label>
              Test response <input name="test-response" />
            </label>
            <button type="submit">Test response submit</button>
          </ListeningRuntimeIsland>
        </>
      );
    case "listening-result":
      return (
        <>
          <p>Technical test result phase. Not an authenticated owner flow.</p>
          <ListeningTranscriptIsland attemptId="11111111-1111-4111-8111-111111111111" />
        </>
      );
  }
}
