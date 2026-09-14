'use client';

import { useAnalyticsConsentGranted } from '@/lib/hooks/useCookieConsentDecided';
import { PWA_LOADED, WEB_APP_LOADED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { storePWAStatus, usePWAStatus } from '@/lib/utils/pwaDetection';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file is required to pass children
export default function RootLayout({ children }: Props) {
  const pwaStatus = usePWAStatus();
  const analyticsConsentGranted = useAnalyticsConsentGranted();

  useEffect(() => {
    if (pwaStatus) {
      pwaStatus.isInstalled ? logEvent(PWA_LOADED) : logEvent(WEB_APP_LOADED);
    }
  }, [pwaStatus]);

  useEffect(() => {
    // Persisted only with analytics consent; re-runs when consent is granted.
    storePWAStatus(pwaStatus);
  }, [pwaStatus, analyticsConsentGranted]);
  return children;
}
