// React
import { FormEventHandler, ReactNode } from 'react';
import { Control } from 'react-hook-form';
// Libs
import { text, TextInput } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../../../domain/text';
import { CreateVisitorFormValues } from '../../validators';
import { Form, InlineFields } from './styles';

export { VisitorFormActions } from './styles';

interface Props {
  control: Control<CreateVisitorFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
  children?: ReactNode;
}

export function VisitorForm({ control, onSubmit, disabled, children }: Props) {
  return (
    <Form onSubmit={onSubmit}>
      <TextInput
        label="WhatsApp"
        control={control}
        name="phone"
        mask="phone"
        placeholder={PHONE_PLACEHOLDER}
        disabled={disabled}
      />
      <TextInput
        label={text.fields.name}
        control={control}
        name="name"
        placeholder={text.fields.fullName}
        disabled={disabled}
      />
      <InlineFields>
        <TextInput
          label="Idade"
          control={control}
          name="age"
          type="text"
          inputMode="numeric"
          placeholder="Idade"
          disabled={disabled}
        />
        <TextInput
          label={text.fields.email}
          control={control}
          name="email"
          type="email"
          placeholder={text.fields.emailPlaceholder}
          disabled={disabled}
        />
      </InlineFields>
      {children}
    </Form>
  );
}
