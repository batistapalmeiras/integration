/// <reference types="vite-plugin-pwa/client" />
// Libs
import { registerSW } from 'virtual:pwa-register';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function registerAppUpdates(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        if (navigator.onLine) registration.update();
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });

      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
    },
  });
}
