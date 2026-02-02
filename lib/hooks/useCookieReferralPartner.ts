import { useTypedSelector } from '@/lib/hooks/store';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

/**
 * Hook to safely read the referralPartner cookie after hydration.
 * Returns null on server and initial client render to avoid hydration mismatch,
 * then updates with the actual cookie value after mount.
 *
 * Falls back to entryPartnerReferral from Redux state if no cookie exists.
 */
export function useCookieReferralPartner(): string | null {
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const [cookieValue, setCookieValue] = useState<string | null>(null);

  useEffect(() => {
    const value = Cookies.get('referralPartner');
    if (value) {
      // Reading browser cookie after hydration - this intentionally triggers a re-render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCookieValue(value);
    }
  }, []);

  return cookieValue || entryPartnerReferral;
}
