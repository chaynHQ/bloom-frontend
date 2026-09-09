'use client';

import Cookies from 'js-cookie';
import { useSyncExternalStore } from 'react';

export const ANALYTICS_CONSENT_COOKIE = 'analyticsConsent';

// Dispatched by the cookie banner on accept or decline, so waiting banners appear immediately.
export const COOKIE_CONSENT_DECIDED_EVENT = 'cookieConsentDecided';

export const notifyCookieConsentDecided = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_DECIDED_EVENT));
};

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(COOKIE_CONSENT_DECIDED_EVENT, onStoreChange);
  return () => window.removeEventListener(COOKIE_CONSENT_DECIDED_EVENT, onStoreChange);
};

const getSnapshot = () => Cookies.get(ANALYTICS_CONSENT_COOKIE) !== undefined;
const getConsentGrantedSnapshot = () => Cookies.get(ANALYTICS_CONSENT_COOKIE) === 'true';

// Cookies aren't readable while rendering on the server, so treat consent as undecided.
const getServerSnapshot = () => false;

// Whether the visitor has answered the cookie banner at all (accept or decline).
export default function useCookieConsentDecided() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Whether the visitor has actively accepted analytics cookies. Use this to gate
// trackers that set cookies on load and have no Google Consent Mode equivalent.
export function useAnalyticsConsentGranted() {
  return useSyncExternalStore(subscribe, getConsentGrantedSnapshot, getServerSnapshot);
}
