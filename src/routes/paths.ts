export enum AppRoute {
  Login = '/entrar',
  ForgotPassword = '/entrar/recuperar',
  ResetPassword = '/entrar/nova-senha',
  Dashboard = '/painel',
  Visitors = '/visitantes',
  ArchivedVisitors = '/visitantes/arquivado',
  Coffee = '/cafe-de-boas-vindas',
  Classes = '/turma',
  Volunteers = '/controle-de-acesso',
  Reports = '/relatorios',
  Profile = '/perfil',
  ChangePassword = '/perfil/senha',
  ProfileView = '/perfil/visao',
  IntegrationSignup = '/integracao/inscricao',
  MakeupAttendance = '/turma/reposicao',
  MembershipInterest = '/integracao/ficha-de-interesse',
  MembershipSignup = '/cadastro-de-membresia',
  Members = '/membros',
  Birthdays = '/membros/aniversariantes',
  Membership = '/conselho',
  CommunityGroups = '/comunidade',
  Ministries = '/comunidade/ministerios',
  SmallGroups = '/comunidade/pgs',
  Store = '/loja',
  NewStoreItem = '/loja/novo',
}

export const profilePath = (profileId: string) => `${AppRoute.Profile}/${profileId}`;

const sectionPath = (base: string, section?: string) => (section ? `${base}/${section}` : base);

export const profileAccessPath = (profileId: string) => sectionPath(profilePath(profileId), 'acesso');

export const memberPath = (personId: string, section?: string) => sectionPath(`${AppRoute.Members}/${personId}`, section);

export const confirmMemberPath = (personId: string) => `${AppRoute.Membership}/${personId}/confirmar`;

export const COUNCILS_PATH = `${AppRoute.Reports}/conselhos-administrativos`;

export const councilPath = (councilId: string) => `${COUNCILS_PATH}/${councilId}`;

const ENTITY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isEntityId = (segment: string | undefined) => !!segment && ENTITY_ID.test(segment);
