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

// Cookies aren't readable while rendering on the server, so treat consent as undecided.
const getServerSnapshot = () => false;

export default function useCookieConsentDecided() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
