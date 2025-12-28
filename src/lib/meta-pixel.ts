// lib/meta-pixel.ts
// Meta Pixel tracking utilities for Ganadero de Precisión

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

/**
 * Track a Lead event when user clicks WhatsApp button
 */
export function trackLead(data: {
  content_name: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: data.content_name,
      content_category: data.content_category || "taller_iatf",
      value: data.value || 5500,
      currency: data.currency || "MXN",
    });
    console.log("✅ Meta Pixel: Lead event tracked", data);
  }
}

/**
 * Track a custom event
 */
export function trackCustomEvent(
  eventName: string,
  data?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, data);
    console.log(`✅ Meta Pixel: ${eventName} tracked`, data);
  }
}
