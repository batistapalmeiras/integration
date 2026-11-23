// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { BottomSheet, Button, ModalActions, ModalTitle, Typography, useModal, useToast } from 'bp-kit';
import { Archive, Pencil, RotateCcw, Trash2 } from 'lucide-react';
// Components
import { OptionsMenuActions } from '../../../../components/OptionsMenu';
// Local
import { Person } from '../../../../features/visitors';
import { AppRoute } from '../../../../routes/paths';
import { CreateVisitorFormValues } from '../../validators';
import { EditVisitorForm } from './EditVisitorForm';

interface Options {
  person: Person;
  canManage: boolean;
  onSave: (values: CreateVisitorFormValues) => Promise<unknown>;
  onArchive: () => Promise<unknown>;
  onReactivate: () => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}

export function useVisitorMenu({ person, canManage, onSave, onArchive, onReactivate, onDelete }: Options) {
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const [menuOpen, setMenuOpen] = useState(false);
  const { show: showToast, toast } = useToast();

  const canArchive = canManage && person.status !== 'archived';
  const canDelete = canManage && person.status === 'initial_contact';

  const openEdit = (onBack: () => void) =>
    open(
      <>
        <ModalTitle onClose={close}>Editar dados</ModalTitle>
        <EditVisitorForm
          person={person}
          onSave={async (values) => {
            await onSave(values);
            close();
          }}
          onBack={onBack}
        />
      </>,
    );

  const confirmDelete = () =>
    open(
      <>
        <ModalTitle onClose={close}>Excluir {person.name}?</ModalTitle>
        <Typography type="p">
          Só é possível excluir enquanto a pessoa ainda está no contato inicial. Essa ação não pode ser desfeita.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                await onDelete();
                close();
                navigate(AppRoute.Visitors);
              } catch (e) {
                showToast(e instanceof Error ? e.message : 'Não foi possível excluir.');
              }
            }}
          >
            <Trash2 size={16} />
            Excluir
          </Button>
          <Button type="button" variant="secondary" onClick={backToMenu}>
            Voltar
          </Button>
        </ModalActions>
      </>,
    );

  const openMenu = () => setMenuOpen(true);

  const backToMenu = () => {
    close();
    setMenuOpen(true);
  };

  return {
    openMenu,
    openEdit: () => openEdit(close),
    overlays: (
      <>
        {menuOpen && (
          <BottomSheet title={person.name} height="half" onClose={() => setMenuOpen(false)}>
            <OptionsMenuActions>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMenuOpen(false);
                  openEdit(backToMenu);
                }}
              >
                <Pencil size={16} />
                Editar dados
              </Button>
              {canArchive && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    await onArchive();
                    setMenuOpen(false);
                    navigate(AppRoute.Visitors);
                  }}
                >
                  <Archive size={16} />
                  Arquivar
                </Button>
              )}
              {canManage && person.status === 'archived' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    await onReactivate();
                    setMenuOpen(false);
                  }}
                >
                  <RotateCcw size={16} />
                  Reativar
                </Button>
              )}
              {canDelete && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    confirmDelete();
                  }}
                >
                  <Trash2 size={16} />
                  Excluir cadastro
                </Button>
              )}
            </OptionsMenuActions>
          </BottomSheet>
        )}
        {modal}
        {toast}
      </>
    ),
  };
}
