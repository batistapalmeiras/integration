// React
import { ChangeEvent, useEffect, useRef, useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { Save, Trash2, Upload } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
// Local
import { centeredFrame, frameCrop, PhotoFrame } from '../../../lib/photoFrame';
import { errorMessage, invalidateQueries } from '../../../lib/queryCache';
import { loadImage, squareJpeg } from '../../../lib/squareImage';
import { removeMemberPhoto, saveMemberPhoto } from '../../../repositories/memberPhotos';
import { HiddenFileInput, PhotoPreview } from '../styles';
import { PhotoCropper } from './PhotoCropper';

const PHOTO_SIZE = 400;
const THUMB_SIZE = 112;
const PREVIEW_SIZE = 240;
const CROP_VIEWPORT = 280;

interface Props {
  personId: string;
  photoUrl: string | null;
  close: () => void;
}

interface PickedPhoto {
  url: string;
  image: HTMLImageElement;
  frame: PhotoFrame;
}

const refreshPhotos = (personId: string) =>
  invalidateQueries(
    (key) =>
      (key[0] === 'people' && (key[1] === 'members' || key[1] === 'member-photos')) ||
      (key[0] === 'person' && key[1] === personId),
  );

export function PhotoModal({ personId, photoUrl, close }: Props) {
  const { show: showToast, toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [picked, setPicked] = useState<PickedPhoto | null>(null);

  const pickedUrl = picked?.url;

  useEffect(
    () => () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    },
    [pickedUrl],
  );

  const run = async (action: () => Promise<void>, failure: string) => {
    setSaving(true);
    try {
      await action();
      await refreshPhotos(personId);
      close();
    } catch (e) {
      setSaving(false);
      showToast(errorMessage(e) ?? failure);
    }
  };

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      setPicked({ url, image, frame: centeredFrame(image.naturalWidth, image.naturalHeight, CROP_VIEWPORT) });
    } catch (e) {
      URL.revokeObjectURL(url);
      showToast(errorMessage(e) ?? 'Não foi possível ler essa foto.');
    }
  };

  const save = (photo: PickedPhoto) =>
    run(async () => {
      const crop = frameCrop(photo.frame);
      const [full, thumb] = await Promise.all([
        squareJpeg(photo.image, PHOTO_SIZE, crop),
        squareJpeg(photo.image, THUMB_SIZE, crop),
      ]);
      await saveMemberPhoto(personId, full, thumb);
    }, 'Não foi possível enviar a foto.');

  if (picked) {
    return (
      <>
        <ModalTitle onClose={close}>Posicionar foto</ModalTitle>
        <Typography type="p">Arraste a foto e use o zoom para deixar o rosto no centro do círculo.</Typography>
        <PhotoCropper
          url={picked.url}
          frame={picked.frame}
          onChange={(frame) => setPicked((current) => current && { ...current, frame })}
        />
        <ModalActions>
          <Button type="button" variant="primary" disabled={saving} onClick={() => save(picked)}>
            {saving ? (
              'Salvando...'
            ) : (
              <>
                <Save size={16} />
                Salvar foto
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => setPicked(null)}>
            Voltar
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  if (confirmingRemove) {
    return (
      <>
        <ModalTitle onClose={close}>Remover foto?</ModalTitle>
        <Typography type="p">A foto será apagada. Essa ação não pode ser desfeita.</Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            disabled={saving}
            onClick={() => run(() => removeMemberPhoto(personId), 'Não foi possível remover a foto.')}
          >
            {saving ? (
              'Removendo...'
            ) : (
              <>
                <Trash2 size={16} />
                Remover foto
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmingRemove(false)}>
            Voltar
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>Foto</ModalTitle>
      <PhotoPreview>
        <MemberPhoto url={photoUrl} size={PREVIEW_SIZE} />
      </PhotoPreview>
      <HiddenFileInput ref={inputRef} type="file" accept="image/*" onChange={pick} />
      <ModalActions>
        <Button type="button" variant="primary" onClick={() => inputRef.current?.click()}>
          <Upload size={16} />
          {photoUrl ? 'Trocar foto' : 'Enviar foto'}
        </Button>
        {photoUrl && (
          <Button type="button" variant="danger" onClick={() => setConfirmingRemove(true)}>
            <Trash2 size={16} />
            Remover foto
          </Button>
        )}
      </ModalActions>
      {toast}
    </>
  );
}
