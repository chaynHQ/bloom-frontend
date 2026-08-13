'use client';

import { floatingBannerGap, getFloatingBannerPosition } from '@/lib/constants/banners';
import { COOKIES_ACCEPTED, COOKIES_REJECTED } from '@/lib/constants/events';
import { useAppDispatch } from '@/lib/hooks/store';
import {
  ANALYTICS_CONSENT_COOKIE,
  notifyCookieConsentDecided,
} from '@/lib/hooks/useCookieConsentDecided';
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

const CookieBanner = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tS = useTranslations('Shared');
  // The mobile bottom nav is rendered below `md`, so the banner must clear it on those screens.
  const hasMobileBottomNav = useMediaQuery(theme.breakpoints.down('md'));

  const consentBoxStyle: React.CSSProperties = {
    ...getFloatingBannerPosition(hasMobileBottomNav),
    backgroundColor: theme.palette.secondary.light,
    // Percentages resolve against the fixed containing block, which excludes the scrollbar; `vw`
    // does not, and would push the banner off its inline-end anchor by the scrollbar's width.
    maxWidth: `min(${theme.spacing(54)}, calc(100% - ${floatingBannerGap * 2}px))`,
    maxHeight: theme.spacing(35),
    borderRadius: theme.spacing(2),
    boxShadow: `${alpha(theme.palette.common.black, 0.2)} 0px ${theme.spacing(1)} ${theme.spacing(
      4,
    )} 0px`,
    lineHeight: 1.5,
    padding: `${theme.spacing(3)} ${theme.spacing(2)} `,
  };

  const rowContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 1,
  } as const;

  const acceptButtonStyle = {
    backgroundColor: 'secondary.main',
    marginInlineStart: '0.5rem',
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
    notifyCookieConsentDecided();
  };

  const handleAccept = () => {
    sendGAEvent('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    logEvent(COOKIES_ACCEPTED);
    dispatch(setCookiesAccepted(true));
    notifyCookieConsentDecided();
  };

  useEffect(() => {
    sendGAEvent('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
    });
  }, []);

  useEffect(() => {
    const cookieConsent = getCookieConsentValue(ANALYTICS_CONSENT_COOKIE);
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
      cookieName={ANALYTICS_CONSENT_COOKIE}
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
        <Box
          sx={{
            width: 50,
            height: 50,
          }}
        >
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
        <Box
          sx={{
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.875rem !important',
            }}
          >
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
