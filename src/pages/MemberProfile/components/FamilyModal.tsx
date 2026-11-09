// React
import { useForm, useWatch } from 'react-hook-form';
// Libs
import { Button, DatePicker, Form, ModalActions, ModalTitle, Select, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { isFutureDate } from '../../../domain/dates';
import { MemberRecord } from '../../../domain/memberRecords';
import { saveRecord, WEDDING_DATE_FIELD } from '../../../features/memberRecord';
import { invalidateQueries } from '../../../lib/queryCache';
import { useMemberNames } from '../../../queries/reference';
import { Family, setFamily } from '../../../repositories/family';
import { ChildrenField } from './ChildrenField';

interface FamilyFormValues {
  weddingDate: string;
  spouseId: string;
  fatherId: string;
  motherId: string;
  childIds: string[];
}

interface Props {
  personId: string;
  record: MemberRecord;
  family: Family;
  close: () => void;
}

const orNull = (id: string) => id || null;

export function FamilyModal({ personId, record, family, close }: Props) {
  const { show: showToast, toast } = useToast();
  const members = (useMemberNames().data ?? []).filter((member) => member.id !== personId);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<FamilyFormValues>({
    defaultValues: {
      weddingDate: record.weddingDate,
      spouseId: family.spouse?.id ?? '',
      fatherId: family.father?.id ?? '',
      motherId: family.mother?.id ?? '',
      childIds: family.children.map((child) => child.id),
    },
  });
  const childIds = useWatch({ control, name: 'childIds' });
  const knownNames = new Map([...family.children, ...members].map((person) => [person.id, person.name]));

  const submit = handleSubmit(async (values) => {
    try {
      await setFamily(personId, {
        spouseId: orNull(values.spouseId),
        fatherId: orNull(values.fatherId),
        motherId: orNull(values.motherId),
        childIds: values.childIds,
      });
      if (values.weddingDate !== record.weddingDate) {
        await saveRecord(personId, { ...record, weddingDate: values.weddingDate });
      }
      await invalidateQueries((key) => key[0] === 'person' && key[2] === 'family');
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  const memberOptions = (
    <>
      <option value="">Nenhum</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </>
  );

  return (
    <>
      <ModalTitle onClose={close}>Família</ModalTitle>
      <Form onSubmit={submit}>
        <Select label="Cônjuge" control={control} name="spouseId" searchable>
          {memberOptions}
        </Select>
        <DatePicker
          label={WEDDING_DATE_FIELD.label}
          control={control}
          name="weddingDate"
          isDateDisabled={isFutureDate}
        />
        <Select label="Pai" control={control} name="fatherId" searchable>
          {memberOptions}
        </Select>
        <Select label="Mãe" control={control} name="motherId" searchable>
          {memberOptions}
        </Select>
        <ChildrenField
          value={childIds}
          onChange={(ids) => setValue('childIds', ids, { shouldDirty: true })}
          candidates={members}
          knownNames={knownNames}
        />
        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
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
      {toast}
    </>
  );
}
