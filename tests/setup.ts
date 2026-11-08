// Libs
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
// Local
import { clearQueries } from '../src/lib/queryCache';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  clearQueries();
  localStorage.clear();
  sessionStorage.clear();
});
