// React
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
// Libs
import { BaseInput, Button, IconButton, LinkButton, Select } from 'bp-kit';
import { Plus, Trash2 } from 'lucide-react';
// Local
import { Relative } from '../../repositories/family';
import { ItemPicker, ItemRow, ItemRows } from '../../components/Panel';

interface Props {
  value: string[];
  onChange: (childIds: string[]) => void;
  candidates: Relative[];
  knownNames: Map<string, string>;
}

export function ChildrenField({ value, onChange, candidates, knownNames }: Props) {
  const [picking, setPicking] = useState(false);
  const picker = useForm<{ childId: string }>({ defaultValues: { childId: '' } });
  const available = candidates.filter((candidate) => !value.includes(candidate.id));

  useEffect(() => {
    const subscription = picker.watch(({ childId }) => {
      if (!childId) return;
      onChange([...value, childId]);
      picker.reset({ childId: '' });
      setPicking(false);
    });
    return () => subscription.unsubscribe();
  }, [picker, value, onChange]);

  return (
    <BaseInput label="Filhos">
      {value.length > 0 && (
        <ItemRows>
          {value.map((id) => {
            const name = knownNames.get(id) ?? '';
            return (
              <ItemRow key={id}>
                <span>{name}</span>
                <IconButton
                  type="button"
                  icon={<Trash2 size={14} />}
                  iconPosition="center"
                  variant="secondary"
                  size="sm"
                  aria-label={`Remover ${name}`}
                  title="Remover"
                  onClick={() => onChange(value.filter((childId) => childId !== id))}
                />
              </ItemRow>
            );
          })}
        </ItemRows>
      )}

      {picking ? (
        <ItemPicker>
          <Select label="Buscar membro" control={picker.control} name="childId" searchable>
            <option value="">Digite o nome…</option>
            {available.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Select>
          <LinkButton type="button" onClick={() => setPicking(false)}>
            Cancelar
          </LinkButton>
        </ItemPicker>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setPicking(true)}>
          <Plus size={16} />
          {value.length > 0 ? 'Adicionar outro filho' : 'Adicionar filho'}
        </Button>
      )}
    </BaseInput>
  );
}
