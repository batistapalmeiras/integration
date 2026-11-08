// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, MultiSelect, text, TextInput, Typography } from 'bp-kit';
import { Save, Trash2 } from 'lucide-react';
import { z } from 'zod';
// Local
import { SelectField } from '../../../components/SelectField';
import { CommunityGroup, GroupInput, WEEK_DAY_LABELS, WeekDay } from '../../../domain/communityGroups';
import { toOptions } from '../../../domain/text';
import { DangerZone } from '../styles';

const WEEK_DAY_OPTIONS = toOptions(WEEK_DAY_LABELS);

interface FormValues {
  name: string;
  meetingDay: WeekDay | '';
}

const schemaFor = (smallGroup: boolean) =>
  z.object({
    name: z.string().min(1, text.validation.required('o nome')),
    meetingDay: z.string().refine((value) => !smallGroup || value in WEEK_DAY_LABELS, 'Selecione o dia do PG'),
  });

interface Props {
  title: string;
  fieldLabel: string;
  group?: CommunityGroup;
  smallGroup?: boolean;
  groupMembers?: string[];
  onDelete?: () => void;
  close: () => void;
  onSave: (input: GroupInput) => Promise<void>;
}

export function GroupModal({
  title,
  fieldLabel,
  group,
  smallGroup = false,
  groupMembers,
  onDelete,
  close,
  onSave,
}: Props) {
  const members = groupMembers ?? [];
  const inGroup = (names: string[] = []) => names.filter((name) => members.includes(name));
  const [leaders, setLeaders] = useState<string[]>(inGroup(group?.leaders));
  const [hosts, setHosts] = useState<string[]>(inGroup(group?.hosts));
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schemaFor(smallGroup)) as Resolver<FormValues>,
    defaultValues: { name: group?.name ?? '', meetingDay: group?.meetingDay ?? '' },
  });

  const options = [...members]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => ({ value: name, label: name }));
  const canPickPeople = options.length > 0;

  const submit = handleSubmit(async (values) => {
    await onSave({
      name: values.name.trim(),
      leaders,
      hosts,
      meetingDay: values.meetingDay === '' ? null : values.meetingDay,
    });
    close();
  });

  return (
    <>
      <ModalTitle onClose={close}>{title}</ModalTitle>
      <Form onSubmit={submit}>
        <TextInput label={`Nome do ${fieldLabel}`} control={control} name="name" placeholder={fieldLabel} />

        {smallGroup && <SelectField control={control} name="meetingDay" label="Dia do PG" options={WEEK_DAY_OPTIONS} />}

        {canPickPeople && (
          <MultiSelect
            label="Líder(es)"
            options={options}
            value={leaders}
            onChange={setLeaders}
            placeholder="Buscar pessoa da lista…"
          />
        )}

        {smallGroup && canPickPeople && (
          <MultiSelect
            label="Anfitrião(ões)"
            options={options}
            value={hosts}
            onChange={setHosts}
            placeholder="Buscar pessoa da lista…"
          />
        )}

        {!canPickPeople && smallGroup && (
          <Typography type="caption">
            Líderes e anfitriões precisam fazer parte do PG. Adicione as pessoas ao PG e depois escolha quem lidera e
            quem recebe.
          </Typography>
        )}

        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                Salvar
              </>
            )}
          </Button>
        </ModalActions>
      </Form>

      {group && (
        <DangerZone>
          <Button type="button" variant="danger" fullWidth onClick={onDelete} disabled={!onDelete}>
            <Trash2 size={16} />
            Excluir {fieldLabel}
          </Button>
        </DangerZone>
      )}
    </>
  );
}
