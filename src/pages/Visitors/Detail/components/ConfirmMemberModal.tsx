// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Select, Skeleton } from 'bp-kit';
import { Check } from 'lucide-react';
// Local
import { CommunityGroup, listMinistries, listSmallGroups } from '../../../../domain/communityGroups';
import { CommunityRequirements, communityRequirements } from '../../../../domain/membershipCommunity';
import { getPersonSensitive } from '../../../../domain/personSensitive';
import { Person } from '../../../../features/visitors';
import { Hint } from '../styles';
import { CommunityFormValues, buildCommunitySchema } from '../../validators';

interface Props {
  person: Pick<Person, 'id' | 'name'>;
  close: () => void;
  onConfirm: (smallGroupId: string | null, ministryId: string | null) => Promise<void>;
}

export function ConfirmMemberModal({ person, close, onConfirm }: Props) {
  const [smallGroups, setSmallGroups] = useState<CommunityGroup[]>([]);
  const [ministries, setMinistries] = useState<CommunityGroup[]>([]);
  const [requirements, setRequirements] = useState<CommunityRequirements | null>(null);

  useEffect(() => {
    listSmallGroups().then(setSmallGroups);
    listMinistries().then(setMinistries);
    getPersonSensitive(person.id).then((answers) => setRequirements(communityRequirements(answers)));
  }, [person.id]);

  return (
    <>
      <ModalTitle onClose={close}>Confirmar {person.name} como membro</ModalTitle>
      {requirements ? (
        <ConfirmMemberForm
          requirements={requirements}
          smallGroups={smallGroups}
          ministries={ministries}
          close={close}
          onConfirm={onConfirm}
        />
      ) : (
        <Skeleton $h="160px" />
      )}
    </>
  );
}

interface FormProps extends Pick<Props, 'close' | 'onConfirm'> {
  requirements: CommunityRequirements;
  smallGroups: CommunityGroup[];
  ministries: CommunityGroup[];
}

function ConfirmMemberForm({ requirements, smallGroups, ministries, close, onConfirm }: FormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(buildCommunitySchema(requirements)),
    defaultValues: { smallGroupId: '', ministryId: '' },
  });

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.smallGroupId || null, values.ministryId || null);
    close();
  });

  return (
    <Form onSubmit={submit}>
      <Select
        label={requirements.smallGroupRequired ? 'Pequeno Grupo' : 'Pequeno Grupo (opcional)'}
        control={control}
        name="smallGroupId"
      >
        <option value="">{requirements.smallGroupRequired ? 'Selecione…' : 'Nenhum por enquanto'}</option>
        {smallGroups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </Select>
      {!requirements.smallGroupRequired && (
        <Hint>Na ficha, a pessoa disse que não quer participar de um PG neste momento.</Hint>
      )}

      <Select
        label={requirements.ministryRequired ? 'Ministério' : 'Ministério (opcional)'}
        control={control}
        name="ministryId"
      >
        <option value="">{requirements.ministryRequired ? 'Selecione…' : 'Nenhum por enquanto'}</option>
        {ministries.map((ministry) => (
          <option key={ministry.id} value={ministry.id}>
            {ministry.name}
          </option>
        ))}
      </Select>
      {!requirements.ministryRequired && (
        <Hint>Na ficha, a pessoa disse que não pode servir em um ministério agora.</Hint>
      )}

      <ModalActions>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            'Salvando...'
          ) : (
            <>
              <Check size={16} />
              Confirmar
            </>
          )}
        </Button>
      </ModalActions>
    </Form>
  );
}
