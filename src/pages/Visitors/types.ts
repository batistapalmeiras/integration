export { STATUS_META, type Person, type PersonStatus, type StatusTone } from '../../types/person';

export type ContactChannel = 'video' | 'audio' | 'text';
export type ContactResult = 'accepted' | 'declined' | 'no_response';

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  text: 'Texto',
};

export const RESULT_LABELS: Record<ContactResult, string> = {
  accepted: 'Aceitou o convite',
  declined: 'Recusou',
  no_response: 'Sem resposta',
};
