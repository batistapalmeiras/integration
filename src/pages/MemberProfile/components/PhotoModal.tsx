// React
import { ChangeEvent, useEffect, useRef, useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { Check, Crop, Save, Trash2, Upload } from 'lucide-react';
// Components
import { MemberPhoto } from '../../../components/MemberPhoto';
// Local
import {
  openPhoto,
  PhotoCropper,
  PickedPhoto as SharedPickedPhoto,
  preparePhotoFiles,
} from '../../../features/memberPhoto';
import { errorMessage, invalidateQueries } from '../../../lib/queryCache';
import { firstNameOf } from '../../../domain/text';
import {
  MemberPhotoFiles,
  memberPhotoOwner,
  memberPhotoUrls,
  PhotoOwner,
  removeMemberPhoto,
  saveMemberPhoto,
} from '../../../repositories/memberPhotos';
import { Relative } from '../../../repositories/family';
import { HiddenFileInput, PhotoActions, PhotoPreview } from '../styles';

const PREVIEW_SIZE = 240;

interface Props {
  personId: string;
  photoUrl: string | null;
  photo: PhotoOwner | null;
  spouse: Pick<Relative, 'id' | 'name'> | null;
  close: () => void;
}

interface PickedPhoto extends SharedPickedPhoto {
  isNew: boolean;
}

const refreshPhotos = (personId: string) =>
  invalidateQueries(
    (key) =>
      (key[0] === 'people' && (key[1] === 'members' || key[1] === 'member-photos')) ||
      (key[0] === 'person' && key[1] === personId),
  );

export function PhotoModal({ personId, photoUrl, photo: currentPhoto, spouse, close }: Props) {
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

  const openFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      setPicked({ ...(await openPhoto(url)), isNew: true });
    } catch (e) {
      URL.revokeObjectURL(url);
      showToast(errorMessage(e) ?? 'Não foi possível ler essa foto.');
    }
  };

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void openFile(file);
  };

  const choosing = !picked && !spouseOffer && !confirmingRemove && !saving;

  useEffect(() => {
    if (!choosing) return undefined;
    const paste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith('image/'));
      if (!file) return;
      event.preventDefault();
      void openFile(file);
    };
    window.addEventListener('paste', paste);
    return () => window.removeEventListener('paste', paste);
  });

  const editCurrent = async () => {
    setSaving(true);
    try {
      const urls = currentPhoto ? await memberPhotoUrls([currentPhoto], ['original']) : null;
      const url = urls?.original[personId] ?? photoUrl;
      if (!url) return;
      setPicked({ ...(await openPhoto(url)), isNew: false });
    } catch (e) {
      showToast(errorMessage(e) ?? 'Não foi possível abrir a foto.');
    } finally {
      setSaving(false);
    }
  };

  const save = async (photo: PickedPhoto) => {
    setSaving(true);
    try {
      const { photo: full, thumb, original } = await preparePhotoFiles(photo);
      const keepsOriginal = !photo.isNew && currentPhoto?.folder === personId;
      await saveMemberPhoto(personId, { photo: full, thumb, original: keepsOriginal ? undefined : original });
      await refreshPhotos(personId);
      if (!spouse) {
        close();
        return;
      }
      const replacing = (await memberPhotoOwner(spouse.id)) !== null;
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
            onClick={() =>
              run(
                () => removeMemberPhoto({ personId, folder: currentPhoto?.folder ?? personId }),
                'Não foi possível remover a foto.',
              )
            }
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
