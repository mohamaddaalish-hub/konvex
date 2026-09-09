"use client";
import { useI18n } from "@/i18n/use-i18n";

import { track, type AnalyticsEvent } from "@/lib/analytics";
export function ContactLink({
  href,
  event,
  children,
  className = "",
}: {
  href: string;
  event: AnalyticsEvent;
  children: React.ReactNode;
  className?: string;
}) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return (
    <a
      href={href}
      className={className}
      onClick={() => track(event)}
      target={href.startsWith("https://") ? "_blank" : undefined}
      rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
