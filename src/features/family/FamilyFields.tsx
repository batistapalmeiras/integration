// React
import { useEffect, useState } from 'react';
import { Control, Controller, useController, useForm } from 'react-hook-form';
// Libs
import { Button, IconButton, LinkButton, Select } from 'bp-kit';
import { Plus, Trash2 } from 'lucide-react';
// Components
import { WideField } from '../../components/FormLayout';
import { ItemRow, ItemRows, ItemStack } from '../../components/Panel';
// Local
import {
  availableRelations,
  FAMILY_RELATIONS,
  FamilyTraits,
  fitsRelation,
  isFamilyRelation,
  relationLabel,
  relationRank,
} from '../../domain/family';
import { byName } from '../../domain/text';
import { useFamilyTraits } from '../../queries/person';
import { useMemberNames } from '../../queries/reference';
import { Relative } from '../../repositories/family';
import { FamilyFormValues, FamilyLinkValue } from './form';
import { AddLink } from './styles';

interface ListProps {
  personId: string;
  traits: Record<string, FamilyTraits>;
  startOpen: boolean;
  onPickingChange?: (picking: boolean) => void;
  value: FamilyLinkValue[];
  onChange: (links: FamilyLinkValue[]) => void;
  candidates: { id: string; name: string }[];
  derived: Relative[];
  hidden: string[];
  onHiddenChange: (hidden: string[]) => void;
}

interface PickerValues {
  relation: string;
  relativeId: string;
}

const EMPTY_PICK: PickerValues = { relation: '', relativeId: '' };

function FamilyList({
  personId,
  traits,
  startOpen,
  onPickingChange,
  value,
  onChange,
  candidates,
  derived,
  hidden,
  onHiddenChange,
}: ListProps) {
  const [picking, setPicking] = useState(startOpen && value.length === 0);

  useEffect(() => {
    onPickingChange?.(picking);
  }, [picking, onPickingChange]);

  const picker = useForm<PickerValues>({ defaultValues: EMPTY_PICK });
  const picked = picker.watch();
  const names = new Map(candidates.map((candidate) => [candidate.id, candidate.name]));
  const available = candidates.filter(
    (candidate) =>
      !value.some((link) => link.relativeId === candidate.id) &&
      !derived.some((relative) => relative.id === candidate.id) &&
      (!isFamilyRelation(picked.relation) ||
        fitsRelation(picked.relation, personId, traits[personId], traits[candidate.id])),
  );

  const rows = [
    ...value.map((link) => ({
      relativeId: link.relativeId,
      relation: link.relation,
      name: names.get(link.relativeId) ?? '',
      gender: traits[link.relativeId]?.gender ?? null,
      derived: false,
    })),
    ...derived
      .filter((relative) => !hidden.includes(relative.id))
      .map((relative) => ({
        relativeId: relative.id,
        relation: relative.relation as string,
        name: relative.name,
        gender: relative.gender,
        derived: true,
      })),
  ].sort((a, b) => {
    const rankOf = (relation: string) =>
      isFamilyRelation(relation) ? relationRank(relation) : FAMILY_RELATIONS.length;
    return rankOf(a.relation) - rankOf(b.relation) || byName(a, b);
  });

  const add = picker.handleSubmit((values) => {
    onChange([...value, { relativeId: values.relativeId, relation: values.relation }]);
    picker.reset(EMPTY_PICK);
    setPicking(false);
  });

  const cancel = () => {
    picker.reset(EMPTY_PICK);
    setPicking(false);
  };

  return (
    <ItemStack>
      {rows.length > 0 && (
        <ItemRows>
          {rows.map((row) => (
            <ItemRow key={row.relativeId}>
              <span>
                {isFamilyRelation(row.relation) ? relationLabel(row.relation, row.gender) : row.relation}: {row.name}
              </span>
              <IconButton
                type="button"
                icon={<Trash2 size={14} />}
                iconPosition="center"
                variant="secondary"
                size="sm"
                aria-label={`Remover ${row.name}`}
                title="Remover"
                onClick={() =>
                  row.derived
                    ? onHiddenChange([...hidden, row.relativeId])
                    : onChange(value.filter((link) => link.relativeId !== row.relativeId))
                }
              />
            </ItemRow>
          ))}
        </ItemRows>
      )}

      {picking ? (
        <ItemStack>
          <Select label="Parentesco" control={picker.control} name="relation">
            <option value="">Selecione o parentesco</option>
            {availableRelations(value.map((link) => link.relation)).map((relation) => (
              <option key={relation} value={relation}>
                {relationLabel(relation)}
              </option>
            ))}
          </Select>
          <Select label="Membro" control={picker.control} name="relativeId" searchable>
            <option value="">Digite o nome…</option>
            {available.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="primary" disabled={!picked.relation || !picked.relativeId} onClick={add}>
            <Plus size={16} />
            Adicionar
          </Button>
          <LinkButton type="button" onClick={cancel}>
            Cancelar
          </LinkButton>
        </ItemStack>
      ) : (
        <AddLink>
          <LinkButton type="button" icon={<Plus size={14} />} onClick={() => setPicking(true)}>
            {rows.length > 0 ? 'Adicionar outro familiar' : 'Adicionar familiar'}
          </LinkButton>
        </AddLink>
      )}
    </ItemStack>
  );
}

interface Props {
  personId: string;
  startOpen?: boolean;
  onPickingChange?: (picking: boolean) => void;
  family: Relative[];
  control: Control<FamilyFormValues>;
}

export function FamilyFields({ personId, startOpen = false, onPickingChange, family, control }: Props) {
  const traits = useFamilyTraits().data ?? {};
  const { field: hiddenField } = useController({ control, name: 'hidden' });
  const members = (useMemberNames().data ?? []).filter((member) => member.id !== personId);
  const candidates = [...members, ...family.filter((relative) => !members.some((member) => member.id === relative.id))];

  return (
    <WideField>
      <Controller
        control={control}
        name="links"
        render={({ field }) => (
          <FamilyList
            personId={personId}
            traits={traits}
            startOpen={startOpen}
            onPickingChange={onPickingChange}
            value={field.value}
            onChange={field.onChange}
            candidates={candidates}
            derived={family.filter((relative) => relative.derived)}
            hidden={hiddenField.value}
            onHiddenChange={hiddenField.onChange}
          />
        )}
      />
    </WideField>
  );
}
