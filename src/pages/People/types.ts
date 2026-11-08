// Local
import { PersonStatus } from '../../types/person';

export interface PersonRow {
  id: string;
  name: string;
  status: PersonStatus;
  whatsapp_opened_at: string | null;
  class_invite_sent_at: string | null;
  membership_interest_sent_at: string | null;
}
