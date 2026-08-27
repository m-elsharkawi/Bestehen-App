import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { readonly children: ReactNode }) {
  return children;
}
