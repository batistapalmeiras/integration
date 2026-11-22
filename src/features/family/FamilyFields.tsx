// React
import { useEffect, useRef, useState } from 'react';
import { Control, Controller, useController, useForm } from 'react-hook-form';
// Libs
import { IconButton, LinkButton, Select } from 'bp-kit';
import { Plus, Trash2 } from 'lucide-react';
// Components
import { WideField } from '../../components/FormLayout';
import { MemberPhoto } from '../../components/MemberPhoto';
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
import { useRelativePhotoUrls } from '../../queries/memberPhotos';
import { useFamilyTraits } from '../../queries/person';
import { useMemberNames } from '../../queries/reference';
import { Relative, suggestFamily } from '../../repositories/family';
import { FamilyFormValues, FamilyLinkValue } from './form';
import { AddLink, RowPerson, SuggestingHint } from './styles';

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
  suggest: (links: FamilyLinkValue[]) => Promise<Relative[]>;
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
  suggest,
}: ListProps) {
  const [picking, setPicking] = useState(startOpen && value.length === 0);
  const [preview, setPreview] = useState<Relative[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [known, setKnown] = useState<Map<string, string>>(new Map());
  const dismissed = useRef(new Set<string>());
  const derivedRows = preview ?? derived;

  useEffect(() => {
    onPickingChange?.(picking);
  }, [picking, onPickingChange]);

  const picker = useForm<PickerValues>({ defaultValues: EMPTY_PICK });
  const picked = picker.watch();
  const names = new Map(candidates.map((candidate) => [candidate.id, candidate.name]));
  const available = candidates.filter(
    (candidate) =>
      !value.some((link) => link.relativeId === candidate.id) &&
      !derivedRows.some((relative) => relative.id === candidate.id) &&
      (!isFamilyRelation(picked.relation) ||
        fitsRelation(picked.relation, personId, traits[personId], traits[candidate.id])),
  );

  const rows = [
    ...value.map((link) => ({
      relativeId: link.relativeId,
      relation: link.relation,
      name: names.get(link.relativeId) ?? known.get(link.relativeId) ?? '',
      gender: traits[link.relativeId]?.gender ?? null,
      derived: false,
    })),
    ...derivedRows
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

  const include = async (base: FamilyLinkValue[]) => {
    setSuggesting(true);
    try {
      const family = await suggest(base);
      onChange(
        family
          .filter((relative) => !relative.derived && !dismissed.current.has(relative.id))
          .map((relative) => ({ relativeId: relative.id, relation: relative.relation })),
      );
      setPreview(family.filter((relative) => relative.derived));
      setKnown(new Map(family.map((relative) => [relative.id, relative.name])));
    } catch {
      onChange(base);
    } finally {
      setSuggesting(false);
    }
  };

  useEffect(() => {
    const subscription = picker.watch((values) => {
      if (!values.relation || !values.relativeId) return;
      dismissed.current.delete(values.relativeId);
      void include([...value, { relativeId: values.relativeId, relation: values.relation }]);
      picker.reset(EMPTY_PICK);
      setPicking(false);
    });
    return () => subscription.unsubscribe();
  });

  const removeStored = (relativeId: string) => {
    dismissed.current.add(relativeId);
    onChange(value.filter((link) => link.relativeId !== relativeId));
  };

  const photos = useRelativePhotoUrls(rows.map((row) => row.relativeId));

  return (
    <ItemStack>
      {rows.length > 0 && (
        <ItemRows>
          {rows.map((row) => (
            <ItemRow key={row.relativeId}>
              <RowPerson>
                <MemberPhoto url={photos[row.relativeId] ?? null} size={56} />
                <span>
                  {isFamilyRelation(row.relation) ? relationLabel(row.relation, row.gender) : row.relation}: {row.name}
                </span>
              </RowPerson>
              <IconButton
                type="button"
                icon={<Trash2 size={14} />}
                iconPosition="center"
                variant="secondary"
                size="sm"
                aria-label={`Remover ${row.name}`}
                title="Remover"
                onClick={() =>
                  row.derived ? onHiddenChange([...hidden, row.relativeId]) : removeStored(row.relativeId)
                }
              />
            </ItemRow>
          ))}
        </ItemRows>
      )}

      {suggesting && <SuggestingHint>Buscando os familiares…</SuggestingHint>}

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
            <option value="">Buscar pelo membro…</option>
            {available.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Select>
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
  const suggest = (links: FamilyLinkValue[]) =>
    suggestFamily(
      personId,
      links.flatMap((link) =>
        isFamilyRelation(link.relation) ? [{ relativeId: link.relativeId, relation: link.relation }] : [],
      ),
    );
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
            suggest={suggest}
          />
        )}
      />
    </WideField>
  );
}
