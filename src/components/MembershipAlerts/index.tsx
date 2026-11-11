// React
import { useState } from 'react';
// Libs
import { Checkbox } from 'bp-kit';
// Local
import { MEMBERSHIP_ALERT_LABELS, MembershipAlert } from '../../domain/membership';
import { errorMessage, setQueryData } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { useMembershipAlerts } from '../../queries/person';
import { setMembershipAlertResolved } from '../../repositories/membership';
import { AlertAnswer, AlertItem, AlertNote, AlertSection, AlertSectionTitle, AlertTitle } from './styles';

interface Props {
  personId: string;
  onlyPending?: boolean;
  boxed?: boolean;
}

export function MembershipAlerts({ personId, onlyPending = false, boxed = false }: Props) {
  const query = useMembershipAlerts(personId);
  const alerts = (query.data ?? []).filter((alert) => !onlyPending || !alert.resolved);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const error = saveError ?? errorMessage(query.error);

  if (alerts.length === 0 && !error) return null;

  const toggle = async (alert: MembershipAlert, resolved: boolean) => {
    setSaving(true);
    setSaveError(null);
    try {
      await setMembershipAlertResolved(personId, alert.code, resolved);
      setQueryData<MembershipAlert[]>(queryKeys.membershipAlerts(personId), (current) =>
        (current ?? []).map((item) => (item.code === alert.code ? { ...item, resolved } : item)),
      );
    } catch (e) {
      setSaveError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertSection $boxed={boxed}>
      <AlertSectionTitle>Pendências</AlertSectionTitle>
      {alerts.map((alert) => (
        <AlertItem key={alert.code}>
          <AlertTitle>{MEMBERSHIP_ALERT_LABELS[alert.code]}</AlertTitle>
          {alert.answer?.trim() && <AlertAnswer>Resposta na ficha: “{alert.answer.trim()}”</AlertAnswer>}
          <Checkbox
            label="Resolvido"
            checked={alert.resolved}
            disabled={saving}
            onChange={(e) => toggle(alert, e.target.checked)}
          />
        </AlertItem>
      ))}
      {error && <AlertNote>{error}</AlertNote>}
    </AlertSection>
  );
}
