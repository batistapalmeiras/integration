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
}

export function MembershipAlerts({ personId }: Props) {
  const query = useMembershipAlerts(personId);
  const alerts = query.data ?? [];
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
    <AlertSection>
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
      <AlertNote>O que não estiver resolvido fica nas pendências do membro até o pastor resolver.</AlertNote>
      {error && <AlertNote>{error}</AlertNote>}
    </AlertSection>
  );
}
