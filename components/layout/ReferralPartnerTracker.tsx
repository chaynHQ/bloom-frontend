'use client';

import useReferralPartner from '@/lib/hooks/useReferralPartner';

// Runs the referral-partner detection app-wide so partner UTM links work on any
// landing page (homepage, courses, etc.), not just welcome/register pages.
// Renders nothing — it only stores the referring partner on entry.
export default function ReferralPartnerTracker() {
  useReferralPartner();
  return null;
}
