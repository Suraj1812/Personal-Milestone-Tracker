import type { ReactElement } from "react";

interface StatusBannerProps {
  tone: "error" | "success" | "info";
  message: string;
}

export function StatusBanner({ tone, message }: StatusBannerProps): ReactElement {
  return (
    <p className={`status-banner status-banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}
