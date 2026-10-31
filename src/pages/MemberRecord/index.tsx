// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Select, Skeleton, text, TextInput, Typography, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Local
import { MembershipAlerts } from '../../components/MembershipAlerts';
import {
  GENDER_LABELS,
  getMemberRecord,
  MARITAL_STATUS_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  MemberRecord,
  saveMemberRecord,
} from '../../domain/memberRecords';
import { PHONE_PLACEHOLDER } from '../../domain/text';
import { Actions, Content, Form, SectionDivider } from '../Visitors/Detail/styles';
import { memberRecordSchema } from './schema';

export function MemberRecordPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();
  const [record, setRecord] = useState<MemberRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getMemberRecord(id)
      .then(setRecord)
      .catch((e) => setLoadError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<MemberRecord>({ resolver: zodResolver(memberRecordSchema), values: record ?? undefined });

  if (loadError) return <Empty title="Membro não encontrado" description={loadError} />;
  if (!record) return <Skeleton $h="320px" />;

  const submit = handleSubmit(async (values) => {
    try {
      await saveMemberRecord(id, values);
      navigate(-1);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  });

  return (
    <Content>
      <PageHeader title="Ficha do membro" subtitle={record.name} back />
      <MembershipAlerts personId={id} />

      <Form onSubmit={submit}>
        <Select label="Situação" control={control} name="membershipStatus">
          {Object.entries(MEMBERSHIP_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <SectionDivider>
          <Typography type="h6">Contato</Typography>
        </SectionDivider>
        <TextInput label="Celular" control={control} name="phone" mask="phone" placeholder={PHONE_PLACEHOLDER} />
        <TextInput label={text.fields.email} control={control} name="email" type="email" placeholder={text.fields.emailPlaceholder} />
        <TextInput label="Telefone fixo" control={control} name="landline" inputMode="tel" />
        <TextInput label="Outro telefone" control={control} name="otherPhone" inputMode="tel" />

        <SectionDivider>
          <Typography type="h6">Dados pessoais</Typography>
        </SectionDivider>
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
        <TextInput label="Apelido" control={control} name="nickname" />
        <TextInput label="Nascimento" control={control} name="birthDate" type="date" />
        <Select label="Sexo" control={control} name="gender">
          <option value="">Não informado</option>
          {Object.entries(GENDER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select label="Estado civil" control={control} name="maritalStatus">
          <option value="">Não informado</option>
          {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <TextInput label="Nacionalidade" control={control} name="nationality" />

        <SectionDivider>
          <Typography type="h6">Endereço</Typography>
        </SectionDivider>
        <TextInput label="CEP" control={control} name="addressZip" inputMode="numeric" />
        <TextInput label="Rua" control={control} name="addressStreet" />
        <TextInput label="Número" control={control} name="addressNumber" />
        <TextInput label="Complemento" control={control} name="addressComplement" />
        <TextInput label="Bairro" control={control} name="addressNeighborhood" />
        <TextInput label="Cidade" control={control} name="addressCity" />
        <TextInput label="Estado" control={control} name="addressState" placeholder="MG" maxLength={2} />
        <TextInput label="Ponto de referência" control={control} name="addressReference" />

        <SectionDivider>
          <Typography type="h6">Documentos</Typography>
        </SectionDivider>
        <TextInput label="CPF" control={control} name="cpf" inputMode="numeric" placeholder="000.000.000-00" />
        <TextInput label="RG" control={control} name="rg" />

        <Actions>
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
        </Actions>
      </Form>
      {toast}
    </Content>
  );
}
