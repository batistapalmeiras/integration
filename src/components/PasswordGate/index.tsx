// Libs
import { Skeleton } from 'bp-kit';
// Local
import { Layout } from '../Layout';
import { ForcedChangePasswordPage } from '../../pages/ChangePassword';
import { useMustChangePassword } from './useMustChangePassword';

interface Props {
  children: React.ReactNode;
}

// Wraps the whole authenticated app (mounted once per session, above the
// inner per-route ProtectedRoutes) — blocks every screen behind a forced
// password change for a volunteer still on the shared default password.
// Keeps the normal logged-in Layout (nav, user menu) around the forced
// screen instead of a bare public-looking page — the gate holds regardless
// of which nav link gets clicked, since it renders above route matching.
export function PasswordGate({ children }: Props) {
  const { mustChange, loading, recheck } = useMustChangePassword();

  if (loading) return <Skeleton $h="320px" />;
  if (mustChange) {
    return (
      <Layout>
        <ForcedChangePasswordPage onDone={recheck} />
      </Layout>
    );
  }
  return <>{children}</>;
}
