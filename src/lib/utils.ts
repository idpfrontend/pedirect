import { customAlphabet } from "nanoid";

const keyAlphabet = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 16);

export function generateMappingKey() {
  return keyAlphabet();
}

export function generateClickId() {
  return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 24)();
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toJsonArray(values: string[]): string {
  return JSON.stringify(values.filter(Boolean));
}

export function detectDevice(userAgent: string): "desktop" | "mobile" | "tablet" | "unknown" {
  const ua = userAgent.toLowerCase();
  if (!ua) return "unknown";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) return "tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

export function isGoogleTraffic(referrer: string, userAgent: string): boolean {
  const ref = referrer.toLowerCase();
  const ua = userAgent.toLowerCase();
  return (
    ref.includes("google.") ||
    ref.includes("doubleclick") ||
    ref.includes("googlesyndication") ||
    ua.includes("adsbot-google") ||
    ua.includes("google-ads")
  );
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
