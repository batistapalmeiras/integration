// React
import { Control, UseFormSetValue } from 'react-hook-form';
// Libs
import { DatePicker, Select, Textarea, TextInput, text } from 'bp-kit';
// Components
import { ZipAddress, ZipField } from '../../components/ZipField';
// Local
import { formatDate, isFutureDate } from '../../domain/dates';
import { MemberRecord } from '../../domain/memberRecords';
import { PHONE_PLACEHOLDER } from '../../domain/text';
import { useCouncils } from '../../queries/councils';
import { RecordField, RecordSection } from './sections';

interface FieldProps {
  field: RecordField;
  control: Control<MemberRecord>;
  setValue: UseFormSetValue<MemberRecord>;
}

function RecordFieldInput({ field, control, setValue }: FieldProps) {
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
    case 'zip':
      return <ZipField control={control} name={field.name} onAddress={(address) => fillAddress(setValue, address)} />;
    default:
      return (
        <TextInput
          {...common}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          mask={field.mask}
          inputMode={field.numeric ? 'numeric' : undefined}
        />
      );
  }
}

function fillAddress(setValue: UseFormSetValue<MemberRecord>, address: ZipAddress) {
  const options = { shouldValidate: true, shouldDirty: true };
  if (address.street) setValue('addressStreet', address.street, options);
  if (address.neighborhood) setValue('addressNeighborhood', address.neighborhood, options);
  if (address.city) setValue('addressCity', address.city, options);
  if (address.state) setValue('addressState', address.state, options);
}

function CouncilSelect({ field, control }: Pick<FieldProps, 'field' | 'control'>) {
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
  setValue: UseFormSetValue<MemberRecord>;
}

export function RecordSectionFields({ section, control, setValue }: SectionProps) {
  return (
    <>
      {section.fields.map((field) => (
        <RecordFieldInput key={field.name} field={field} control={control} setValue={setValue} />
      ))}
    </>
  );
}
