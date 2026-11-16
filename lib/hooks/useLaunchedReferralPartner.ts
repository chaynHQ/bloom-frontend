'use client';

import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useLaunchedPartners } from '@/lib/partners/PartnersProvider';
import { resolveLaunchedPartner } from '@/lib/partners/resolve';

// The referral cookie holds a slug. An unknown or unlaunched one, such as an old cookie, is ignored.
export function useLaunchedReferralPartner() {
  return resolveLaunchedPartner(useLaunchedPartners(), useCookieReferralPartner());
}
