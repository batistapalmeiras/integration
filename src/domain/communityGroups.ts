// Local
import { byName } from './text';

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
  leaderIds: string[];
  hostIds: string[];
  meetingDay: WeekDay | null;
}

export type GroupInput = Pick<CommunityGroup, 'name' | 'leaderIds' | 'hostIds' | 'meetingDay'>;

export interface PersonInGroup {
  id: string;
  name: string;
  isMember: boolean;
}

export type GroupOption = Pick<CommunityGroup, 'id' | 'name'>;

export interface CommunityGroupWithCount extends Pick<CommunityGroup, 'id' | 'name' | 'meetingDay'> {
  peopleCount: number;
}

export interface CommunityOverview {
  smallGroups: number;
  ministries: number;
}

export const percentOf = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100));

export interface GroupNames {
  ids: string[];
  names: string[];
}

export function groupNames(groups: GroupOption[]): GroupNames {
  const sorted = [...groups].sort(byName);
  return { ids: sorted.map((group) => group.id), names: sorted.map((group) => group.name) };
}
