'use client';

import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useMemo } from 'react';

/**
 * The sign-up destination for the current visitor, carrying the referring partner through so they
 * land on the partner sign-up rather than the public one. See useReferralPartner for how the
 * partner is detected.
 */
export function useRegisterPath(): string {
  const referralPartner = useCookieReferralPartner();

  return useMemo(
    () => (referralPartner ? `/auth/register?partner=${referralPartner}` : '/auth/register'),
    [referralPartner],
  );
}
