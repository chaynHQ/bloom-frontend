import React from 'react';
import CookieConsent from 'react-cookie-consent';

const Consent = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Sure man!!"
      cookieName="localConsent"
      style={{ background: '#2B373B' }}
      buttonStyle={{ color: '#4e503b', fontSize: '13px' }}
      expires={365}
      onAccept={() => {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          analytics_storage: 'granted',
        });
      }}
      enableDeclineButton
      onDecline={() => {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
        });
      }}
    >
      This website uses cookies to enhance the user experience.{' '}
      <span style={{ fontSize: '10px' }}>This bit of text is smaller :O</span>
    </CookieConsent>
  );
};

export default Consent;
