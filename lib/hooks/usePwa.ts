'use client';

import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setPwaDismissed } from '@/lib/store/userSlice';
import logEvent from '@/lib/utils/logEvent';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import { PWA_DISMISSED, PWA_INSTALLED } from '../constants/events';

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
  const [bannerState, setBannerState] = useState<PwaBannerState>('Hidden');
  const [installAttempted, setInstallAttempted] = useState(false);
  const dispatch = useAppDispatch();
  const user = useTypedSelector((state) => state.user);
  const userCookiesAccepted = user.cookiesAccepted || Cookies.get('analyticsConsent') === 'true';

  const getPwaMetaData = useMemo(() => {
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

  const declineInstallation = async () => {
    if (userCookiesAccepted) {
      Cookies.set(PWA_BANNER_DISMISSED, 'true');
      logEvent(PWA_DISMISSED, getPwaMetaData);
    }
    setBannerState('Hidden');
    await dispatch(setPwaDismissed(true));
  };
  const install = () => {
    (window?.beforeinstallpromptEvent as BeforeInstallPromptEvent)?.prompt();
    setInstallAttempted(true);
  };
  const appInstalledCb = () => {
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
    setBannerState('Hidden');
  };

  useEffect(() => {
    const pwaBannerDismissedCookie = Boolean(Cookies.get(PWA_BANNER_DISMISSED));
    const isStandalone =
      typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    const isIos =
      typeof window !== 'undefined' &&
      /iphone|ipad|ipod/.test(window?.navigator.userAgent.toLowerCase());

    const isHidden =
      pwaBannerDismissedCookie ||
      user.pwaDismissed ||
      isStandalone ||
      (window?.beforeinstallpromptEvent === undefined && !isIos);

    if (isHidden && bannerState !== 'Hidden') setBannerState('Hidden');
    if (installAttempted && isIos && bannerState !== 'Ios') setBannerState('Ios');
    if (!isHidden && !installAttempted && bannerState !== 'Generic') setBannerState('Generic');

    window.addEventListener('appinstalled', appInstalledCb);

    return () => {
      window.removeEventListener('appinstalled', appInstalledCb);
    };
  }, [user.pwaDismissed, installAttempted, bannerState]);

  return {
    declineInstallation,
    install,
    bannerState,
  };
}
