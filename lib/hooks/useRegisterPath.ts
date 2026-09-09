'use client';

import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useMemo } from 'react';

export function useRegisterPath(): string {
  const referralPartner = useCookieReferralPartner();

  return useMemo(
    () => (referralPartner ? `/auth/register?partner=${referralPartner}` : '/auth/register'),
    [referralPartner],
  );
}
