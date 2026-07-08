import { usePathname } from '@/i18n/routing';
import { partnerKeys } from '@/lib/constants/partners';
import { setEntryPartnerAccessCode, setEntryPartnerReferral } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAppDispatch } from './store';

// Check if entry path is from a partner referral and if so, store referring partner and code in state and local storage
// This enables us to redirect a user to the correct sign up page later (e.g. in SignUpBanner)
// Referrals are detected from welcome/register paths and from a partner name in UTM link data.
export default function useReferralPartner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    function setReferralPartner(referralPartner: string) {
      // Essential/functional cookie (not analytics): remembers the referring partner for the
      // current visit so the partner experience is shown and the partner is linked at sign up.
      // Session-scoped (no expiry → cleared when the browser closes), so it is set without
      // analytics consent, consistent with the Essential Cookies in our cookie policy.
      Cookies.set('referralPartner', referralPartner);
      dispatch(setEntryPartnerReferral(referralPartner));
    }
    async function setReferralCode(referralCode: string) {
      await dispatch(setEntryPartnerAccessCode(referralCode));
    }

    let referralPartner, referralCode;

    if (pathname?.includes('/welcome/')) {
      const splitPartnerQuery = pathname.split('/')[2].split('?');
      referralPartner = splitPartnerQuery[0]; // Gets "bumble" from /welcome/bumble?code=123

      if (splitPartnerQuery.length === 2) {
        const splitCodeQuery = splitPartnerQuery[0].split('='); // Gets "123" from /welcome/bumble?code=123
        if (splitCodeQuery[0] === 'code') {
          referralCode = splitCodeQuery[1];
        }
      }
    }
    if (pathname?.includes('/register')) {
      const splitPartnerQuery = pathname.split('?'); // Gets "partner=bumble&code=123" from /register?partner=bumble&code=123
      if (splitPartnerQuery.length === 2) {
        const splitCodeQuery = splitPartnerQuery[1].split('&'); // Gets "partner=bumble" and "code=123"

        if ((splitCodeQuery[0].split('=')[0] = 'partner')) {
          referralPartner = splitCodeQuery[0].split('=')[1];
        }
        if (splitCodeQuery.length === 2 && (splitCodeQuery[1].split('=')[0] = 'code')) {
          referralCode = splitCodeQuery[1].split('=')[1];
        }
      }
    }
    // Partners include their name in UTM link data (e.g. ?utm_source=bumble or
    // ?utm_campaign=bumble-june-2026)
    if (!referralPartner && searchParams) {
      const utmData = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .map((key) => searchParams.get(key))
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (utmData) {
        referralPartner = partnerKeys.find((key) => utmData.includes(key));
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
    if (referralCode) setReferralCode(referralCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
