// React
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { MemberRecord } from '../../../domain/memberRecords';
import { RecordSection, RecordSectionFields, saveRecord, sectionResolver } from '../../../features/memberRecord';

interface Props {
  personId: string;
  record: MemberRecord;
  section: RecordSection;
  optionalPhone: boolean;
  close: () => void;
}

export function EditSectionModal({ personId, record, section, optionalPhone, close }: Props) {
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<MemberRecord>({ resolver: sectionResolver(section, optionalPhone), defaultValues: record });

  const submit = handleSubmit(async (values) => {
    try {
      await saveRecord(personId, values);
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
