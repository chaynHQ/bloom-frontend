// Collects coarse, low-PII client context to attach to the Front support contact so
// agents see basic locale/device info. Deliberately minimal for user privacy:
//   - NO IP address (never collected — avoids processing an identifier)
//   - NO GPS/precise geolocation (no permission prompt, nothing precise)
//   - NO raw User-Agent string (only coarse, allow-listed families — limits fingerprinting)
//
// "Location" is conveyed only by the browser's IANA timezone (e.g. Europe/Berlin), a coarse
// regional signal. Values are mirrored, validated, into Front custom fields by the backend
// (see bloom-backend src/front-chat/front-chat.helpers.ts — keep the allow-lists in sync).

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ClientOs = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Chrome OS';
export type ClientBrowser = 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Samsung Internet' | 'Opera';

export interface ClientContext {
  browserLanguage?: string;
  timezone?: string;
  deviceType?: DeviceType;
  os?: ClientOs;
  browser?: ClientBrowser;
}

function detectOs(ua: string, isTouchMac: boolean): ClientOs | undefined {
  if (/iPhone|iPad|iPod/.test(ua) || isTouchMac) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/CrOS/.test(ua)) return 'Chrome OS';
  if (/Windows|Win32|Win64/.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return undefined;
}

function detectBrowser(ua: string): ClientBrowser | undefined {
  // Order matters: Chromium-based browsers all include "Chrome", so check the specific ones first.
  if (/Edg\//.test(ua)) return 'Edge';
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua)) return 'Safari';
  return undefined;
}

function detectDeviceType(ua: string, isTouchMac: boolean): DeviceType {
  if (/iPad/.test(ua) || isTouchMac) return 'tablet';
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'mobile' : 'tablet';
  if (/iPhone|iPod/.test(ua)) return 'mobile';
  if (/Tablet|PlayBook|Silk/.test(ua)) return 'tablet';
  if (/Mobi/.test(ua)) return 'mobile';
  return 'desktop';
}

export function getClientContext(): ClientContext {
  if (typeof navigator === 'undefined') return {};

  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports a desktop Mac UA; touch points disambiguate it as an iPad.
  const isTouchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;

  const context: ClientContext = {
    deviceType: detectDeviceType(ua, isTouchMac),
    os: detectOs(ua, isTouchMac),
    browser: detectBrowser(ua),
  };

  if (navigator.language) context.browserLanguage = navigator.language;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) context.timezone = timezone;
  } catch {
    // Intl/timezone unavailable — omit rather than guess.
  }

  return context;
}
