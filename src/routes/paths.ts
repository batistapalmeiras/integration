export enum AppRoute {
  Login = '/entrar',
  ForgotPassword = '/entrar/recuperar',
  ResetPassword = '/entrar/nova-senha',
  Dashboard = '/painel',
  ChurchMore = '/igreja/mais',
  IntegrationMore = '/integracao/mais',
  Visitors = '/visitantes',
  NewVisitor = '/visitantes/novo',
  ArchivedVisitors = '/visitantes/arquivado',
  People = '/pessoas',
  Coffee = '/cafe-de-boas-vindas',
  Classes = '/turma',
  Volunteers = '/voluntarios',
  Reports = '/relatorios',
  Profile = '/perfil',
  ChangePassword = '/perfil/senha',
  IntegrationSignup = '/integracao/inscricao',
  MakeupAttendance = '/turma/reposicao',
  MembershipInterest = '/integracao/ficha-de-interesse',
  MembershipSignup = '/cadastro-de-membresia',
  Members = '/membros',
  MemberPendencies = '/membros/pendencias',
  Birthdays = '/membros/aniversariantes',
  Membership = '/membresia',
  CommunityGroups = '/comunidade',
  Ministries = '/comunidade/ministerios',
  SmallGroups = '/comunidade/pgs',
  Store = '/loja',
  NewStoreItem = '/loja/novo',
}

export const confirmMemberPath = (personId: string) => `${AppRoute.Membership}/${personId}/confirmar`;

export const COUNCILS_PATH = `${AppRoute.Reports}/conselho-administrativo`;

export const councilPath = (councilId: string) => `${COUNCILS_PATH}/${councilId}`;

const ENTITY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isEntityId = (segment: string | undefined) => !!segment && ENTITY_ID.test(segment);
