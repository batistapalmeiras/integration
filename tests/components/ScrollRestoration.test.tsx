// Libs
import { act, render } from '@testing-library/react';
import { MemoryRouter, NavigateFunction, useNavigate } from 'react-router-dom';
// Local
import { ScrollRestoration } from '../../src/components/ScrollRestoration';

describe('ScrollRestoration', () => {
  it('opens a new page at the top and returns to the list where it was', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    let navigate: NavigateFunction = () => undefined;
    function Capture() {
      navigate = useNavigate();
      return null;
    }
    render(
      <MemoryRouter initialEntries={['/membros']}>
        <ScrollRestoration />
        <Capture />
      </MemoryRouter>,
    );

    Object.defineProperty(window, 'scrollY', { value: 640, configurable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => navigate('/membros/1'));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 4000, configurable: true });
    act(() => navigate(-1));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 640);
  });
});
