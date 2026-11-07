// React
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, Select, Skeleton, text, Textarea, TextInput, Typography, useToast } from 'bp-kit';
import { Save } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { List, ListItem } from '../../components/List';
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { formatTimestampDate } from '../../domain/dates';
import {
  GENDER_LABELS,
  getMemberRecord,
  MARITAL_STATUS_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  MemberRecord,
  saveMemberRecord,
} from '../../domain/memberRecords';
import { listPastoralNotes, PastoralNote } from '../../domain/pastoralNotes';
import { PHONE_PLACEHOLDER, YES_NO_OPTIONS } from '../../domain/text';
import { Actions, Content, Form, SectionDivider } from '../Visitors/Detail/styles';
import { memberRecordSchema } from './schema';

export function MemberRecordPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show: showToast, toast } = useToast();
  const [record, setRecord] = useState<MemberRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pastoralNotes, setPastoralNotes] = useState<PastoralNote[]>([]);

  useEffect(() => {
    getMemberRecord(id)
      .then(setRecord)
      .catch((e) => setLoadError(e instanceof Error ? e.message : String(e)));
    listPastoralNotes(id)
      .then(setPastoralNotes)
      .catch(() => setPastoralNotes([]));
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
        <TextInput
          label="Outro telefone para contato"
          control={control}
          name="otherPhone"
          mask="phone"
          inputMode="numeric"
          placeholder={PHONE_PLACEHOLDER}
        />
        <TextInput label="Forma de contato preferida" control={control} name="preferredContact" />
        <Select label="Lê e-mails da igreja?" control={control} name="readsEmail">
          <option value="">Não informado</option>
          {YES_NO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select label="Aceita visitas?" control={control} name="acceptsVisits">
          <option value="">Não informado</option>
          {YES_NO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <SectionDivider>
          <Typography type="h6">Dados pessoais</Typography>
        </SectionDivider>
        <TextInput label={text.fields.name} control={control} name="name" placeholder={text.fields.fullName} />
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
        <TextInput label="Naturalidade" control={control} name="birthplace" />
        <TextInput label="Estado de nascimento" control={control} name="birthState" placeholder="MG" maxLength={2} />
        <TextInput label="Escolaridade" control={control} name="education" />
        <TextInput label="Profissão" control={control} name="profession" />
        <TextInput label="Local de trabalho" control={control} name="workplace" />

        <SectionDivider>
          <Typography type="h6">Família</Typography>
        </SectionDivider>
        <TextInput label="Nome do pai" control={control} name="fatherName" />
        <TextInput label="Nome da mãe" control={control} name="motherName" />
        <TextInput label="Cônjuge" control={control} name="spouseName" />
        <TextInput label="Data de casamento" control={control} name="weddingDate" type="date" />
        <TextInput label="Quantidade de filhos" control={control} name="childrenCount" inputMode="numeric" />
        <Textarea label="Nomes dos filhos" control={control} name="childrenNames" rows={2} />

        <SectionDivider>
          <Typography type="h6">Vida na igreja</Typography>
        </SectionDivider>
        <TextInput label="Data de batismo" control={control} name="baptismDate" type="date" />
        <TextInput label="Igreja do batismo" control={control} name="baptismChurch" />
        <Textarea label="Experiência em ministérios" control={control} name="ministryBackground" rows={3} />
        <TextInput label="Situação no sistema antigo" control={control} name="legacyStatus" disabled />

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

        <SectionDivider>
          <Typography type="h6">Observações</Typography>
        </SectionDivider>
        <Textarea label="Observações" control={control} name="publicNotes" rows={4} />

        {pastoralNotes.length > 0 && (
          <>
            <SectionDivider>
              <Typography type="h6">Anotações dos líderes</Typography>
            </SectionDivider>
            <List>
              {pastoralNotes.map((note) => (
                <ListItem key={note.id}>
                  <Typography type="p">{note.body}</Typography>
                  <Typography type="caption">Importada do sistema antigo em {formatTimestampDate(note.createdAt)}</Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

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
