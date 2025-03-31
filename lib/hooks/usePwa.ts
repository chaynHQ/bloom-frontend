'use client';

import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import { setPwaDismissed } from '@/lib/store/userSlice';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';

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
  const [bannerState, setBannerState] = useState<PwaBannerState>('Generic');
  const [installAttempted, setInstallAttempted] = useState(false);
  const dispatch = useAppDispatch();

  const user = useTypedSelector((state) => state.user);
  const userCookiesAccepted = user.cookiesAccepted || Cookies.get('analyticsConsent') === 'true';
  const isIos = useMemo(
    () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()),
    [],
  );

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
    const isHidden =
      pwaBannerDismissedCookie ||
      user.pwaDismissed ||
      isStandalone ||
      (window?.beforeinstallpromptEvent === undefined && !isIos);

    if (isHidden && bannerState !== 'Hidden') setBannerState('Hidden');
    if (installAttempted && isIos && bannerState !== 'Ios') setBannerState('Ios');

    window.addEventListener('appinstalled', appInstalledCb);

    return () => {
      window.removeEventListener('appinstalled', appInstalledCb);
    };
  }, [isIos, user.pwaDismissed, installAttempted, bannerState]);

  return {
    declineInstallation,
    install,
    bannerState,
  };
}
