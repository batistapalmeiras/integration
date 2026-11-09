// Local
import { GENDER_LABELS } from '../../domain/memberRecords';
import { toOptions } from '../../domain/text';
import { ENTRY_TYPE_DESCRIPTIONS, ENTRY_TYPE_LABELS, EntryType, WANTS_SMALL_GROUP_LABELS } from '../../types/church';

export const GENDER_OPTIONS = toOptions(GENDER_LABELS);
export const WANTS_SMALL_GROUP_OPTIONS = toOptions(WANTS_SMALL_GROUP_LABELS);

export const WANTS_TO_SERVE_LABELS = {
  yes: 'Sim',
  no: 'Não posso ou não desejo servir agora',
};
export const WANTS_TO_SERVE_OPTIONS = toOptions(WANTS_TO_SERVE_LABELS);
export const ENTRY_TYPE_OPTIONS = (Object.entries(ENTRY_TYPE_LABELS) as [EntryType, string][]).map(([value, label]) => ({
  value,
  label,
  description: ENTRY_TYPE_DESCRIPTIONS[value],
}));

interface LastChurchPrompt {
  label: string;
  review: string;
  placeholder: string;
  hint?: string;
}

export const LAST_CHURCH_PROMPTS: Record<EntryType, LastChurchPrompt> = {
  baptism: {
    label: 'Qual a última igreja que você frequentou?',
    review: 'Última igreja que frequentou',
    placeholder: 'Ex.: Igreja Batista Central no Palmeiras',
    hint: 'Se a Batista Palmeiras é a primeira igreja que você frequenta, escreva o nome dela.',
  },
  transfer_letter: {
    label: 'De qual igreja você é membro hoje?',
    review: 'Igreja onde é membro',
    placeholder: 'Nome da igreja onde você é membro',
    hint: 'É dessa igreja que vamos pedir sua carta.',
  },
  acclamation: {
    label: 'De qual igreja você vem?',
    review: 'Igreja de onde vem',
    placeholder: 'Nome da igreja que você frequentava',
  },
  reconciliation: {
    label: 'De qual igreja você foi desligado(a)?',
    review: 'Igreja de onde foi desligado(a)',
    placeholder: 'Nome da igreja de onde você foi desligado(a)',
  },
};

export const STEP_TITLES = ['Seus dados', 'Contato e endereço', 'Sua caminhada', 'Estatuto', 'Servir e comunidade'];
