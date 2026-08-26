// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, Select, text } from 'bp-kit';
import { z } from 'zod';
// Local
import { CommunityGroup, listMinistries, listSmallGroups } from '../../../../domain/communityGroups';
import { Person } from '../../types';

const schema = z.object({
  smallGroupId: z.string().min(1, text.validation.selectRequired('o Pequeno Grupo')),
  ministryId: z.string().min(1, text.validation.selectRequired('o ministério')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  person: Pick<Person, 'id' | 'name'>;
  close: () => void;
  onConfirm: (smallGroupId: string, ministryId: string) => Promise<void>;
}

export function ConfirmMemberModal({ person, close, onConfirm }: Props) {
  const [smallGroups, setSmallGroups] = useState<CommunityGroup[]>([]);
  const [ministries, setMinistries] = useState<CommunityGroup[]>([]);

  useEffect(() => {
    listSmallGroups().then(setSmallGroups);
    listMinistries().then(setMinistries);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { smallGroupId: '', ministryId: '' } });

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.smallGroupId, values.ministryId);
    close();
  });

  return (
    <>
      <ModalTitle>Confirmar {person.name} como membro</ModalTitle>
      <Form onSubmit={submit}>
        <Select label="Pequeno Grupo" control={control} name="smallGroupId">
          <option value="">Selecione…</option>
          {smallGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <Select label="Ministério" control={control} name="ministryId">
          <option value="">Selecione…</option>
          {ministries.map((ministry) => (
            <option key={ministry.id} value={ministry.id}>
              {ministry.name}
            </option>
          ))}
        </Select>

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            {text.actions.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
