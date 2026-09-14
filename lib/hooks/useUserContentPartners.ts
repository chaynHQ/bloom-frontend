'use client';

import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { getUserContentPartners } from '@/lib/utils/partnerContentAccess';
import { useMemo } from 'react';

// The partner audiences the current viewer belongs to (lowercased), for filtering CMS content by
// its `included_for_partners`. Wraps the Redux + referral-cookie reads every caller repeats.
export function useUserContentPartners(): string[] {
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const referralPartner = useCookieReferralPartner();

  return useMemo(
    () => getUserContentPartners(partnerAdmin?.partner, partnerAccesses, referralPartner, userId),
    [partnerAdmin, partnerAccesses, referralPartner, userId],
  );
}
