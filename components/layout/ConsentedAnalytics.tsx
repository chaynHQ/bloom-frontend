'use client';

import { useAnalyticsConsentGranted } from '@/lib/hooks/useCookieConsentDecided';
import { Hotjar } from 'nextjs-hotjar';

// Hotjar has no Google Consent Mode equivalent and sets cookies the moment its
// script loads, so it must not mount until the visitor accepts analytics cookies.
// (Google Analytics stays mounted app-wide and is handled via Consent Mode in BaseLayout.)
const ConsentedAnalytics = ({ hotjarId }: { hotjarId?: string }) => {
  const consentGranted = useAnalyticsConsentGranted();

  if (!consentGranted || !hotjarId) return null;

  return <Hotjar id={hotjarId} sv={6} strategy="lazyOnload" />;
};

export default ConsentedAnalytics;
