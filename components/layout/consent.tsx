import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React from 'react';
import CookieConsent from 'react-cookie-consent';

const Consent = () => {
  const router = useRouter();
  return (
    <CookieConsent
      location="bottom"
      buttonText="Sure man!!"
      cookieName="analyticsConsent"
      style={{ background: '#2B373B' }}
      buttonStyle={{ color: '#4e503b', fontSize: '13px' }}
      expires={365}
      onAccept={() => {
        Cookies.set('analyticsConsent', 'true');
        router.reload();
      }}
      enableDeclineButton
      onDecline={() => {
        Cookies.set('analyticsConsent', 'false');
        router.reload();
      }}
    >
      This website uses cookies to enhance the user experience.{' '}
      <span style={{ fontSize: '10px' }}>This bit of text is smaller :O</span>
    </CookieConsent>
  );
};

export default Consent;
