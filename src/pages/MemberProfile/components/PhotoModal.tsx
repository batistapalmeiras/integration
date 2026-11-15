// React
import { ChangeEvent, useEffect, useRef, useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { Check, Crop, Save, Trash2, Upload } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
// Local
import { centeredFrame, frameCrop, PhotoFrame } from '../../../lib/photoFrame';
import { errorMessage, invalidateQueries } from '../../../lib/queryCache';
import { loadImage, scaledJpeg, squareJpeg } from '../../../lib/squareImage';
import { firstNameOf } from '../../../domain/text';
import {
  hasMemberPhoto,
  MemberPhotoFiles,
  memberPhotoUrls,
  removeMemberPhoto,
  saveMemberPhoto,
} from '../../../repositories/memberPhotos';
import { Relative } from '../../../repositories/family';
import { HiddenFileInput, PhotoActions, PhotoPreview } from '../styles';
import { PhotoCropper } from './PhotoCropper';

const PHOTO_SIZE = 400;
const THUMB_SIZE = 112;
const PREVIEW_SIZE = 240;
const CROP_VIEWPORT = 280;
const ORIGINAL_MAX_SIDE = 1080;

interface Props {
  personId: string;
  photoUrl: string | null;
  spouse: Pick<Relative, 'id' | 'name'> | null;
  close: () => void;
}

interface PickedPhoto {
  url: string;
  image: HTMLImageElement;
  frame: PhotoFrame;
  isNew: boolean;
}

const refreshPhotos = (personId: string) =>
  invalidateQueries(
    (key) =>
      (key[0] === 'people' && (key[1] === 'members' || key[1] === 'member-photos')) ||
      (key[0] === 'person' && key[1] === personId),
  );

export function PhotoModal({ personId, photoUrl, spouse, close }: Props) {
  const { show: showToast, toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [picked, setPicked] = useState<PickedPhoto | null>(null);
  const [spouseOffer, setSpouseOffer] = useState<{
    files: MemberPhotoFiles;
    previewUrl: string;
    replacing: boolean;
  } | null>(null);
  const offerPreview = spouseOffer?.previewUrl;

  useEffect(
    () => () => {
      if (offerPreview) URL.revokeObjectURL(offerPreview);
    },
    [offerPreview],
  );

  const pickedUrl = picked?.url;

  useEffect(
    () => () => {
      if (pickedUrl?.startsWith('blob:')) URL.revokeObjectURL(pickedUrl);
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
      setPicked({
        url,
        image,
        frame: centeredFrame(image.naturalWidth, image.naturalHeight, CROP_VIEWPORT),
        isNew: true,
      });
    } catch (e) {
      URL.revokeObjectURL(url);
      showToast(errorMessage(e) ?? 'Não foi possível ler essa foto.');
    }
  };

  const editCurrent = async () => {
    setSaving(true);
    try {
      const originals = await memberPhotoUrls([personId], 'original');
      const url = originals[personId] ?? photoUrl;
      if (!url) return;
      const image = await loadImage(url);
      setPicked({
        url,
        image,
        frame: centeredFrame(image.naturalWidth, image.naturalHeight, CROP_VIEWPORT),
        isNew: false,
      });
    } catch (e) {
      showToast(errorMessage(e) ?? 'Não foi possível abrir a foto.');
    } finally {
      setSaving(false);
    }
  };

  const save = async (photo: PickedPhoto) => {
    setSaving(true);
    try {
      const crop = frameCrop(photo.frame);
      const [full, thumb, original] = await Promise.all([
        squareJpeg(photo.image, PHOTO_SIZE, crop),
        squareJpeg(photo.image, THUMB_SIZE, crop),
        scaledJpeg(photo.image, ORIGINAL_MAX_SIDE),
      ]);
      await saveMemberPhoto(personId, { photo: full, thumb, original: photo.isNew ? original : undefined });
      await refreshPhotos(personId);
      if (!spouse) {
        close();
        return;
      }
      const replacing = await hasMemberPhoto(spouse.id);
      setPicked(null);
      setSpouseOffer({ files: { photo: full, thumb, original }, previewUrl: URL.createObjectURL(full), replacing });
      setSaving(false);
    } catch (e) {
      setSaving(false);
      showToast(errorMessage(e) ?? 'Não foi possível enviar a foto.');
    }
  };

  const shareWithSpouse = (files: MemberPhotoFiles) =>
    spouse &&
    run(async () => {
      await saveMemberPhoto(spouse.id, files);
      await refreshPhotos(spouse.id);
    }, `Não foi possível salvar a foto de ${spouse.name}.`);

  if (spouse && spouseOffer) {
    return (
      <>
        <ModalTitle onClose={close}>Foto salva</ModalTitle>
        <PhotoPreview>
          <MemberPhoto url={spouseOffer.previewUrl} size={PREVIEW_SIZE} />
        </PhotoPreview>
        <Typography type="p">
          Deseja atribuir essa imagem a {spouse.name}?
          {spouseOffer.replacing && ` A foto atual de ${firstNameOf(spouse.name)} será substituída.`}
        </Typography>
        <ModalActions>
          <Button type="button" variant="primary" disabled={saving} onClick={() => shareWithSpouse(spouseOffer.files)}>
            {saving ? (
              'Salvando...'
            ) : (
              <>
                <Check size={16} />
                Sim, usar para {firstNameOf(spouse.name)}
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={close}>
            Não
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

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
      {photoUrl ? (
        <PhotoActions>
          <Button type="button" variant="secondary" disabled={saving} onClick={editCurrent}>
            <Crop size={16} />
            Editar
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => inputRef.current?.click()}>
            <Upload size={16} />
            Trocar
          </Button>
          <Button type="button" variant="danger" disabled={saving} onClick={() => setConfirmingRemove(true)}>
            <Trash2 size={16} />
            Remover
          </Button>
        </PhotoActions>
      ) : (
        <ModalActions>
          <Button type="button" variant="primary" onClick={() => inputRef.current?.click()}>
            <Upload size={16} />
            Enviar foto
          </Button>
        </ModalActions>
      )}
      {toast}
    </>
  );
}
