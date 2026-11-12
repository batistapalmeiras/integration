// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, Form, InfoBox, Select, Skeleton, useModal, useToast } from 'bp-kit';
import { Check, Plus } from 'lucide-react';
// Components
import { EndActions, FieldGrid, Section, SectionDivider, Sections } from '../../components/FormLayout';
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { Columns, WideContent } from '../../components/PageColumns';
import { PageHeader } from '../../components/PageHeader';
import { PanelTitle } from '../../components/Panel';
// Local
import { Council } from '../../domain/councils';
import { formatDate } from '../../domain/dates';
import { communityDeclines } from '../../domain/membership';
import { PersonSensitive } from '../../domain/personSensitive';
import { CouncilModal } from '../../features/councils';
import { FamilyFields, FamilyFormValues, familyFormValues, saveFamily } from '../../features/family';
import { MemberConfirmation, Person, useVisitorProfile } from '../../features/visitors';
import { errorMessage } from '../../lib/queryCache';
import { useCouncils } from '../../queries/councils';
import { useFamily, usePersonSensitive } from '../../queries/person';
import { useMinistries, useSmallGroups } from '../../queries/reference';
import { Family } from '../../repositories/family';
import { AppRoute } from '../../routes/paths';
import { CommunityFields } from '../Visitors/components/CommunityFields';
import { EntryList } from '../Visitors/Info/EntryList';
import { membershipCommunityEntries } from '../Visitors/Info/sensitive';
import { CommunityFormValues, communitySchema } from '../Visitors/validators';
import { Actions, Answers, CommunityGrid } from './styles';

export function ConfirmMemberPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { person, profile, loading, error, confirmMember } = useVisitorProfile(id);
  const family = useFamily(id);
  const sensitive = usePersonSensitive(id);
  const councils = useCouncils();

  const loadError =
    error ?? errorMessage(family.error) ?? errorMessage(sensitive.error) ?? errorMessage(councils.error);
  if (loadError) return <Empty title="Não foi possível carregar" description={loadError} />;
  if (loading || !person || !family.data || sensitive.data === undefined || !councils.data) {
    return <Skeleton $h="320px" />;
  }
  if (person.status !== 'membership_pending') {
    return <Empty title="Nada para confirmar" description={`${person.name} não está aguardando confirmação.`} />;
  }

  return (
    <ConfirmMemberForm
      person={person}
      smallGroupIds={profile.smallGroupIds}
      family={family.data}
      sensitive={sensitive.data}
      councils={councils.data}
      confirmMember={confirmMember}
    />
  );
}

interface FormProps {
  person: Person;
  smallGroupIds: string[];
  family: Family;
  sensitive: PersonSensitive | null;
  councils: Council[];
  confirmMember: (confirmation: MemberConfirmation) => Promise<void>;
}

function ConfirmMemberForm({ person, smallGroupIds, family, sensitive, councils, confirmMember }: FormProps) {
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();
  const { open, close, modal } = useModal('drawer');
  const smallGroups = useSmallGroups().data ?? [];
  const ministries = useMinistries().data ?? [];
  const community = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    values: { smallGroupIds, ministryIds: [] },
  });
  const familyForm = useForm<FamilyFormValues>({ defaultValues: familyFormValues(family) });
  const councilForm = useForm<{ councilId: string }>({ defaultValues: { councilId: '' } });
  const councilId = useWatch({ control: councilForm.control, name: 'councilId' });
  const hasCouncil = councils.length > 0;

  const submit = community.handleSubmit(async (values) => {
    try {
      if (familyForm.formState.isDirty) await saveFamily(person.id, family, familyForm.getValues());
      await confirmMember({
        councilId,
        smallGroupIds: values.smallGroupIds,
        ministryIds: values.ministryIds,
      });
      navigate(AppRoute.Membership);
    } catch (e) {
      showToast(errorMessage(e) ?? 'Não foi possível confirmar.');
    }
  });

  return (
    <WideContent>
      <PageHeader title="Confirmar membro" subtitle={person.name} back />

      <Columns>
        <Answers>
          <Section aria-label="Respostas da ficha">
            <PanelTitle>Respostas da ficha</PanelTitle>
            <EntryList entries={membershipCommunityEntries(sensitive)} />
          </Section>
          <MembershipAlerts personId={person.id} boxed />
        </Answers>

        <Form onSubmit={submit}>
          <Sections>
            <Section aria-label="Conselho Administrativo">
              <PanelTitle>Conselho Administrativo</PanelTitle>
              {hasCouncil ? (
                <Select label="Aprovado no Conselho Administrativo de" control={councilForm.control} name="councilId">
                  <option value="">Selecione</option>
                  {councils.map((council) => (
                    <option key={council.id} value={council.id}>
                      {formatDate(council.meetingDate)}
                    </option>
                  ))}
                </Select>
              ) : (
                <>
                  <InfoBox variant="warning">Nenhum Conselho Administrativo criado. Crie um para confirmar.</InfoBox>
                  <EndActions>
                    <Button type="button" variant="secondary" onClick={() => open(<CouncilModal close={close} />)}>
                      <Plus size={16} />
                      Novo Conselho
                    </Button>
                  </EndActions>
                </>
              )}
            </Section>

            <SectionDivider>
              <Section aria-label="Comunidade">
                <PanelTitle>Comunidade</PanelTitle>
                <CommunityGrid>
                  <CommunityFields
                    control={community.control}
                    declines={communityDeclines(sensitive)}
                    smallGroups={smallGroups}
                    ministries={ministries}
                  />
                </CommunityGrid>
              </Section>
            </SectionDivider>

            <SectionDivider>
              <Section aria-label="Família">
                <PanelTitle>Família</PanelTitle>
                <FieldGrid>
                  <FamilyFields personId={person.id} family={family} control={familyForm.control} />
                </FieldGrid>
              </Section>
            </SectionDivider>

            <Actions>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!councilId || community.formState.isSubmitting}
              >
                {community.formState.isSubmitting ? (
                  'Confirmando...'
                ) : (
                  <>
                    <Check size={16} />
                    Confirmar como membro
                  </>
                )}
              </Button>
            </Actions>
          </Sections>
        </Form>
      </Columns>
      {modal}
      {toast}
    </WideContent>
  );
}
