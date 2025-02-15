'use client';

import { COOKIES_ACCEPTED, COOKIES_REJECTED } from '@/lib/constants/events';
import { useAppDispatch } from '@/lib/hooks/store';
import { setCookiesAccepted } from '@/lib/store/userSlice';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import IllustrationCookieCat from '@/public/illustration_cookie_cat.svg';
import { Box, Button, Link, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { sendGAEvent } from '@next/third-parties/google';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect } from 'react';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';

const Consent = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
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
    ':hover': {
      backgroundColor: 'secondary.dark',
    },
  };
  const declineButtonStyle = {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'normal',
    margin: 'auto',
    display: 'block',
    color: theme.palette.common.black,
  };

  const handleDecline = () => {
    sendGAEvent('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    logEvent(COOKIES_REJECTED);
  };

  const handleAccept = () => {
    sendGAEvent('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    logEvent(COOKIES_ACCEPTED);
  };

  useEffect(() => {
    sendGAEvent('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
    });
  }, []);

  useEffect(() => {
    const cookieConsent = getCookieConsentValue('analyticsConsent');
    if (cookieConsent && cookieConsent === 'true') {
      dispatch(setCookiesAccepted(true));
    }
  }, [dispatch]);

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
        size: 'small',
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
      <Box width={[60, 70]} margin="auto" mb={1}>
        <Image
          alt={tS('alt.cookieCat')}
          src={IllustrationCookieCat}
          sizes={getImageSizes(70)}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </Box>
      <Box mb={2}>
        <Typography fontSize={'1rem !important'}>
          {tS('cookieConsent.cookieConsentExplainer')}
          <Link
            target="_blank"
            href="https://chayn.notion.site/Cookie-Policy-e478b184ea6a4002ba660d052f332c5a"
          >
            {tS('cookieConsent.cookieConsentPolicy')}
          </Link>
          .
        </Typography>
      </Box>
    </CookieConsent>
  );
};

export default Consent;
