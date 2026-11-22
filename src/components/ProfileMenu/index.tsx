// React
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Libs
import { ModalTitle, useAuthCtx, useMediaQuery, useModal } from 'bp-kit';
// Components
import { Avatar } from '../Avatar';
import { SectionItem } from '../SectionShell';
import { SIDEMENU_MEDIA } from '../Layout/styles';
// Local
import { profileSections } from '../../features/access/profileSections';
import { useUserPhotoUrl } from '../../features/access/useUserPhotoUrl';
import { usePresence } from '../../lib/usePresence';
import { ROLE_LABELS, UserRole } from '../../types/enums';
import {
  Divider,
  Identity,
  IdentityText,
  Item,
  ModalBody,
  Name,
  POPOVER_EXIT_MS,
  Popover,
  Role,
  Trigger,
  Wrap,
} from './styles';

interface SummaryProps {
  name: string;
  photoUrl: string | null;
  roleLabel: string;
  sections: SectionItem[];
  onOpen: (path: string) => void;
}

function ProfileSummary({ name, photoUrl, roleLabel, sections, onOpen }: SummaryProps) {
  return (
    <>
      <Identity>
        <Avatar name={name} size={44} photoUrl={photoUrl} />
        <IdentityText>
          <Name>{name}</Name>
          <Role>{roleLabel}</Role>
        </IdentityText>
      </Identity>
      <Divider />
      {sections.map((section) => (
        <Item key={section.path} type="button" role="menuitem" onClick={() => onOpen(section.path)}>
          <section.icon size={16} />
          {section.label}
        </Item>
      ))}
    </>
  );
}

export function ProfileMenu() {
  const { user } = useAuthCtx();
  const navigate = useNavigate();
  const photoUrl = useUserPhotoUrl();
  const desktop = useMediaQuery(SIDEMENU_MEDIA);
  const { open, close, modal } = useModal('dialog', { fullScreenOnMobile: true });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const menuPresent = usePresence(popoverOpen, POPOVER_EXIT_MS);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popoverOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setPopoverOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPopoverOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [popoverOpen]);

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role as UserRole] ?? '';

  const openSection = (path: string) => {
    setPopoverOpen(false);
    close();
    navigate(path);
  };

  const summary = (
    <ProfileSummary
      name={user.name}
      photoUrl={photoUrl}
      roleLabel={roleLabel}
      sections={profileSections(user.id, user.role)}
      onOpen={openSection}
    />
  );

  const toggle = () => {
    if (desktop) {
      setPopoverOpen((current) => !current);
      return;
    }
    open(
      <>
        <ModalTitle onClose={close}>Minha conta</ModalTitle>
        <ModalBody>{summary}</ModalBody>
      </>,
    );
  };

  return (
    <Wrap ref={wrapRef}>
      <Trigger
        type="button"
        aria-label="Menu do usuário"
        aria-haspopup="true"
        aria-expanded={popoverOpen}
        onClick={toggle}
      >
        <Avatar name={user.name} size={36} photoUrl={photoUrl} />
      </Trigger>
      {desktop && menuPresent.mounted && (
        <Popover role="menu" $closing={menuPresent.closing}>
          {summary}
        </Popover>
      )}
      {modal}
    </Wrap>
  );
}
