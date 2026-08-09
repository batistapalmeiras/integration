// React
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Archive } from 'lucide-react';
import { Button, Empty, PageHeader, Skeleton, Tab, TabBar, useAuthCtx } from 'bp-kit';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { ContactTab } from './components/ContactTab';
import { DetailsTab } from './components/DetailsTab';
import { ProgressStepper } from './components/ProgressStepper';
import { WhatsAppTab } from './components/WhatsAppTab';
import { useVisitorDetail } from './hooks';
import { Content, StatusRow } from './styles';

enum DetailTab {
  Details = 'details',
  WhatsApp = 'whatsapp',
  Contact = 'contact',
}

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { person, loading, error, updatePerson, registerContactAttempt, archive, reactivate } = useVisitorDetail(id ?? '');
  const [tab, setTab] = useState(DetailTab.Details);

  const canManage = user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Admin;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const isClosedOut = person.status === 'archived' || person.status === 'member';

  const handleSave = async (values: Parameters<typeof updatePerson>[0]) => {
    await updatePerson(values);
  };

  const handleRegisterContact = async (values: Parameters<typeof registerContactAttempt>[0]) => {
    await registerContactAttempt(values);
    setTab(DetailTab.Details);
  };

  return (
    <Content>
      <PageHeader
        title={person.name}
        subtitle="Visitante"
        back
        action={
          canManage ? (
            person.status === 'archived' ? (
              <Button variant="secondary" onClick={() => reactivate()}>
                Reativar
              </Button>
            ) : (
              !isClosedOut && (
                <Button variant="secondary" onClick={() => archive().then(() => navigate(AppRoute.Visitors))}>
                  <Archive size={16} />
                  Arquivar
                </Button>
              )
            )
          ) : undefined
        }
      />

      <StatusRow>
        <StatusPill status={person.status} />
      </StatusRow>

      <ProgressStepper status={person.status} />

      <TabBar>
        <Tab $active={tab === DetailTab.Details} onClick={() => setTab(DetailTab.Details)}>
          Detalhes
        </Tab>
        {canManage && person.status !== 'member' && (
          <Tab $active={tab === DetailTab.WhatsApp} onClick={() => setTab(DetailTab.WhatsApp)}>
            WhatsApp
          </Tab>
        )}
        {canManage && !isClosedOut && (
          <Tab $active={tab === DetailTab.Contact} onClick={() => setTab(DetailTab.Contact)}>
            Registrar contato
          </Tab>
        )}
      </TabBar>

      {tab === DetailTab.Details && <DetailsTab person={person} canEdit={canManage} onSave={handleSave} />}
      {tab === DetailTab.WhatsApp && canManage && person.status !== 'member' && <WhatsAppTab person={person} />}
      {tab === DetailTab.Contact && canManage && !isClosedOut && <ContactTab onSubmit={handleRegisterContact} />}
    </Content>
  );
}
