// Libs
import { screen, waitFor } from '@testing-library/react';
// Local
import { Avatar } from '../../src/components/Avatar';
import { ProfileMenu } from '../../src/components/ProfileMenu';
import { memberPhotoOwner, memberPhotoUrls } from '../../src/repositories/memberPhotos';
import { getOwnPersonId } from '../../src/repositories/profiles';
import { UserRole } from '../../src/types/enums';
import { renderScreen } from '../support/render';

vi.mock('../../src/repositories/profiles', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/repositories/profiles')>()),
  getOwnPersonId: vi.fn(),
}));
vi.mock('../../src/repositories/memberPhotos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/repositories/memberPhotos')>()),
  memberPhotoOwner: vi.fn(),
  memberPhotoUrls: vi.fn(),
}));

describe('avatar', () => {
  it('shows the initials, or the photo when there is one', () => {
    const initials = renderScreen(<Avatar name="Ana Souza" />);
    expect(initials.container).toHaveTextContent('AS');
    expect(initials.container.querySelector('img')).not.toBeInTheDocument();
    initials.unmount();

    const photo = renderScreen(<Avatar name="Ana Souza" photoUrl="https://example.com/ana.jpg" />);
    expect(photo.container.querySelector('img')).toHaveAttribute('src', 'https://example.com/ana.jpg');
    expect(photo.container).not.toHaveTextContent('AS');
  });
});

describe('photo of the user in the profile menu', () => {
  beforeEach(() => {
    vi.mocked(getOwnPersonId).mockClear();
    vi.mocked(getOwnPersonId).mockResolvedValue('person-1');
    vi.mocked(memberPhotoOwner).mockResolvedValue({ personId: 'person-1', folder: 'person-1', version: 'v1' });
    vi.mocked(memberPhotoUrls).mockResolvedValue({
      photo: { 'person-1': 'https://example.com/me.jpg' },
      thumb: {},
      original: {},
    });
  });

  it('replaces the initials with the photo for who can see the member photos', async () => {
    const { container } = renderScreen(<ProfileMenu />, { role: UserRole.GeneralAdmin });

    await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/me.jpg'));
    expect(screen.getByRole('button', { name: 'Menu do usuário' })).toBeInTheDocument();
  });

  it('keeps the initials, and asks for nothing, for everyone else', () => {
    const { container } = renderScreen(<ProfileMenu />, { role: UserRole.Teacher });

    expect(container).toHaveTextContent('AS');
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(getOwnPersonId).not.toHaveBeenCalled();
  });
});
