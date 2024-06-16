import { getAnalytics } from '@firebase/analytics';
import { Box, Button, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { COOKIES_ACCEPTED, COOKIES_REJECTED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import IllustrationCookieCat from '../../public/illustration_cookie_cat.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const Consent = (props: {}) => {
  const theme = useTheme();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const tS = useTranslations('Shared');
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const consentBoxStyle: React.CSSProperties = {
    backgroundColor: theme.palette.secondary.light,
    maxWidth: theme.spacing(50),
    maxHeight: theme.spacing(35),
    position: 'fixed',
    left: isMobileScreen ? theme.spacing(1) : theme.spacing(2),
    bottom: isMobileScreen ? theme.spacing(1) : theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: `${alpha(theme.palette.common.black, 0.2)} 0px ${theme.spacing(1)} ${theme.spacing(
      4,
    )} 0px`,
    textAlign: 'center',
    lineHeight: 1.5,
    marginRight: isMobileScreen ? theme.spacing(1) : theme.spacing(2),
    padding: isMobileScreen
      ? `${theme.spacing(1)} ${theme.spacing(3)}`
      : `${theme.spacing(2)} ${theme.spacing(4)}`,
  };
  const acceptButtonStyle = {
    backgroundColor: 'secondary.main',
    marginBottom: theme.spacing(1),
  };
  const declineButtonStyle = {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'normal',
    margin: 'auto',
    display: 'block',
    color: theme.palette.common.black,
  };

  const handleDecline = () => {
    getAnalytics();

    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
    });
    logEvent(COOKIES_REJECTED, eventUserData);
  };
  const handleAccept = () => {
    getAnalytics();

    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'granted',
    });
    logEvent(COOKIES_ACCEPTED, eventUserData);
  };

  return (
    <CookieConsent
      style={consentBoxStyle}
      disableStyles={true}
      buttonText={tS('cookieConsent.acceptLabel')}
      declineButtonText={tS('cookieConsent.declineLabel')}
      cookieName="analyticsConsent"
      location="none"
      expires={365}
      onAccept={handleAccept}
      onDecline={handleDecline}
      enableDeclineButton
      ButtonComponent={Button}
      customButtonProps={{
        size: 'medium',
        variant: 'contained',
        display: 'block',
        'qa-id': 'cookieConsentAcceptButton',
        sx: acceptButtonStyle,
      }}
      customDeclineButtonProps={{
        size: 'small',
        variant: 'text',
        'qa-id': 'cookieConsentDeclineButton',
        sx: declineButtonStyle,
      }}
      ariaAcceptLabel={tS('cookieConsent.acceptLabel')}
      ariaDeclineLabel={tS('cookieConsent.declineLabel')}
      flipButtons={true}
    >
      <Box width={[60, 70]} margin="auto" marginBottom={2}>
        <Image
          alt={tS('alt.cookieCat')}
          src={IllustrationCookieCat}
          sizes="100vw"
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </Box>
      <Box
        marginBottom={2}
        sx={{
          fontSize: theme.typography.body2.fontSize,
          [theme.breakpoints.up('sm')]: {
            fontSize: theme.typography.body1.fontSize,
          },
        }}
      >
        {tS('cookieConsent.cookieConsentExplainer')}
        <Link
          target="_blank"
          href="https://chayn.notion.site/Cookie-Policy-e478b184ea6a4002ba660d052f332c5a"
        >
          {tS('cookieConsent.cookieConsentPolicy')}
        </Link>
      </Box>
    </CookieConsent>
  );
};

export default Consent;
