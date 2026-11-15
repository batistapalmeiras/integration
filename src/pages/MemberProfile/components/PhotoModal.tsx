// React
import { ChangeEvent, useRef, useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { Trash2, Upload } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
// Local
import { errorMessage, invalidateQueries } from '../../../lib/queryCache';
import { loadImage, squareJpeg } from '../../../lib/squareImage';
import { removeMemberPhoto, saveMemberPhoto } from '../../../repositories/memberPhotos';
import { HiddenFileInput, PhotoPreview } from '../styles';

const PHOTO_SIZE = 400;
const THUMB_SIZE = 112;
const PREVIEW_SIZE = 240;

interface Props {
  personId: string;
  photoUrl: string | null;
  close: () => void;
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

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void run(async () => {
      const image = await loadImage(file);
      const [photo, thumb] = await Promise.all([squareJpeg(image, PHOTO_SIZE), squareJpeg(image, THUMB_SIZE)]);
      await saveMemberPhoto(personId, photo, thumb);
    }, 'Não foi possível enviar a foto.');
  };

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
      <HiddenFileInput ref={inputRef} type="file" accept="image/*" onChange={upload} />
      <ModalActions>
        <Button type="button" variant="primary" disabled={saving} onClick={() => inputRef.current?.click()}>
          {saving ? (
            'Enviando...'
          ) : (
            <>
              <Upload size={16} />
              {photoUrl ? 'Trocar foto' : 'Enviar foto'}
            </>
          )}
        </Button>
        {photoUrl && (
          <Button type="button" variant="danger" disabled={saving} onClick={() => setConfirmingRemove(true)}>
            <Trash2 size={16} />
            Remover foto
          </Button>
        )}
      </ModalActions>
      {toast}
    </>
  );
}
