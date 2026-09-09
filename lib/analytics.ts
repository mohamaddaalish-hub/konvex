export type AnalyticsEvent =
  | "product_view"
  | "product_search"
  | "filter_used"
  | "compare_product"
  | "request_quote"
  | "contact_click"
  | "phone_click"
  | "whatsapp_click"
  | "download_catalog"
  | "add_to_wishlist"
  | "purchase";
export function track(
  event: AnalyticsEvent,
  properties: Record<string, string | number | boolean | string[]> = {},
) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // Never pass name, phone, email, notes, or raw search queries to analytics.
  w.dataLayer.push({ event, ...properties, timestamp: Date.now() });
  window.dispatchEvent(
    new CustomEvent("konvex:analytics", { detail: { event, ...properties } }),
  );
}
