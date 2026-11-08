// Libs
import { screen } from '@testing-library/react';
// Local
import { IntroStep } from '../../../src/pages/IntegrationSignup/components/IntroStep';
import { getActiveCohortSchedule } from '../../../src/repositories/publicForms';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/publicForms', () => ({ getActiveCohortSchedule: vi.fn() }));

const schedule = vi.mocked(getActiveCohortSchedule);
const continueButton = () => screen.getByRole('button', { name: 'Continuar' });

describe('integration signup intro', () => {
  it('lists the lessons of the active cohort and lets the person continue', async () => {
    schedule.mockResolvedValue({ cohort_name: 'Turma 15/11/2026', lesson_dates: ['2026-11-15', '2026-11-22'] });
    renderScreen(<IntroStep onContinue={() => undefined} />);
    expect(await screen.findByText(/Turma 15\/11\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/1ª aula — 15\/11\/2026/)).toBeInTheDocument();
    expect(continueButton()).toBeEnabled();
  });

  it('explains there is no open cohort', async () => {
    schedule.mockResolvedValue(null);
    renderScreen(<IntroStep onContinue={() => undefined} />);
    expect(await screen.findByText(/Não há nenhuma turma de Integração ativa/)).toBeInTheDocument();
    expect(continueButton()).toBeDisabled();
  });

  it('tells the person to retry when the schedule fails to load', async () => {
    schedule.mockRejectedValue(new Error('offline'));
    renderScreen(<IntroStep onContinue={() => undefined} />);
    expect(await screen.findByText(/Não foi possível carregar agora/)).toBeInTheDocument();
    expect(screen.queryByText(/Não há nenhuma turma/)).not.toBeInTheDocument();
    expect(continueButton()).toBeDisabled();
  });
});
