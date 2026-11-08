// Libs
import { Button, Empty, Skeleton } from 'bp-kit';
// Local
import { ForcedChangePasswordPage } from '../../pages/ChangePassword';
import { Layout } from '../Layout';
import { useMustChangePassword } from './useMustChangePassword';

interface Props {
  children: React.ReactNode;
}

export function PasswordGate({ children }: Props) {
  const { mustChange, loading, failed, recheck } = useMustChangePassword();

  if (loading) return <Skeleton $h="320px" />;
  if (failed) {
    return (
      <Layout>
        <Empty title="Não foi possível verificar sua conta" description="Confira sua conexão e tente novamente." />
        <Button type="button" variant="primary" onClick={recheck}>
          Tentar novamente
        </Button>
      </Layout>
    );
  }
  if (mustChange) {
    return (
      <Layout>
        <ForcedChangePasswordPage onDone={recheck} />
      </Layout>
    );
  }
  return <>{children}</>;
}
