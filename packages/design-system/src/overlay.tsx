"use client";

import type { ReactNode } from "react";
import { useId, useRef } from "react";

export function Overlay({
  title = "Review details",
  children,
  kind = "dialog",
}: {
  readonly title?: string;
  readonly children?: ReactNode;
  readonly kind?: "sheet" | "dialog" | "destructive-confirm";
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
    requestAnimationFrame(() => focusable()[0]?.focus());
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
        data-overlay-kind={kind}
        onClose={() => trigger.current?.focus()}
        ref={dialog}
      >
        <h2 id={titleId}>{title}</h2>
        {children ?? (
          <p>
            {kind === "destructive-confirm"
              ? "This action cannot be undone until you confirm it."
              : kind === "sheet"
                ? "Review these details without leaving the current task."
                : "Review the consequence before continuing."}
          </p>
        )}
        <button
          className={`action action-${kind === "destructive-confirm" ? "destructive" : "primary"}`}
          onClick={close}
          type="button"
        >
          {kind === "destructive-confirm" ? "Confirm" : "Close"}
        </button>
      </dialog>
    </>
  );
}
