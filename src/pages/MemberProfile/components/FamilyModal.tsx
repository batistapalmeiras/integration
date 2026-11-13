// React
import { useForm } from 'react-hook-form';
// Libs
import { Button, Form, ModalActions, ModalTitle, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { FamilyFields, FamilyFormValues, familyFormValues, saveFamily } from '../../../features/family';
import { Relative } from '../../../repositories/family';

interface Props {
  personId: string;
  personName: string;
  family: Relative[];
  close: () => void;
}

export function FamilyModal({ personId, personName, family, close }: Props) {
  const { show: showToast, toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<FamilyFormValues>({ defaultValues: familyFormValues(family) });

  const submit = handleSubmit(async (values) => {
    try {
      await saveFamily(personId, values);
      close();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  return (
    <>
      <ModalTitle onClose={close}>Família</ModalTitle>
      <Form onSubmit={submit}>
        <FamilyFields personId={personId} personName={personName} family={family} control={control} />
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
