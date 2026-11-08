export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

export interface CommunityGroup {
  id: string;
  name: string;
  leaders: string[];
  hosts: string[];
  meetingDay: WeekDay | null;
}

export type GroupInput = Pick<CommunityGroup, 'name' | 'leaders' | 'hosts' | 'meetingDay'>;

export interface PersonInGroup {
  id: string;
  name: string;
}

export interface CommunityGroupWithCount extends CommunityGroup {
  peopleCount: number;
}

export interface CommunityOverview {
  smallGroups: number;
  ministries: number;
}
