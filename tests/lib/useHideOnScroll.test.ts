// Libs
import { act, renderHook } from '@testing-library/react';
// Local
import { useHideOnScroll } from '../../src/lib/useHideOnScroll';

const scrollTo = async (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
};

describe('useHideOnScroll', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4000 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('hides while scrolling down and comes back when scrolling up', async () => {
    const { result } = renderHook(() => useHideOnScroll(true, '/membros'));

    await scrollTo(400);
    expect(result.current).toBe(true);

    await scrollTo(300);
    expect(result.current).toBe(false);
  });

  it('comes back at the end of the page', async () => {
    const { result } = renderHook(() => useHideOnScroll(true, '/membros'));

    await scrollTo(1500);
    expect(result.current).toBe(true);

    await scrollTo(3200);
    expect(result.current).toBe(false);
  });

  it('shows again on another page', async () => {
    const { result, rerender } = renderHook(({ path }) => useHideOnScroll(true, path), {
      initialProps: { path: '/membros' },
    });

    await scrollTo(400);
    expect(result.current).toBe(true);

    rerender({ path: '/pendencias' });
    expect(result.current).toBe(false);
  });
});
