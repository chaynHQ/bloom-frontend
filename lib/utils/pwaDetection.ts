import { useEffect, useState } from 'react';

export interface PWAStatus {
  isInstalled: boolean;
  installSource: string;
  displayMode: string;
  detectionMethods: Record<string, boolean>;
}

/**
 * Detects if the app is running as an installed PWA
 * @returns PWA status information or null if running on server
 */
export const detectPWA = (): PWAStatus | null => {
  // Early return if running on server
  if (typeof window === 'undefined') {
    return null;
  }

  // Basic display mode checks
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullScreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
  const isWindowControls = window.matchMedia('(display-mode: window-controls-overlay)').matches;

  // Platform-specific checks
  const iosPWA = Boolean((window.navigator as any).standalone);
  const isWindowsApp = navigator.userAgent.includes('MSAppHost');
  const isAndroidPWA = document.referrer.includes('android-app://');

  // Technical checks
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasManifest = !!Array.from(document.querySelectorAll('link')).find(
    (link) => link.rel === 'manifest',
  );
  const isHttps = window.location.protocol === 'https:';

  // Combined determination
  const detectionMethods = {
    isStandalone,
    isFullScreen,
    isMinimalUi,
    isWindowControls,
    iosPWA,
    isWindowsApp,
    isAndroidPWA,
    hasServiceWorker,
    hasManifest,
    isHttps,
  };

  const isInstalled =
    isStandalone ||
    isFullScreen ||
    isMinimalUi ||
    isWindowControls ||
    iosPWA ||
    isWindowsApp ||
    isAndroidPWA;

  // Determine display mode
  let displayMode = 'browser';
  if (isStandalone) displayMode = 'standalone';
  if (isFullScreen) displayMode = 'fullscreen';
  if (isMinimalUi) displayMode = 'minimal-ui';
  if (isWindowControls) displayMode = 'window-controls-overlay';

  // Determine install source
  let installSource = 'browser';
  if (isAndroidPWA) {
    installSource = 'Android';
  } else if (iosPWA) {
    installSource = 'iOS';
  } else if (isWindowsApp) {
    installSource = 'Windows Store';
  } else if (isWindowControls) {
    installSource = 'Chrome Desktop';
  } else if (isStandalone || isFullScreen || isMinimalUi) {
    installSource = 'Home Screen';
  }

  return {
    isInstalled,
    installSource,
    displayMode,
    detectionMethods,
  };
};

/**
 * Hook to monitor PWA installation status
 */
export const usePWAStatus = () => {
  // Use lazy initialization to avoid calling detectPWA on every render
  const [pwaStatus, setPwaStatus] = useState<PWAStatus | null>(() => detectPWA());

  useEffect(() => {
    // Set up listeners for display mode changes
    const modeQueries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: minimal-ui)'),
      window.matchMedia('(display-mode: window-controls-overlay)'),
    ];

    const handleDisplayModeChange = () => {
      setPwaStatus(detectPWA());
    };

    modeQueries.forEach((query) => {
      query.addEventListener('change', handleDisplayModeChange);
    });

    return () => {
      modeQueries.forEach((query) => {
        query.removeEventListener('change', handleDisplayModeChange);
      });
    };
  }, []);

  return pwaStatus;
};

/**
 * Store PWA status in local storage
 */
export const storePWAStatus = (status: PWAStatus | null): void => {
  if (typeof localStorage === 'undefined' || !status) return;

  localStorage.setItem('pwaInstalled', String(status.isInstalled));
  localStorage.setItem('pwaInstallSource', status.installSource);
  localStorage.setItem('pwaDisplayMode', status.displayMode);
};

/**
 * Get previously stored PWA status
 */
export const getStoredPWAStatus = (): { isInstalled: boolean; source: string } | null => {
  if (typeof localStorage === 'undefined') return null;

  const isInstalled = localStorage.getItem('pwaInstalled') === 'true';
  const source = localStorage.getItem('pwaInstallSource') || '';

  return { isInstalled, source };
};
