import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setEntryPartnerAccessCode, setEntryPartnerReferral } from '../store/userSlice';
import { useAppDispatch, useTypedSelector } from './store';

// Check if entry path is from a partner referral and if so, store referring partner and code in state and local storage
// This enables us to redirect a user to the correct sign up page later (e.g. in SignUpBanner)
export default function useReferralPartner() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userCookiesAccepted = useTypedSelector((state) => state.user.cookiesAccepted);

  useEffect(() => {
    async function setReferralPartner(referralPartner: string) {
      if (userCookiesAccepted) Cookies.set('referralPartner', referralPartner);
      await dispatch(setEntryPartnerReferral(referralPartner));
    }
    async function setReferralCode(referralCode: string) {
      await dispatch(setEntryPartnerAccessCode(referralCode));
    }

    const path = router.asPath;

    let referralPartner, referralCode;

    if (path?.includes('/welcome/')) {
      const splitPartnerQuery = path.split('/')[2].split('?');
      referralPartner = splitPartnerQuery[0]; // Gets "bumble" from /welcome/bumble?code=123

      if (splitPartnerQuery.length === 2) {
        const splitCodeQuery = splitPartnerQuery[0].split('='); // Gets "123" from /welcome/bumble?code=123
        if (splitCodeQuery[0] === 'code') {
          referralCode = splitCodeQuery[1];
        }
      }
    }
    if (path?.includes('/register')) {
      const splitPartnerQuery = path.split('?'); // Gets "partner=bumble&code=123" from /register?partner=bumble&code=123
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
