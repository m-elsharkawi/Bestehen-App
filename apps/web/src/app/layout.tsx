import "@bestehen/design-system/styles.css";
import type { Metadata } from "next";
import Script from "next/script";
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
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <noscript>
          <p>
            JavaScript is off. You can still read this server-rendered page, but interactive
            controls need JavaScript.
          </p>
        </noscript>
        {children}
        <ThemeController />
      </body>
    </html>
  );
}
