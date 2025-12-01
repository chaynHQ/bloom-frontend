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
import { mobileBottomNavHeight } from './MobileBottomNav';

const CookieBanner = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tS = useTranslations('Shared');
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isTabletScreen = useMediaQuery(theme.breakpoints.down('md'));

  const consentBoxStyle: React.CSSProperties = {
    backgroundColor: theme.palette.secondary.light,
    maxWidth: isMobileScreen ? 'none' : theme.spacing(54),
    maxHeight: theme.spacing(35),
    position: 'fixed',
    right: isMobileScreen ? 0 : theme.spacing(2),
    bottom: isMobileScreen
      ? mobileBottomNavHeight
      : isTabletScreen
        ? mobileBottomNavHeight + 20
        : theme.spacing(2),
    borderRadius: isMobileScreen ? 0 : theme.spacing(2),
    boxShadow: `${alpha(theme.palette.common.black, 0.2)} 0px ${theme.spacing(1)} ${theme.spacing(
      4,
    )} 0px`,
    lineHeight: 1.5,
    marginRight: isMobileScreen ? 0 : theme.spacing(2),
    padding: `${theme.spacing(3)} ${theme.spacing(2)} `,
    zIndex: 5,
  };

  const rowContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  } as const;

  const acceptButtonStyle = {
    backgroundColor: 'secondary.main',
    marginLeft: '0.5rem',
    float: 'inline-end',
    ':hover': {
      backgroundColor: 'secondary.dark',
    },
  };
  const declineButtonStyle = {
    float: 'inline-end',
    fontWeight: 'normal',
    color: theme.palette.text.primary,
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
      <Box sx={rowContainerStyle}>
        <Box width={50}>
          <Image
            alt={tS('alt.cookieCat')}
            src={IllustrationCookieCat}
            sizes={getImageSizes(50)}
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </Box>
        <Box mb={2} flex={1}>
          <Typography fontSize={'0.875rem !important'}>
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
      </Box>
    </CookieConsent>
  );
};

export default CookieBanner;
