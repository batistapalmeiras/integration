// React
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, TextInput, Typography, text } from 'bp-kit';
import { X } from 'lucide-react';
import { z } from 'zod';
// Local
import { FieldGroup, LeaderList, LeaderRow, RemoveTagButton } from '../styles';
import { PersonSuggestInput } from './PersonSuggestInput';

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
  peopleOptions?: string[];
  close: () => void;
  onSave: (name: string, leaders: string[], hosts: string[]) => Promise<void>;
}

function NameList({ names, onRemove }: { names: string[]; onRemove: (name: string) => void }) {
  if (names.length === 0) return <Typography type="caption">Ninguém cadastrado.</Typography>;
  return (
    <LeaderList>
      {names.map((name) => (
        <LeaderRow key={name}>
          <Typography type="caption">{name}</Typography>
          <RemoveTagButton type="button" onClick={() => onRemove(name)} title="Remover">
            <X size={14} />
          </RemoveTagButton>
        </LeaderRow>
      ))}
    </LeaderList>
  );
}

export function GroupModal({
  title,
  fieldLabel,
  initialName,
  initialLeaders,
  initialHosts,
  hasHosts,
  peopleOptions,
  close,
  onSave,
}: Props) {
  const [leaders, setLeaders] = useState<string[]>(initialLeaders ?? []);
  const [hosts, setHosts] = useState<string[]>(initialHosts ?? []);
  const [leaderDraft, setLeaderDraft] = useState('');
  const [hostDraft, setHostDraft] = useState('');
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName ?? '' },
  });

  const leaderSuggestions = (peopleOptions ?? []).filter((name) => !leaders.includes(name));
  const hostSuggestions = (peopleOptions ?? []).filter((name) => !hosts.includes(name));

  const addLeader = (draft?: string) => {
    const value = (draft ?? leaderDraft).trim();
    if (!value || leaders.includes(value)) return;
    setLeaders([...leaders, value]);
    setLeaderDraft('');
  };

  const addHost = (draft?: string) => {
    const value = (draft ?? hostDraft).trim();
    if (!value || hosts.includes(value)) return;
    setHosts([...hosts, value]);
    setHostDraft('');
  };

  const submit = handleSubmit(async (values) => {
    await onSave(values.name.trim(), leaders, hosts);
    close();
  });

  return (
    <>
      <ModalTitle>{title}</ModalTitle>
      <Form onSubmit={submit}>
        <TextInput label={fieldLabel} control={control} name="name" placeholder={fieldLabel} />

        <FieldGroup>
          <Typography type="label">Líder(es)</Typography>
          <NameList names={leaders} onRemove={(name) => setLeaders(leaders.filter((l) => l !== name))} />
          <PersonSuggestInput
            label="Novo líder"
            value={leaderDraft}
            onChange={setLeaderDraft}
            onSelect={(name) => addLeader(name)}
            options={leaderSuggestions}
            placeholder="Nome"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLeader();
              }
            }}
          />
        </FieldGroup>

        {hasHosts && (
          <FieldGroup>
            <Typography type="label">Anfitrião(ões)</Typography>
            <NameList names={hosts} onRemove={(name) => setHosts(hosts.filter((h) => h !== name))} />
            <PersonSuggestInput
              label="Novo anfitrião"
              value={hostDraft}
              onChange={setHostDraft}
              onSelect={(name) => addHost(name)}
              options={hostSuggestions}
              placeholder="Nome"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHost();
                }
              }}
            />
          </FieldGroup>
        )}

        <ModalActions>
          <Button type="button" variant="secondary" onClick={close}>
            {text.actions.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </ModalActions>
      </Form>
    </>
  );
}
