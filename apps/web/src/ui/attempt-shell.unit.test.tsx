import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell, AttemptShell } from "@bestehen/design-system";

function previousMarkup(action: ReactNode, embedded: boolean) {
  return renderToStaticMarkup(
    <AppShell
      embedded={embedded}
      eyebrow="Focused practice"
      kind="focused"
      title="Synthetic attempt"
    >
      <ul aria-label="Attempt conditions" className="conditions-row">
        <li>Practice</li>
      </ul>
      <div className="attempt-content">
        <p>Question</p>
      </div>
      <div className="sticky-action">{action}</div>
    </AppShell>,
  );
}
describe("P05-COMPONENT-001 additive attempt action bar", () => {
  it.each([false, true])("preserves the exact legacy markup with embedded=%s", (embedded) => {
    for (const action of [
      null,
      <button key="action" type="button">
        Continue
      </button>,
    ]) {
      const props = { title: "Synthetic attempt", conditions: ["Practice"], action, embedded };
      const legacy = previousMarkup(action, embedded);
      expect(
        renderToStaticMarkup(
          <AttemptShell {...props}>
            <p>Question</p>
          </AttemptShell>,
        ),
      ).toBe(legacy);
      expect(
        renderToStaticMarkup(
          <AttemptShell {...props} showActionBar>
            <p>Question</p>
          </AttemptShell>,
        ),
      ).toBe(legacy);
      expect(
        renderToStaticMarkup(
          <AttemptShell {...props} showActionBar={false}>
            <p>Question</p>
          </AttemptShell>,
        ),
      ).toBe(
        legacy.replace(`<div class="sticky-action">${renderToStaticMarkup(action)}</div>`, ""),
      );
    }
  });
});
