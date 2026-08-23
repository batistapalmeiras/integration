import { UserRole } from '../../types/enums';

export interface VolunteerRow {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
}
