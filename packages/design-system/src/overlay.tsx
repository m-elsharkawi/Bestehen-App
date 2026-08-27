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
  function focusable() {
    return [
      ...(dialog.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ) ?? []),
    ];
  }
  function open() {
    dialog.current?.showModal();
    focusable()[0]?.focus();
  }
  function close() {
    dialog.current?.close();
    trigger.current?.focus();
  }
  return (
    <>
      <button className="action action-secondary" onClick={open} ref={trigger} type="button">
        Open {title}
      </button>
      <dialog
        aria-labelledby={titleId}
        className="overlay"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = focusable();
          const first = controls[0];
          const last = controls.at(-1);
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
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
