"use client";

import { useReportWebVitals } from "next/web-vitals";

const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT?.trim();

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload = {
      ...metric,
      path: window.location.pathname,
      recordedAt: new Date().toISOString(),
    };

    window.dispatchEvent(
      new CustomEvent("restaurant:web-vital", { detail: payload })
    );

    if (endpoint && navigator.sendBeacon) {
      navigator.sendBeacon(
        endpoint,
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[web-vital]", payload);
    }
  });

  return null;
}
