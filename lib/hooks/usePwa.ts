'use client';

import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setPwaDismissed } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PWA_DISMISS_CLICKED,
  PWA_DISMISSED,
  PWA_INSTALL_CLICKED,
  PWA_INSTALLED,
} from '../constants/events';
import logEvent, { getEventUserData } from '../utils/logEvent';

type UserChoice = Promise<{
  outcome: 'accepted' | 'dismissed';
  platform: string;
}>;
type PwaBannerState = 'Hidden' | 'Generic' | 'Ios';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<UserChoice>;
  prompt(): Promise<void>;
}

const PWA_BANNER_DISMISSED = 'pwaBannerDismissed';

export default function usePWA() {
  const [installAttempted, setInstallAttempted] = useState(false);
  const dispatch = useAppDispatch();
  const user = useTypedSelector((state) => state.user);
  const userCookiesAccepted = user.cookiesAccepted || Cookies.get('analyticsConsent') === 'true';
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const getPwaMetaData = useMemo(() => {
    if (typeof window === 'undefined') {
      return { browser: 'Unknown Browser', platform: 'Unknown OS' };
    }

    const userAgent = window.navigator.userAgent;
    const platform = userAgent.includes('Win')
      ? 'Windows'
      : userAgent.includes('Mac')
        ? 'MacOS'
        : userAgent.includes('Linux')
          ? 'Linux'
          : 'Unknown OS';

    const browser = userAgent.includes('Chrome')
      ? 'Chrome'
      : userAgent.includes('Firefox')
        ? 'Firefox'
        : userAgent.includes('Safari')
          ? 'Safari'
          : userAgent.includes('Edge')
            ? 'Edge'
            : userAgent.includes('Edge')
              ? 'Opera'
              : 'Unknown Browser';

    return { browser, platform };
  }, []);

  const analyticsPayload = useMemo(() => {
    return {
      ...eventUserData,
      ...getPwaMetaData,
    };
  }, [eventUserData, getPwaMetaData]);

  const declineInstallation = async () => {
    if (userCookiesAccepted) {
      Cookies.set(PWA_BANNER_DISMISSED, 'true');
      logEvent(PWA_DISMISSED, getPwaMetaData);
    }
    await dispatch(setPwaDismissed(true));

    // Log the event for dismissing the installation
    logEvent(PWA_DISMISS_CLICKED, analyticsPayload);
  };
  const install = () => {
    (window?.beforeinstallpromptEvent as BeforeInstallPromptEvent)?.prompt();
    setInstallAttempted(true);

    // Log the event for clicking the install button
    logEvent(PWA_INSTALL_CLICKED, analyticsPayload);
  };
  const appInstalledCb = useCallback(() => {
    /**
     * Clear the cached beforeinstallpromptEvent after installation.
     *
     * This prevents the banner from showing again if the app is opened
     * immediately after installation. In some cases, isStandalone might
     * still return false momentarily, causing the banner to reappear.
     */
    if (userCookiesAccepted) {
      logEvent(PWA_INSTALLED, getPwaMetaData);
    }
    window.beforeinstallpromptEvent = undefined;

    // Log the event for app installation
    logEvent(PWA_INSTALLED, analyticsPayload);
  }, [userCookiesAccepted, getPwaMetaData, analyticsPayload]);

  // Derive banner state from conditions
  const bannerState = useMemo((): PwaBannerState => {
    // Return Hidden during SSR to prevent window access
    if (typeof window === 'undefined') {
      return 'Hidden';
    }

    const pwaBannerDismissedCookie = Boolean(Cookies.get(PWA_BANNER_DISMISSED));
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

    const isHidden =
      pwaBannerDismissedCookie ||
      user.pwaDismissed ||
      isStandalone ||
      (window.beforeinstallpromptEvent === undefined && !isIos);

    if (isHidden) return 'Hidden';
    if (installAttempted && isIos) return 'Ios';
    return 'Generic';
  }, [user.pwaDismissed, installAttempted]);

  // Set up appinstalled event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('appinstalled', appInstalledCb);

    return () => {
      window.removeEventListener('appinstalled', appInstalledCb);
    };
  }, [appInstalledCb]);

  return {
    declineInstallation,
    install,
    bannerState,
    getPwaMetaData,
  };
}
