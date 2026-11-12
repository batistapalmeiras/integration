// React
import { Control } from 'react-hook-form';
// Libs
import { DatePicker, Select, Textarea, TextInput, text } from 'bp-kit';
// Local
import { formatDate, isFutureDate } from '../../domain/dates';
import { MemberRecord } from '../../domain/memberRecords';
import { PHONE_PLACEHOLDER } from '../../domain/text';
import { useCouncils } from '../../queries/councils';
import { RecordField, RecordSection } from './sections';

interface FieldProps {
  field: RecordField;
  control: Control<MemberRecord>;
}

function RecordFieldInput({ field, control }: FieldProps) {
  const common = { label: field.label, control, name: field.name };
  switch (field.kind) {
    case 'phone':
      return <TextInput {...common} mask="phone" inputMode="numeric" placeholder={PHONE_PLACEHOLDER} />;
    case 'email':
      return <TextInput {...common} type="email" placeholder={text.fields.emailPlaceholder} />;
    case 'date':
      return <DatePicker {...common} isDateDisabled={isFutureDate} />;
    case 'textarea':
      return <Textarea {...common} rows={field.rows} />;
    case 'select':
      return (
        <Select {...common}>
          {field.emptyLabel && <option value="">{field.emptyLabel}</option>}
          {Object.entries(field.labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      );
    case 'council':
      return <CouncilSelect field={field} control={control} />;
    default:
      return (
        <TextInput
          {...common}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          inputMode={field.numeric ? 'numeric' : undefined}
        />
      );
  }
}

function CouncilSelect({ field, control }: FieldProps) {
  const councils = useCouncils().data ?? [];
  return (
    <Select label={field.label} control={control} name={field.name}>
      <option value="">Não informado</option>
      {councils.map((council) => (
        <option key={council.id} value={council.id}>
          {formatDate(council.meetingDate)}
        </option>
      ))}
    </Select>
  );
}

interface SectionProps {
  section: RecordSection;
  control: Control<MemberRecord>;
}

export function RecordSectionFields({ section, control }: SectionProps) {
  return (
    <>
      {section.fields.map((field) => (
        <RecordFieldInput key={field.name} field={field} control={control} />
      ))}
    </>
  );
}
