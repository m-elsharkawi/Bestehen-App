import "@bestehen/design-system/styles.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeController } from "../ui/theme-controller";

export const metadata: Metadata = {
  title: { default: "Bestehen App", template: "%s · Bestehen App" },
  description: "A private, evidence-based German exam coach.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <ThemeController />
      </body>
    </html>
  );
}
