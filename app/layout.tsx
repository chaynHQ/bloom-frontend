'use client';

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

  useEffect(() => {
    if (pwaStatus) {
      // Store status for future reference
      storePWAStatus(pwaStatus);
      pwaStatus.isInstalled ? logEvent(PWA_LOADED) : logEvent(WEB_APP_LOADED);
    }
  }, [pwaStatus]);
  return children;
}
