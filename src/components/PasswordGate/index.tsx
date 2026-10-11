// Libs
import { Skeleton } from 'bp-kit';
// Local
import { Layout } from '../Layout';
import { ForcedChangePasswordPage } from '../../pages/ChangePassword';
import { useMustChangePassword } from './useMustChangePassword';

interface Props {
  children: React.ReactNode;
}

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
