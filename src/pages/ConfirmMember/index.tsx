// React
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, Form, Skeleton, useToast } from 'bp-kit';
import { Check } from 'lucide-react';
// Components
import { FieldGrid, SectionDivider } from '../../components/FormLayout';
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { Columns, SideColumn, WideContent } from '../../components/PageColumns';
import { PageHeader } from '../../components/PageHeader';
import { PanelTitle } from '../../components/Panel';
// Local
import { communityDeclines } from '../../domain/membership';
import { FamilyFields, FamilyFormValues, familyFormValues, saveFamily } from '../../features/family';
import { Person, useVisitorProfile } from '../../features/visitors';
import { errorMessage } from '../../lib/queryCache';
import { useFamily, usePersonSensitive } from '../../queries/person';
import { useMinistries, useSmallGroups } from '../../queries/reference';
import { Family } from '../../repositories/family';
import { AppRoute } from '../../routes/paths';
import { CommunityFields } from '../Visitors/components/CommunityFields';
import { EntryList } from '../Visitors/Info/EntryList';
import { membershipCommunityEntries } from '../Visitors/Info/sensitive';
import { CommunityFormValues, communitySchema } from '../Visitors/validators';
import { PersonSensitive } from '../../domain/personSensitive';
import { Actions, Section, Sections } from './styles';

export function ConfirmMemberPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { person, loading, error, confirmMember } = useVisitorProfile(id);
  const family = useFamily(id);
  const sensitive = usePersonSensitive(id);

  const loadError = error ?? errorMessage(family.error) ?? errorMessage(sensitive.error);
  if (loadError) return <Empty title="Não foi possível carregar" description={loadError} />;
  if (loading || !person || !family.data || sensitive.data === undefined) return <Skeleton $h="320px" />;
  if (person.status !== 'membership_pending') {
    return <Empty title="Nada para confirmar" description={`${person.name} não está aguardando confirmação.`} />;
  }

  return (
    <ConfirmMemberForm person={person} family={family.data} sensitive={sensitive.data} confirmMember={confirmMember} />
  );
}

interface FormProps {
  person: Person;
  family: Family;
  sensitive: PersonSensitive | null;
  confirmMember: (smallGroupId: string | null, ministryIds: string[]) => Promise<void>;
}

function ConfirmMemberForm({ person, family, sensitive, confirmMember }: FormProps) {
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();
  const smallGroups = useSmallGroups().data ?? [];
  const ministries = useMinistries().data ?? [];
  const community = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: { smallGroupIds: [], ministryIds: [] },
  });
  const familyForm = useForm<FamilyFormValues>({ defaultValues: familyFormValues(family) });

  const submit = community.handleSubmit(async (values) => {
    try {
      if (familyForm.formState.isDirty) await saveFamily(person.id, familyForm.getValues());
      await confirmMember(values.smallGroupIds[0] ?? null, values.ministryIds);
      navigate(AppRoute.Membership);
    } catch (e) {
      showToast(errorMessage(e) ?? 'Não foi possível confirmar.');
    }
  });

  return (
    <WideContent>
      <PageHeader title="Confirmar membro" subtitle={person.name} back />

      <Columns>
        <SideColumn>
          <Section aria-label="Respostas da ficha">
            <PanelTitle>Respostas da ficha</PanelTitle>
            <EntryList entries={membershipCommunityEntries(sensitive)} />
          </Section>
          <MembershipAlerts personId={person.id} boxed />
        </SideColumn>

        <Form onSubmit={submit}>
          <Sections>
            <Section aria-label="Comunidade">
              <PanelTitle>Comunidade</PanelTitle>
              <FieldGrid>
                <CommunityFields
                  control={community.control}
                  declines={communityDeclines(sensitive)}
                  smallGroups={smallGroups}
                  ministries={ministries}
                />
              </FieldGrid>
            </Section>

            <SectionDivider>
              <Section aria-label="Família">
                <PanelTitle>Família</PanelTitle>
                <FieldGrid>
                  <FamilyFields personId={person.id} family={family} control={familyForm.control} />
                </FieldGrid>
              </Section>
            </SectionDivider>

            <Actions>
              <Button type="submit" variant="primary" disabled={community.formState.isSubmitting}>
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
      {toast}
    </WideContent>
  );
}
