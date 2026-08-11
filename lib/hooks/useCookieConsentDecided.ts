'use client';

import Cookies from 'js-cookie';
import { useSyncExternalStore } from 'react';

export const ANALYTICS_CONSENT_COOKIE = 'analyticsConsent';

// Dispatched by the cookie banner on accept or decline, so banners waiting on that decision
// appear immediately rather than on the next page load.
export const COOKIE_CONSENT_DECIDED_EVENT = 'cookieConsentDecided';

export const notifyCookieConsentDecided = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_DECIDED_EVENT));
};

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(COOKIE_CONSENT_DECIDED_EVENT, onStoreChange);
  return () => window.removeEventListener(COOKIE_CONSENT_DECIDED_EVENT, onStoreChange);
};

// The cookie is set to 'true' on accept and 'false' on decline — either counts as a decision.
const getSnapshot = () => Cookies.get(ANALYTICS_CONSENT_COOKIE) !== undefined;

// Cookies aren't readable while rendering on the server, so treat consent as undecided.
const getServerSnapshot = () => false;

export default function useCookieConsentDecided() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
