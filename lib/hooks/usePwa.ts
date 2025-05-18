'use client';

import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import { setPwaDismissed } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

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

const PWA_DISMISSED = 'pwaBannerDismissed';

export default function usePWA() {
  const [bannerState, setBannerState] = useState<PwaBannerState>('Hidden');
  const [installAttempted, setInstallAttempted] = useState(false);
  const dispatch = useAppDispatch();
  const user = useTypedSelector((state) => state.user);
  const userCookiesAccepted = user.cookiesAccepted || Cookies.get('analyticsConsent') === 'true';

  const declineInstallation = async () => {
    if (userCookiesAccepted) {
      Cookies.set(PWA_DISMISSED, 'true');
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
    window.beforeinstallpromptEvent = undefined;
    setBannerState('Hidden');
  };

  useEffect(() => {
    const pwaBannerDismissedCookie = Boolean(Cookies.get(PWA_DISMISSED));
    const isStandalone =
      typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    const isIos =
      typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window?.navigator.userAgent.toLowerCase());

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
