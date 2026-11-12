// Libs
import { screen } from '@testing-library/react';
// Local
import { WaitingNotice } from '../../../../src/pages/Visitors/Detail/components/StatusNotice';
import { renderScreen } from '../../../support/render';

describe('visitor status notices', () => {
  it('tells who is responsible for the stage when the user cannot act on it', () => {
    renderScreen(<WaitingNotice who="os professores" />);

    expect(screen.getByText('Aguardando os professores')).toBeInTheDocument();
  });
});
