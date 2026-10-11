/// <reference types="vite-plugin-pwa/client" />
// Libs
import { registerSW } from 'virtual:pwa-register';

// registerType: 'autoUpdate' reloads the page by itself once a new service
// worker activates — but nothing ever looks for one after the first page
// load. On a phone that keeps the PWA installed, iOS suspends and resumes
// it without ever loading again, so a device can stay on a months-old
// bundle talking to a database that has moved on. These two checks are what
// make "autoUpdate" actually automatic.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function registerAppUpdates(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        if (navigator.onLine) registration.update();
      };

      // Coming back to the app is the moment that matters: it's how someone
      // picks up a deploy that happened while the app sat in the background.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });

      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
    },
  });
}
