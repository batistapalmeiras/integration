// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Local
import { GENDER_LABELS, MARITAL_STATUS_OPTION_LABELS } from '../../../domain/memberRecords';
import { YES_NO_LABELS } from '../../../domain/text';
import { ENTRY_TYPE_LABELS, WANTS_SMALL_GROUP_LABELS } from '../../../types/church';
import { SmallGroupOption, smallGroupLabel } from '../hooks/usePublicGroups';
import { LAST_CHURCH_PROMPTS, STEP_TITLES } from '../options';
import { MembershipFormValues } from '../schema';
import { ReviewHeader, ReviewItem, ReviewList, ReviewSection, ReviewTitle } from '../styles';

interface Props {
  values: MembershipFormValues;
  smallGroups: SmallGroupOption[] | null;
  onEdit: (step: number) => void;
}

type Row = [label: string, value: string];

function label<K extends string>(labels: Record<K, string>, value: K | ''): string {
  return value ? labels[value] : '';
}

function reviewRows(values: MembershipFormValues, smallGroups: SmallGroupOption[] | null): Row[][] {
  const smallGroup = smallGroups?.find((group) => group.id === values.smallGroupId);
  const filled = (parts: string[], separator: string) => parts.map((part) => part.trim()).filter(Boolean).join(separator);
  const address = filled(
    [
      filled([filled([values.street, values.number], ', '), values.complement], ' — '),
      values.neighborhood,
      filled([values.city, values.state.toUpperCase()], '/'),
      values.zip,
    ],
    ' · ',
  );

  return [
    [
      ['Nome completo', values.name],
      ['Sexo', label(GENDER_LABELS, values.gender)],
      ['CPF', values.cpf],
      ['Data de nascimento', values.birthDate],
      ['Estado civil', label(MARITAL_STATUS_OPTION_LABELS, values.maritalStatus)],
      ['Nome da mãe', values.motherName],
      ['Nome do pai', values.fatherName],
    ],
    [
      ['E-mail', values.email],
      ['Outro telefone', values.otherPhone],
      ['Endereço', address],
    ],
    [
      ['Forma de entrada', label(ENTRY_TYPE_LABELS, values.entryType)],
      ...(values.entryType !== 'baptism'
        ? ([
            ['Igreja de batismo', values.baptismChurch],
            ['Data do batismo', values.baptismDate],
          ] as Row[])
        : []),
      [values.entryType ? LAST_CHURCH_PROMPTS[values.entryType].review : 'Igreja anterior', values.lastChurch],
    ],
    [['Estatuto', values.statuteAgreed ? 'Declarou estar de acordo' : '']],
    [
      [
        'Ministérios',
        values.noMinistryInterest ? 'Não pode ou não deseja servir agora' : values.ministryInterests.join(', '),
      ],
      [
        'Pequeno Grupo',
        values.wantsSmallGroup === 'already' && smallGroup
          ? `Já faço — ${smallGroupLabel(smallGroup)}`
          : label(WANTS_SMALL_GROUP_LABELS, values.wantsSmallGroup),
      ],
      [
        'Sociedade secreta',
        values.secretSociety === 'yes'
          ? `Sim — ${values.secretSocietyName}`
          : label(YES_NO_LABELS, values.secretSociety),
      ],
      ['Mensagem', values.membershipNote],
    ],
  ];
}

export function ReviewStep({ values, smallGroups, onEdit }: Props) {
  return (
    <>
      {reviewRows(values, smallGroups).map((rows, step) => (
        <ReviewSection key={STEP_TITLES[step]}>
          <ReviewHeader>
            <ReviewTitle>{STEP_TITLES[step]}</ReviewTitle>
            <LinkButton type="button" onClick={() => onEdit(step)}>
              <Pencil size={14} />
              Corrigir
            </LinkButton>
          </ReviewHeader>
          <ReviewList>
            {rows.map(([rowLabel, value]) => (
              <ReviewItem key={rowLabel}>
                <dt>{rowLabel}</dt>
                <dd>{value.trim() || 'Não informado'}</dd>
              </ReviewItem>
            ))}
          </ReviewList>
        </ReviewSection>
      ))}
    </>
  );
}
