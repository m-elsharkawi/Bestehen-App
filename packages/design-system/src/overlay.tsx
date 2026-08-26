"use client";

import type { ReactNode } from "react";
import { useId, useRef } from "react";

export function Overlay({
  title = "Review details",
  children,
}: {
  readonly title?: string;
  readonly children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  function close() {
    dialog.current?.close();
    trigger.current?.focus();
  }
  return (
    <>
      <button
        className="action action-secondary"
        onClick={() => dialog.current?.showModal()}
        ref={trigger}
        type="button"
      >
        Open {title}
      </button>
      <dialog
        aria-labelledby={titleId}
        className="overlay"
        onClose={() => trigger.current?.focus()}
        ref={dialog}
      >
        <h2 id={titleId}>{title}</h2>
        {children ?? <p>Review the consequence before continuing.</p>}
        <button className="action action-primary" onClick={close} type="button">
          Close
        </button>
      </dialog>
    </>
  );
}
