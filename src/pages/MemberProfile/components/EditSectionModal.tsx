// React
import { useState } from 'react';
import { useForm } from 'react-hook-form';
// Libs
import { Button, Checkbox, Form, ModalActions, ModalTitle, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Components
import { Section, SectionDivider } from '../../../components/FormLayout';
import { PanelTitle } from '../../../components/Panel';
// Local
import { MEMBER_FLAG_LABELS, MEMBER_FLAGS, MemberFlag } from '../../../domain/memberFlags';
import { MemberRecord } from '../../../domain/memberRecords';
import { RecordSection, RecordSectionFields, saveRecord, sectionResolver } from '../../../features/memberRecord';
import { invalidateQueries } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { sameItems } from '../../../lib/sameItems';
import { saveMemberFlags } from '../../../repositories/memberFlags';

interface Props {
  personId: string;
  record: MemberRecord;
  section: RecordSection;
  optionalPhone: boolean;
  flags?: MemberFlag[];
  close: () => void;
}

export function EditSectionModal({ personId, record, section, optionalPhone, flags, close }: Props) {
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<MemberRecord>({ resolver: sectionResolver(section, optionalPhone), defaultValues: record });
  const [checkedFlags, setCheckedFlags] = useState(flags ?? []);
  const flaggable = !!flags && watch('membershipStatus') === 'active';
  const nextFlags = flaggable ? checkedFlags : [];
  const flagsChanged = !!flags && !sameItems(nextFlags, flags);

  const toggleFlag = (flag: MemberFlag) =>
    setCheckedFlags((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));

  const submit = handleSubmit(async (values) => {
    try {
      if (isDirty) await saveRecord(personId, values);
      if (flags && flagsChanged) {
        await saveMemberFlags(personId, flags, nextFlags);
        await invalidateQueries(queryKeys.memberPage(personId));
      }
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  return (
    <>
      <ModalTitle onClose={close}>{section.title}</ModalTitle>
      <Form onSubmit={submit}>
        <RecordSectionFields section={section} control={control} />
        {flaggable && (
          <SectionDivider>
            <Section aria-label="Sinalizações">
              <PanelTitle>Sinalizações</PanelTitle>
              {MEMBER_FLAGS.map((flag) => (
                <Checkbox
                  key={flag}
                  checked={checkedFlags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                  label={MEMBER_FLAG_LABELS[flag]}
                />
              ))}
            </Section>
          </SectionDivider>
        )}
        <ModalActions>
          <Button type="submit" variant="primary" disabled={isSubmitting || (!isDirty && !flagsChanged)}>
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
