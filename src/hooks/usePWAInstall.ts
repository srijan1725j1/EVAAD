import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALLED_STORAGE_KEY = 'evaad_pwa_installed_v1';

// Keep a module-level reference in case beforeinstallprompt fires before a component mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

function checkIsCurrentlyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isStandaloneMedia =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches;

    const isIOSStandalone =
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const isAndroidTwa = document.referrer.includes('android-app://');

    const storedInstalled = localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true';

    return isStandaloneMedia || isIOSStandalone || isAndroidTwa || storedInstalled;
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsCurrentlyInstalled());
  const [isIOS, setIsIOS] = useState(false);

  const markAsInstalled = useCallback(() => {
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
    } catch {}
    globalDeferredPrompt = null;
    setDeferredPrompt(null);
    setIsInstalled(true);
    window.dispatchEvent(new Event('evaad-pwa-installed'));
  }, []);

  useEffect(() => {
    if (checkIsCurrentlyInstalled()) {
      setIsInstalled(true);
    }

    // Check navigator.getInstalledRelatedApps if supported (Chrome/Android)
    const nav = window.navigator as unknown as {
      getInstalledRelatedApps?: () => Promise<Array<{ id?: string; platform?: string; url?: string }>>;
    };
    if (typeof nav.getInstalledRelatedApps === 'function') {
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (Array.isArray(apps) && apps.length > 0) {
            markAsInstalled();
          }
        })
        .catch(() => {});
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        markAsInstalled();
      }
    };
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      markAsInstalled();
    };

    const handleCustomInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('evaad-pwa-installed', handleCustomInstalled);

    return () => {
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('evaad-pwa-installed', handleCustomInstalled);
    };
  }, [markAsInstalled]);

  const install = async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        markAsInstalled();
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    install,
    markAsInstalled,
  };
}
