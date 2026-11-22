// React
import { Navigate, useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, Skeleton, useAuthCtx } from 'bp-kit';
// Local
import { useRole } from '../../features/access/useRole';
import { AppRoute, profilePath } from '../../routes/paths';
import { hasRole, LEADERSHIP_ROLES, MEMBER_RECORD_ROLES } from '../../types/enums';
import { MemberProfile } from '../MemberProfile';
import { useVolunteerDetail } from '../Volunteers/hooks/useVolunteerDetail';
import { AccessSection } from './components/AccessSection';
import { ProfileShell } from './components/ProfileShell';
import { AccountForm } from './AccountForm';

const ACCESS_SECTION = 'acesso';

export function ProfilePage() {
  const { id = '', section } = useParams<{ id: string; section: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const role = useRole();
  const { volunteer, loading, error } = useVolunteerDetail(id);
  const ownProfile = id === user?.id;
  const opensRecord = hasRole(user?.role, MEMBER_RECORD_ROLES);
  const sectionAllowed = section === undefined || (section === ACCESS_SECTION && opensRecord && !ownProfile);

  if (user && !ownProfile && !hasRole(role, LEADERSHIP_ROLES)) return <Navigate to={profilePath(user.id)} replace />;
  if (!sectionAllowed) return <Navigate to={profilePath(id)} replace />;

  const renderContent = () => {
    if (ownProfile && !opensRecord) return <AccountForm />;
    if (loading) return <Skeleton $h="320px" />;
    if (error || !volunteer) {
      return ownProfile ? <AccountForm /> : <Empty title="Usuário não encontrado" description={error ?? ''} />;
    }
    if (section === ACCESS_SECTION || !opensRecord) {
      return <AccessSection personId={volunteer.personId} onRemoved={() => navigate(AppRoute.Volunteers)} />;
    }
    return <MemberProfile id={volunteer.personId} />;
  };

  return <ProfileShell viewing={id}>{renderContent()}</ProfileShell>;
}
