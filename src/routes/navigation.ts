// Libs
import {
  Cake,
  Church,
  ClipboardCheck,
  Coffee,
  Contact,
  FileBarChart,
  Gavel,
  GraduationCap,
  HeartHandshake,
  History,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Sprout,
  Store,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
// Local
import { UserRole } from '../types/enums';
import { AppRoute, COUNCILS_PATH } from './paths';

export interface NavItem {
  label: string;
  tabLabel?: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS = {
  dashboard: { label: 'Painel', path: AppRoute.Dashboard, icon: LayoutDashboard },
  visitors: { label: 'Visitantes', path: AppRoute.Visitors, icon: Users },
  coffee: { label: 'Café', path: AppRoute.Coffee, icon: Coffee },
  classes: { label: 'Turmas', path: AppRoute.Classes, icon: GraduationCap },
  membership: { label: 'Membresia', path: AppRoute.Membership, icon: UserCheck },
  people: { label: 'Pessoas', path: AppRoute.People, icon: Contact },
  cohortHistory: { label: 'Histórico de turmas', path: `${AppRoute.Reports}/turmas`, icon: GraduationCap },
  coffeeHistory: { label: 'Histórico de cafés', path: `${AppRoute.Reports}/cafes`, icon: Coffee },
  councilHistory: { label: 'Histórico do Conselho Administrativo', path: COUNCILS_PATH, icon: Gavel },
  volunteers: { label: 'Voluntários', path: AppRoute.Volunteers, icon: UserPlus },
  reports: { label: 'Relatórios', path: AppRoute.Reports, icon: FileBarChart },
  members: { label: 'Membros', path: AppRoute.Members, icon: Users },
  pendencies: { label: 'Pendências', path: AppRoute.MemberPendencies, icon: ClipboardCheck },
  birthdays: { label: 'Aniversariantes', path: AppRoute.Birthdays, icon: Cake },
  ministries: { label: 'Ministérios', path: AppRoute.Ministries, icon: HeartHandshake },
  smallGroups: { label: 'Pequenos Grupos', tabLabel: 'PGs', path: AppRoute.SmallGroups, icon: UsersRound },
  store: { label: 'Loja', path: AppRoute.Store, icon: Store },
  profile: { label: 'Perfil', path: AppRoute.Profile, icon: User },
} satisfies Record<string, NavItem>;

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

interface NavArea {
  id: string;
  title: string;
  icon: LucideIcon;
  tabs: NavItem[];
  more: NavEntry[];
  morePath?: AppRoute;
}

const HISTORY_GROUP: NavGroup = {
  id: 'history',
  label: 'Histórico',
  icon: History,
  items: [
    { ...NAV_ITEMS.coffeeHistory, label: 'Cafés' },
    { ...NAV_ITEMS.cohortHistory, label: 'Turmas' },
  ],
};

const LEADERSHIP_HISTORY_GROUP: NavGroup = {
  ...HISTORY_GROUP,
  items: [...HISTORY_GROUP.items, { ...NAV_ITEMS.councilHistory, label: 'Conselho Administrativo' }],
};

export const PASTOR_NAV_AREAS: NavArea[] = [
  {
    id: 'church',
    title: 'Igreja',
    icon: Church,
    tabs: [NAV_ITEMS.members, NAV_ITEMS.pendencies, NAV_ITEMS.smallGroups, NAV_ITEMS.ministries],
    more: [NAV_ITEMS.birthdays, NAV_ITEMS.volunteers],
    morePath: AppRoute.ChurchMore,
  },
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.classes, NAV_ITEMS.membership],
    more: [NAV_ITEMS.people, LEADERSHIP_HISTORY_GROUP, NAV_ITEMS.reports],
    morePath: AppRoute.IntegrationMore,
  },
];

export const INTEGRATION_TEAM_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.people],
    more: [HISTORY_GROUP],
    morePath: AppRoute.IntegrationMore,
  },
];

const ADMIN_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.visitors, NAV_ITEMS.coffee, NAV_ITEMS.classes, NAV_ITEMS.membership],
    more: [
      NAV_ITEMS.people,
      NAV_ITEMS.members,
      NAV_ITEMS.volunteers,
      LEADERSHIP_HISTORY_GROUP,
      NAV_ITEMS.reports,
    ],
    morePath: AppRoute.IntegrationMore,
  },
];

const TEACHER_NAV_AREAS: NavArea[] = [
  {
    id: 'integration',
    title: 'Integração',
    icon: Sprout,
    tabs: [NAV_ITEMS.classes, NAV_ITEMS.people],
    more: [],
  },
];

const NAV_AREAS_BY_ROLE: Record<UserRole, NavArea[]> = {
  [UserRole.Pastor]: PASTOR_NAV_AREAS,
  [UserRole.Admin]: ADMIN_NAV_AREAS,
  [UserRole.IntegrationTeam]: INTEGRATION_TEAM_NAV_AREAS,
  [UserRole.Teacher]: TEACHER_NAV_AREAS,
};

export function navAreasFor(role: string | undefined): NavArea[] {
  return NAV_AREAS_BY_ROLE[role as UserRole] ?? [];
}

export const MORE_TAB_LABEL = 'Mais';
export const MORE_TAB_ICON = Menu;

export function areaItems(area: NavArea): NavItem[] {
  return [...area.tabs, ...area.more.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry]))];
}

function areaTabPaths(area: NavArea): string[] {
  return [...area.tabs.map((item) => item.path), ...(area.morePath ? [area.morePath] : [])];
}

export function findNavArea(areas: NavArea[], pathname: string): NavArea | undefined {
  return areas.find((area) => areaTabPaths(area).includes(pathname));
}

export function findNavAreaById(areas: NavArea[], id: string): NavArea | undefined {
  return areas.find((area) => area.id === id);
}

export function activeNavPath(pathname: string, paths: string[]): string | null {
  return (
    paths
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
