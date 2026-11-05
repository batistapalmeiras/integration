// Local
import { GENDER_LABELS, MARITAL_STATUS_LABELS } from '../../domain/memberRecords';
import { ENTRY_TYPE_DESCRIPTIONS, ENTRY_TYPE_LABELS, EntryType, WANTS_SMALL_GROUP_LABELS } from '../../types/church';
import { MaritalStatusOption } from './schema';

export const MARITAL_STATUS_OPTION_LABELS: Record<MaritalStatusOption, string> = {
  ...MARITAL_STATUS_LABELS,
  stable_union: 'União estável',
};

export const YES_NO_LABELS: Record<'yes' | 'no', string> = { yes: 'Sim', no: 'Não' };

const toOptions = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export const GENDER_OPTIONS = toOptions(GENDER_LABELS);
export const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUS_OPTION_LABELS);
export const WANTS_SMALL_GROUP_OPTIONS = toOptions(WANTS_SMALL_GROUP_LABELS);
export const YES_NO_OPTIONS = toOptions(YES_NO_LABELS);
export const ENTRY_TYPE_OPTIONS = (Object.entries(ENTRY_TYPE_LABELS) as [EntryType, string][]).map(([value, label]) => ({
  value,
  label,
  description: ENTRY_TYPE_DESCRIPTIONS[value],
}));

export const STEP_TITLES = ['Seus dados', 'Contato e endereço', 'Sua caminhada', 'Estatuto', 'Servir e comunidade'];
