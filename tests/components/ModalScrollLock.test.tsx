// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModal } from 'bp-kit';
// Local
import { renderScreen } from '../support/render';

function Screen() {
  const { open, close, modal } = useModal('drawer');
  return (
    <>
      <button type="button" onClick={() => open(<button onClick={close}>Fechar gaveta</button>)}>
        Abrir
      </button>
      {modal}
    </>
  );
}

describe('modal scroll lock', () => {
  it('keeps the page behind still while a modal is open', async () => {
    renderScreen(<Screen />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(document.documentElement.style.overflow).toBe('hidden');

    await userEvent.click(screen.getByRole('button', { name: 'Fechar gaveta' }));
    expect(document.documentElement.style.overflow).toBe('');
  });
});
