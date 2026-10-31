// Libs
import { Card, maskPhone, Skeleton, Typography } from 'bp-kit';
import { Link } from 'react-router-dom';
// Local
import { Avatar } from '../../../components/Avatar';
import { useVisitorDetail } from '../../../features/visitors';
import { AppRoute } from '../../../routes/paths';
import { NextStep } from '../Detail/components/NextStep';
import { ProgressStepper } from '../Detail/components/ProgressStepper';
import { PreviewHeader } from '../styles';

interface Props {
  personId: string;
  onChanged: () => void;
}

export function VisitorPreview({ personId, onChanged }: Props) {
  const detail = useVisitorDetail(personId);
  const { person, loading } = detail;

  if (loading || !person) return <Skeleton $h="320px" />;

  return (
    <>
      <Card>
        <PreviewHeader>
          <Avatar name={person.name} size={56} />
          <div>
            <Typography type="h3" as="h2">
              {person.name}
            </Typography>
            <Typography type="caption">{maskPhone(person.phone)}</Typography>
          </div>
        </PreviewHeader>
      </Card>
      <ProgressStepper status={person.status} />
      <NextStep detail={detail} onContactRegistered={onChanged} />
      <Link to={`${AppRoute.Visitors}/${person.id}`}>Abrir perfil completo</Link>
    </>
  );
}
