"use client";

import { Field, FormFeedback, Overlay } from "@bestehen/design-system";
import { useRef, useState } from "react";

export function AccessibilityFixture() {
  const [failed, setFailed] = useState(false);
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const errors = useRef<HTMLDivElement>(null);
  return (
    <main id="main-content">
      <h1>Accessibility interaction fixture</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFailed(true);
          requestAnimationFrame(() =>
            errors.current?.querySelector<HTMLElement>(".error-summary")?.focus(),
          );
        }}
      >
        <Field
          id="a11y-response"
          label="Response"
          {...(failed ? { error: "A response is required" } : {})}
        />
        <button className="action action-primary" type="submit">
          Check response
        </button>
        <div ref={errors}>
          {failed ? (
            <FormFeedback
              errors={[{ href: "#a11y-response", message: "A response is required" }]}
            />
          ) : null}
        </div>
      </form>
      <Overlay title="Keyboard review">
        <button className="action action-secondary" type="button">
          Secondary dialog action
        </button>
      </Overlay>
      <div className="fixture-actions">
        <button
          className="action action-secondary"
          onClick={() => setPolite("Saved locally")}
          type="button"
        >
          Polite update
        </button>
        <button
          className="action action-secondary"
          onClick={() => setAssertive("Recording stopped")}
          type="button"
        >
          Assertive update
        </button>
      </div>
      <div aria-live="polite">{polite}</div>
      <div aria-live="assertive">{assertive}</div>
      <p className="timer">42 seconds</p>
      <p>65 percent margin</p>
    </main>
  );
}
