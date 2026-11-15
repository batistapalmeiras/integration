// React
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Control, UseFormSetValue, useController, useWatch } from 'react-hook-form';
// Libs
import { Button, InfoBox } from 'bp-kit';
import { Check, Upload } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
import { ErrorMsg } from '../../../components/PublicPage/styles';
// Local
import { errorMessage } from '../../../lib/queryCache';
import { uploadSubmittedPhoto } from '../../../repositories/memberPhotos';
import { openPhoto, PhotoCropper, PickedPhoto, preparePhotoFiles } from '../../memberPhoto';
import { MembershipFormValues } from '../schema';
import { Hint, PhotoActions, PhotoInput, PhotoPreview } from '../styles';

const PREVIEW_SIZE = 160;
const ACCEPTED_TYPES = 'image/jpeg,image/png';

interface Props {
  control: Control<MembershipFormValues>;
  setValue: UseFormSetValue<MembershipFormValues>;
}

const dataUrlOf = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error()));
    reader.onerror = () => reject(new Error());
    reader.readAsDataURL(blob);
  });

export function PhotoStep({ control, setValue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useWatch({ control, name: 'photoPreview' });
  const { fieldState } = useController({ control, name: 'photoToken' });
  const [picked, setPicked] = useState<PickedPhoto | null>(null);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const pickedUrl = picked?.url;

  useEffect(
    () => () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    },
    [pickedUrl],
  );

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFailure(null);
    const url = URL.createObjectURL(file);
    try {
      setPicked(await openPhoto(url));
    } catch (e) {
      URL.revokeObjectURL(url);
      setFailure(errorMessage(e) ?? 'Não foi possível ler essa foto.');
    }
  };

  const confirm = async (photo: PickedPhoto) => {
    setSending(true);
    setFailure(null);
    try {
      const files = await preparePhotoFiles(photo);
      const token = await uploadSubmittedPhoto(files);
      setValue('photoPreview', await dataUrlOf(files.thumb));
      setValue('photoToken', token, { shouldValidate: true, shouldDirty: true });
      setPicked(null);
    } catch (e) {
      setFailure(errorMessage(e) ?? 'Não foi possível enviar a foto. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  if (picked) {
    return (
      <>
        <Hint>Arraste a foto e use o zoom para deixar o seu rosto no centro do círculo.</Hint>
        <PhotoCropper url={picked.url} frame={picked.frame} onChange={(frame) => setPicked({ ...picked, frame })} />
        {failure && <ErrorMsg>{failure}</ErrorMsg>}
        <PhotoActions>
          <Button type="button" variant="primary" disabled={sending} onClick={() => confirm(picked)}>
            {sending ? (
              'Enviando...'
            ) : (
              <>
                <Check size={16} />
                Usar esta foto
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={sending} onClick={() => setPicked(null)}>
            Escolher outra
          </Button>
        </PhotoActions>
      </>
    );
  }

  return (
    <>
      <InfoBox>Envie uma foto do seu rosto, de frente e bem iluminada, já salva no seu celular ou computador.</InfoBox>
      <PhotoPreview>
        <MemberPhoto url={preview || null} size={PREVIEW_SIZE} />
      </PhotoPreview>
      <PhotoInput ref={inputRef} type="file" accept={ACCEPTED_TYPES} onChange={pick} />
      <PhotoActions>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          <Upload size={16} />
          {preview ? 'Trocar foto' : 'Enviar foto'}
        </Button>
      </PhotoActions>
      {(failure ?? fieldState.error?.message) && <ErrorMsg>{failure ?? fieldState.error?.message}</ErrorMsg>}
    </>
  );
}
