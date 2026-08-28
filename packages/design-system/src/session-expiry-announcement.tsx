"use client";

import { useEffect, useState } from "react";

export function SessionExpiryAnnouncement({ message }: { readonly message: string }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setAnnouncement("");
    const timeout = window.setTimeout(() => setAnnouncement(message), 0);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return (
    <div aria-atomic="true" aria-live="assertive" className="visually-hidden">
      {announcement}
    </div>
  );
}
