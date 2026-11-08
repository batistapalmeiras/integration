/// <reference types="vite-plugin-pwa/client" />
// Libs
import { registerSW } from 'virtual:pwa-register';
// Local
import { storedValue } from './lib/storage';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const reloadedForMissingChunk = storedValue<boolean>('reloaded-for-missing-chunk', 'session');

export function reloadOnMissingChunk(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadedForMissingChunk.load()) return;
    reloadedForMissingChunk.save(true);
    event.preventDefault();
    window.location.reload();
  });
  window.addEventListener('load', () => reloadedForMissingChunk.clear());
}

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
