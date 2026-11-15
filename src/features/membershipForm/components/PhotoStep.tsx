// React
import { ChangeEvent, useRef, useState } from 'react';
import { Control, useController } from 'react-hook-form';
// Libs
import { Button, LinkButton } from 'bp-kit';
import { ImagePlus, RefreshCw } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { choosePhoto, PhotoCropper } from '../../memberPhoto';
import { MembershipFormValues } from '../schema';
import { Hint, PhotoActions, PhotoError, PhotoInput, PhotoPreview } from '../styles';

const PLACEHOLDER_SIZE = 160;
const ACCEPTED_TYPES = 'image/jpeg,image/png';

interface Props {
  control: Control<MembershipFormValues>;
}

export function PhotoStep({ control }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { field, fieldState } = useController({ control, name: 'photo' });
  const [reading, setReading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const photo = field.value;

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setReading(true);
    setFailure(null);
    try {
      field.onChange(await choosePhoto(file));
    } catch (e) {
      setFailure(errorMessage(e) ?? 'Não foi possível ler essa foto.');
    } finally {
      setReading(false);
    }
  };

  const error = failure ?? fieldState.error?.message;

  return (
    <>
      <PhotoInput ref={inputRef} type="file" accept={ACCEPTED_TYPES} onChange={pick} />
      {photo ? (
        <>
          <Hint>Arraste a foto e use o zoom para deixar o seu rosto no centro do círculo.</Hint>
          <PhotoCropper
            url={photo.source}
            frame={photo.frame}
            onChange={(frame) => field.onChange({ ...photo, frame })}
          />
          <PhotoActions>
            <LinkButton type="button" icon={<RefreshCw size={14} />} onClick={() => inputRef.current?.click()}>
              Trocar foto
            </LinkButton>
          </PhotoActions>
        </>
      ) : (
        <>
          <PhotoPreview>
            <MemberPhoto url={null} size={PLACEHOLDER_SIZE} />
          </PhotoPreview>
          <PhotoActions>
            <Button type="button" variant="secondary" disabled={reading} onClick={() => inputRef.current?.click()}>
              <ImagePlus size={16} />
              {reading ? 'Abrindo...' : 'Escolher foto'}
            </Button>
          </PhotoActions>
        </>
      )}
      {error && <PhotoError>{error}</PhotoError>}
    </>
  );
}
