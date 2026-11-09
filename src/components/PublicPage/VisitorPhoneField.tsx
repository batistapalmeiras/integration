// React
import { useState } from 'react';
import { Control } from 'react-hook-form';
// Libs
import { LinkButton, text, TextInput, Typography } from 'bp-kit';
// Local
import { PHONE_PLACEHOLDER } from '../../domain/text';
import { clearVisitorIdentity, KnownVisitor, loadKnownVisitor } from '../../lib/visitorIdentity';

export function useKnownVisitor() {
  const [known, setKnown] = useState(loadKnownVisitor);

  const forget = () => {
    clearVisitorIdentity();
    setKnown(null);
  };

  return { known, forget };
}

interface Props {
  control: Control<{ phone: string }>;
  known: KnownVisitor | null;
  prompt: string;
  knownPrompt: string;
}

export function NotYouLink({ onClick }: { onClick: () => void }) {
  return (
    <LinkButton type="button" onClick={onClick}>
      Não é você? Usar outro número
    </LinkButton>
  );
}

export function VisitorPhoneField({ control, known, prompt, knownPrompt }: Props) {
  if (known) {
    return (
      <>
        <Typography type="h5">Olá, {known.name.trim().split(/\s+/)[0]}!</Typography>
        <Typography type="p">{knownPrompt}</Typography>
      </>
    );
  }

  return (
    <>
      <Typography type="p">{prompt}</Typography>
      <TextInput
        label={text.fields.phone}
        control={control}
        name="phone"
        mask="phone"
        inputMode="numeric"
        placeholder={PHONE_PLACEHOLDER}
        autoFocus
      />
    </>
  );
}
