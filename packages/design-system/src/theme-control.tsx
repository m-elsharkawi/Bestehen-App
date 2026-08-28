"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function applyTheme(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
}

/**
 * Header utility control for the local theme preference. It owns only the
 * preference; the pre-paint script applies the stored value before hydration.
 * Rendered once per shell header, never inside an embedded shell.
 */
export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = localStorage.getItem("bestehen-theme");
    const next = saved === "light" || saved === "dark" ? saved : "system";
    setTheme(next);
    applyTheme(next);
  }, []);
  function cycle() {
    const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    applyTheme(next);
    if (next === "system") localStorage.removeItem("bestehen-theme");
    else localStorage.setItem("bestehen-theme", next);
  }
  return (
    <button
      aria-label={`Theme: ${theme}. Change theme`}
      className="theme-control"
      onClick={cycle}
      type="button"
    >
      Theme: {theme}
    </button>
  );
}
