'use client';

import { useLaunchedReferralPartner } from '@/lib/hooks/useLaunchedReferralPartner';
import { useMemo } from 'react';

export function useRegisterPath(): string {
  const referralSlug = useLaunchedReferralPartner()?.slug;

  return useMemo(
    () => (referralSlug ? `/auth/register?partner=${referralSlug}` : '/auth/register'),
    [referralSlug],
  );
}
