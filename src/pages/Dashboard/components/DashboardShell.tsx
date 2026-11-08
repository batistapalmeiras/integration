// React
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Skeleton, text, useAuthCtx, useMediaQuery } from 'bp-kit';
import { ArrowRight } from 'lucide-react';
// Components
import { SIDEMENU_MEDIA } from '../../../components/Layout/styles';
import { PageHeader } from '../../../components/PageHeader';
import { NAV_ITEMS, navAreasFor } from '../../../routes/navigation';
// Local
import { EnterArea, Page } from '../styles';

const SAO_PAULO = { timeZone: 'America/Sao_Paulo' } as const;

function greeting(): string {
  const hour = Number(new Date().toLocaleString('en-US', { ...SAO_PAULO, hour: 'numeric', hour12: false }));
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel(): string {
  const label = new Date().toLocaleDateString('pt-BR', {
    ...SAO_PAULO,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface Props {
  loading: boolean;
  error: string | null;
  children: () => ReactNode;
}

export function DashboardShell({ loading, error, children }: Props) {
  const { user } = useAuthCtx();
  const navigate = useNavigate();
  const hasSidebar = useMediaQuery(SIDEMENU_MEDIA);
  const areas = navAreasFor(user?.role);
  const singleArea = !hasSidebar && areas.length === 1 ? areas[0] : null;
  const firstName = user?.name?.trim().split(' ')[0];

  return (
    <Page>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        subtitle={todayLabel()}
        action={
          singleArea && (
            <Button variant="secondary" onClick={() => navigate(NAV_ITEMS.profile.path)}>
              <NAV_ITEMS.profile.icon size={16} />
              Meu perfil
            </Button>
          )
        }
      />
      {error && <Empty title={text.feedback.loadError} description={error} />}
      {!error && loading && <Skeleton $h="480px" />}
      {!error && !loading && children()}
      {!error && !loading && singleArea && (
        <EnterArea>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate(singleArea.tabs[0].path)}>
            Ir para a {singleArea.title}
            <ArrowRight size={16} />
          </Button>
        </EnterArea>
      )}
    </Page>
  );
}
