import { Person } from '../../types/person';

export interface CoffeeEvent {
  id: string;
  event_date: string;
  event_time: string;
}

export interface CoffeeAttendance {
  id: string;
  person_id: string;
  coffee_event_id: string;
  confirmed: boolean;
  attended: boolean;
  presented_by_pastor: boolean;
}

export interface AttendeeRow extends CoffeeAttendance {
  person: Pick<Person, 'id' | 'name' | 'phone' | 'status'>;
}

export interface ActiveCohort {
  id: string;
  name: string;
}
