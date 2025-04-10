import { usePathname } from '@/i18n/routing';
import { setEntryPartnerAccessCode, setEntryPartnerReferral } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useAppDispatch, useTypedSelector } from './store';

// Check if entry path is from a partner referral and if so, store referring partner and code in state and local storage
// This enables us to redirect a user to the correct sign up page later (e.g. in SignUpBanner)
export default function useReferralPartner() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const userCookiesAccepted =
    useTypedSelector((state) => state.user.cookiesAccepted) ||
    Cookies.get('analyticsConsent') === 'true';

  useEffect(() => {
    async function setReferralPartner(referralPartner: string) {
      if (userCookiesAccepted) Cookies.set('referralPartner', referralPartner);
      await dispatch(setEntryPartnerReferral(referralPartner));
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
    if (referralPartner) setReferralPartner(referralPartner);
    if (referralCode) setReferralCode(referralCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
