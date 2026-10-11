"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ||
        "https://us.i.posthog.com",
      capture_pageview: false,
      autocapture: true,
      disable_session_recording: true,
    });

    const params = new URLSearchParams(window.location.search);

    posthog.capture("page_view", {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      device: window.matchMedia("(max-width: 767px)").matches
        ? "mobile"
        : "desktop",
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}