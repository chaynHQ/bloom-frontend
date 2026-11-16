import { usePathname } from '@/i18n/routing';
import { useLaunchedPartners } from '@/lib/partners/PartnersProvider';
import { resolveLaunchedPartner } from '@/lib/partners/resolve';
import { setEntryPartnerReferral } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from './store';
import { useHydratedSearchParams } from './useHydratedSearchParams';

// Check if entry path is from a partner referral and if so, store referring partner in state and a cookie
// This enables us to redirect a user to the correct sign up page later (e.g. in SignUpSection)
// Referrals are detected from welcome paths and from a partner slug in UTM link data.
export default function useReferralPartner() {
  const pathname = usePathname();
  const searchParams = useHydratedSearchParams();
  const dispatch = useAppDispatch();
  const launchedPartners = useLaunchedPartners();
  const detected = useRef(false);

  // Once per page entry, as soon as the URL's params are known.
  useEffect(() => {
    if (!searchParams || detected.current) return;
    detected.current = true;

    function setReferralPartner(referralPartner: string) {
      // Essential/functional cookie (not analytics): remembers the referring partner for the
      // current visit so the partner experience is shown and the partner is linked at sign up.
      // Session-scoped (no expiry → cleared when the browser closes), so it is set without
      // analytics consent, consistent with the Essential Cookies in our cookie policy.
      Cookies.set('referralPartner', referralPartner);
      dispatch(setEntryPartnerReferral(referralPartner));
    }

    let referralPartner: string | undefined;

    if (pathname?.includes('/welcome/')) {
      // Gets "bumble" from /welcome/bumble
      referralPartner = resolveLaunchedPartner(launchedPartners, pathname.split('/')[2])?.slug;
    }
    // Partners include their name in UTM link data (e.g. ?utm_source=bumble or
    // ?utm_campaign=bumble-june-2026)
    if (!referralPartner) {
      const utmData = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .map((key) => searchParams.get(key))
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      // When the data names more than one launched slug, the longest wins, so a slug inside
      // another partner's slug never takes its referrals.
      if (utmData) {
        referralPartner = launchedPartners
          .map((partner) => partner.slug)
          .filter((slug) => utmData.includes(slug))
          .sort((a, b) => b.length - a.length)[0];
      }
    }

    if (referralPartner) {
      setReferralPartner(referralPartner);
    } else {
      // No referral in the URL — rehydrate Redux from the cookie so the partner survives full
      // page loads (Redux resets on reload, but the session cookie persists for the visit).
      const cookieReferralPartner = Cookies.get('referralPartner');
      if (cookieReferralPartner) dispatch(setEntryPartnerReferral(cookieReferralPartner));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
}
