// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, MultiSelect, TextInput, text } from 'bp-kit';
import { Save } from 'lucide-react';
import { z } from 'zod';
// Local
import { listMembers } from '../../../domain/communityGroups';

const schema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  title: string;
  fieldLabel: string;
  initialName?: string;
  initialLeaders?: string[];
  initialHosts?: string[];
  hasHosts?: boolean;
  close: () => void;
  onSave: (name: string, leaders: string[], hosts: string[]) => Promise<void>;
}

export function GroupModal({
  title,
  fieldLabel,
  initialName,
  initialLeaders,
  initialHosts,
  hasHosts,
  close,
  onSave,
}: Props) {
  const [leaders, setLeaders] = useState<string[]>(initialLeaders ?? []);
  const [hosts, setHosts] = useState<string[]>(initialHosts ?? []);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName ?? '' },
  });

  useEffect(() => {
    listMembers().then((members) => setMemberNames(members.map((member) => member.name)));
  }, []);

  const options = [...new Set([...memberNames, ...(initialLeaders ?? []), ...(initialHosts ?? [])])]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => ({ value: name, label: name }));

  const submit = handleSubmit(async (values) => {
    await onSave(values.name.trim(), leaders, hosts);
    close();
  });

  return (
    <>
      <ModalTitle onClose={close}>{title}</ModalTitle>
      <Form onSubmit={submit}>
        <TextInput label={fieldLabel} control={control} name="name" placeholder={fieldLabel} />

        <MultiSelect
          label="Líder(es)"
          options={options}
          value={leaders}
          onChange={setLeaders}
          placeholder="Buscar membro…"
        />

        {hasHosts && (
          <MultiSelect
            label="Anfitrião(ões)"
            options={options}
            value={hosts}
            onChange={setHosts}
            placeholder="Buscar membro…"
          />
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
    </>
  );
}
