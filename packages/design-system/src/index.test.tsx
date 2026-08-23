// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BaselineShell } from "./index.js";

describe("BaselineShell", () => {
  it("provides a skip link, one main landmark, and a heading", () => {
    render(<BaselineShell title="Baseline">Content</BaselineShell>);
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Baseline" })).toBeInTheDocument();
  });
});
