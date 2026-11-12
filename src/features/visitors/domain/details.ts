// Local
import { Person } from './types';

export type DetailTab = 'integration' | 'membership' | 'makeup';

export const DETAIL_TAB_LABELS: Record<DetailTab, string> = {
  integration: 'Integração',
  membership: 'Membresia',
  makeup: 'Reposição',
};

const INTEGRATION_REACHED = ['integration', 'membership_pending', 'member'];
const MEMBERSHIP_REACHED = ['membership_pending', 'member'];

interface DetailAccess {
  canSeeAnswers: boolean;
  makeupCount: number;
}

export function detailTabs(person: Person, { canSeeAnswers, makeupCount }: DetailAccess): DetailTab[] {
  return [
    canSeeAnswers && INTEGRATION_REACHED.includes(person.status) && ('integration' as const),
    canSeeAnswers && MEMBERSHIP_REACHED.includes(person.status) && ('membership' as const),
    makeupCount > 0 && ('makeup' as const),
  ].filter((tab): tab is DetailTab => !!tab);
}
