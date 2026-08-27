try {
  const theme = localStorage.getItem("bestehen-theme");
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
} catch {
  // Storage denial leaves the system theme in place.
}
