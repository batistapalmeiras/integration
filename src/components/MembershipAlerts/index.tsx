// React
import { useEffect, useState } from 'react';
// Libs
import { Checkbox } from 'bp-kit';
// Local
import {
  listMembershipAlerts,
  MEMBERSHIP_ALERT_LABELS,
  MembershipAlert,
  setMembershipAlertResolved,
} from '../../domain/membershipAlerts';
import { AlertAnswer, AlertItem, AlertNote, AlertSection, AlertSectionTitle, AlertTitle } from './styles';

interface Props {
  personId: string;
}

export function MembershipAlerts({ personId }: Props) {
  const [alerts, setAlerts] = useState<MembershipAlert[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMembershipAlerts([personId]).then(setAlerts).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [personId]);

  if (alerts.length === 0 && !error) return null;

  const toggle = async (alert: MembershipAlert, resolved: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await setMembershipAlertResolved(personId, alert.code, resolved);
      setAlerts((current) => current.map((item) => (item.code === alert.code ? { ...item, resolved } : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setSaving(false);
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
