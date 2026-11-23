// React
import { useState } from 'react';
// Libs
import { Button, ModalActions, ModalTitle, Typography, useToast } from 'bp-kit';
import { ArrowRightLeft, Check, UserMinus } from 'lucide-react';
// Local
import { CONSOLIDATION_KIND_LABELS, ConsolidationAnswer, ConsolidationItem } from '../../../domain/consolidation';
import { formatTimestampDate } from '../../../domain/dates';
import { errorMessage } from '../../../lib/queryCache';
import { CurrentTag, TargetList, TargetOption } from '../styles';
import { refreshConsolidations } from '../../../queries/consolidations';
import { useMinistries, useSmallGroups } from '../../../queries/reference';
import { answerConsolidation, redirectConsolidation } from '../../../repositories/consolidations';

type Step = 'choose' | 'redirect' | 'remove';

interface Props {
  item: ConsolidationItem;
  close: () => void;
}

export function AnswerModal({ item, close }: Props) {
  const { show: showToast, toast } = useToast();
  const [step, setStep] = useState<Step>('choose');
  const [busy, setBusy] = useState(false);
  const smallGroups = useSmallGroups().data ?? [];
  const ministries = useMinistries().data ?? [];
  const [targetId, setTargetId] = useState('');
  const groupLabel = `${CONSOLIDATION_KIND_LABELS[item.kind]} ${item.groupName}`;

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await action();
      await refreshConsolidations();
      close();
    } catch (e) {
      setBusy(false);
      showToast(errorMessage(e) ?? failure);
    }
  };

  const answer = (value: ConsolidationAnswer) =>
    run(() => answerConsolidation(item.id, value), 'Não foi possível registrar a resposta.');

  const redirect = () =>
    run(() => redirectConsolidation(item.id, item.kind, targetId), 'Não foi possível redirecionar a pessoa.');

  const targets = item.kind === 'small_group' ? smallGroups : ministries;

  if (step === 'remove') {
    return (
      <>
        <ModalTitle onClose={close}>Não se consolidou?</ModalTitle>
        <Typography type="p">
          {item.personName} sai do {groupLabel} e a consolidação vai para o histórico. Para voltar ao grupo, é preciso
          adicioná-la de novo.
        </Typography>
        <ModalActions>
          <Button type="button" variant="danger" disabled={busy} onClick={() => answer('not_consolidated')}>
            {busy ? (
              'Removendo...'
            ) : (
              <>
                <UserMinus size={16} />
                Remover do grupo
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setStep('choose')}>
            Voltar
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  if (step === 'redirect') {
    return (
      <>
        <ModalTitle onClose={close}>Redirecionar {item.personName}</ModalTitle>
        <TargetList role="radiogroup" aria-label={CONSOLIDATION_KIND_LABELS[item.kind]}>
          {targets.map((group) => {
            const current = group.id === item.groupId;
            return (
              <TargetOption
                key={group.id}
                type="button"
                role="radio"
                aria-checked={targetId === group.id}
                disabled={current || busy}
                onClick={() => setTargetId(group.id)}
              >
                {group.name}
                {current && <CurrentTag>Atual</CurrentTag>}
                {targetId === group.id && <Check size={16} aria-hidden="true" />}
              </TargetOption>
            );
          })}
        </TargetList>
        <ModalActions>
          <Button type="button" variant="primary" disabled={busy || !targetId} onClick={redirect}>
            {busy ? (
              'Redirecionando...'
            ) : (
              <>
                <ArrowRightLeft size={16} />
                Redirecionar
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setStep('choose')}>
            Voltar
          </Button>
        </ModalActions>
        {toast}
      </>
    );
  }

  return (
    <>
      <ModalTitle onClose={close}>Responder consolidação</ModalTitle>
      <Typography type="p">
        {item.personName} entrou no {groupLabel} em {formatTimestampDate(item.startedAt)}. O prazo{' '}
        {item.overdue ? 'venceu' : 'vence'} em {formatTimestampDate(item.dueAt)}.
      </Typography>
      <ModalActions>
        <Button type="button" variant="primary" disabled={busy} onClick={() => answer('consolidated')}>
          {busy ? (
            'Salvando...'
          ) : (
            <>
              <Check size={16} />
              Consolidou
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => setStep('redirect')}>
          <ArrowRightLeft size={16} />
          Redirecionar
        </Button>
        <Button type="button" variant="danger" disabled={busy} onClick={() => setStep('remove')}>
          <UserMinus size={16} />
          Não se consolidou
        </Button>
      </ModalActions>
      {toast}
    </>
  );
}
