// React
import { useEffect, useState } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
// Libs
import { Button, IconButton, LinkButton, Select, Typography } from 'bp-kit';
import { Plus, Trash2 } from 'lucide-react';
// Components
import { WideField } from '../../components/FormLayout';
import { ItemStack } from '../../components/Panel';
// Local
import { FAMILY_RELATIONS, isFamilyRelation, relationLabel, relationRank } from '../../domain/family';
import { byName } from '../../domain/text';
import { useMemberNames } from '../../queries/reference';
import { Relative } from '../../repositories/family';
import { FamilyFormValues, FamilyLinkValue } from './form';
import { AddLink, FamilyRow, FamilyRows } from './styles';

interface ListProps {
  personName: string;
  startOpen: boolean;
  onPickingChange?: (picking: boolean) => void;
  value: FamilyLinkValue[];
  onChange: (links: FamilyLinkValue[]) => void;
  candidates: { id: string; name: string }[];
}

interface PickerValues {
  relation: string;
  relativeId: string;
}

const EMPTY_PICK: PickerValues = { relation: '', relativeId: '' };

function FamilyList({ personName, startOpen, onPickingChange, value, onChange, candidates }: ListProps) {
  const [picking, setPicking] = useState(startOpen && value.length === 0);

  useEffect(() => {
    onPickingChange?.(picking);
  }, [picking, onPickingChange]);

  const picker = useForm<PickerValues>({ defaultValues: EMPTY_PICK });
  const picked = picker.watch();
  const names = new Map(candidates.map((candidate) => [candidate.id, candidate.name]));
  const pickedName = names.get(picked.relativeId);
  const available = candidates.filter((candidate) => !value.some((link) => link.relativeId === candidate.id));

  const rows = value
    .map((link) => ({ ...link, name: names.get(link.relativeId) ?? '' }))
    .sort((a, b) => {
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
          <FamilyRows>
            {rows.map((row) => (
              <FamilyRow key={row.relativeId}>
                <span>
                  {isFamilyRelation(row.relation) ? relationLabel(row.relation) : row.relation}: {row.name}
                </span>
                <IconButton
                  type="button"
                  icon={<Trash2 size={14} />}
                  iconPosition="center"
                  variant="secondary"
                  size="sm"
                  aria-label={`Remover ${row.name}`}
                  title="Remover"
                  onClick={() => onChange(value.filter((link) => link.relativeId !== row.relativeId))}
                />
              </FamilyRow>
            ))}
          </FamilyRows>
        )}

        {picking ? (
          <ItemStack>
            <Select label="Parentesco" control={picker.control} name="relation">
              <option value="">Selecione o parentesco</option>
              {FAMILY_RELATIONS.map((relation) => (
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
            {pickedName && isFamilyRelation(picked.relation) && (
            <Typography type="caption">
              {pickedName} é {relationLabel(picked.relation).toLowerCase()} de {personName}.
            </Typography>
          )}
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
  personName: string;
  startOpen?: boolean;
  onPickingChange?: (picking: boolean) => void;
  family: Relative[];
  control: Control<FamilyFormValues>;
}

export function FamilyFields({ personId, personName, startOpen = false, onPickingChange, family, control }: Props) {
  const members = (useMemberNames().data ?? []).filter((member) => member.id !== personId);
  const candidates = [...members, ...family.filter((relative) => !members.some((member) => member.id === relative.id))];

  return (
    <WideField>
      <Controller
        control={control}
        name="links"
        render={({ field }) => (
          <FamilyList
            personName={personName}
            startOpen={startOpen}
            onPickingChange={onPickingChange}
            value={field.value}
            onChange={field.onChange}
            candidates={candidates}
          />
        )}
      />
    </WideField>
  );
}
