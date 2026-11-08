// React
import { useNavigate, useSearchParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, maskPhone, Skeleton, text, useToast } from 'bp-kit';
import { Copy } from 'lucide-react';
// Components
import { ArrowSwitcher } from '../../components/ArrowSwitcher';
import { DateBadge } from '../../components/DateBadge';
import { List, ListChevron, ListGrow, ListItem } from '../../components/List';
import { PageHeader } from '../../components/PageHeader';
import { TonePill } from '../../components/StatusPill';
import {
  birthdayAgeLabel,
  birthdayMonth,
  birthdaysInMonth,
  birthdaysListText,
  isBirthdayToday,
} from '../../domain/birthdays';
import { monthName, todayKey } from '../../domain/dates';
import { errorMessage } from '../../lib/queryCache';
import { useMemberBirthdays } from '../../queries/person';
import { AppRoute } from '../../routes/paths';
// Local
import { Detail, Name, RowButton } from './styles';

const MONTH_PARAM = 'month';

function parseInteger(value: string | null, min: number, max: number): number | null {
  const number = Number(value);
  return value && Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export function BirthdaysPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, loading, error } = useMemberBirthdays();
  const { show: showToast, toast } = useToast();

  const today = todayKey();
  const currentYear = Number(today.slice(0, 4));
  const month = parseInteger(searchParams.get(MONTH_PARAM), 1, 12) ?? birthdayMonth(today);
  const selectMonth = (next: number) => setSearchParams({ [MONTH_PARAM]: String(next) }, { replace: true });

  const label = monthName(month);
  const birthdays = birthdaysInMonth(data ?? [], month);
  const count = birthdays.length;
  const caption = loading ? undefined : count === 1 ? '1 aniversariante' : `${count} aniversariantes`;

  const copyList = async () => {
    const list = birthdaysListText(birthdays, currentYear, label.toLowerCase(), maskPhone);
    try {
      await navigator.clipboard.writeText(list);
      showToast('Lista copiada.');
    } catch {
      showToast('Não foi possível copiar a lista.');
    }
  };

  return (
    <div>
      <PageHeader
        title={`Aniversariantes ${currentYear}`}
        back
        actionAlign="end"
        action={
          count > 0 && (
            <LinkButton icon={<Copy size={16} />} onClick={copyList}>
              Copiar lista
            </LinkButton>
          )
        }
      />

      <ArrowSwitcher
        title={label}
        caption={caption}
        previousLabel="Mês anterior"
        nextLabel="Próximo mês"
        onPrevious={month > 1 ? () => selectMonth(month - 1) : undefined}
        onNext={month < 12 ? () => selectMonth(month + 1) : undefined}
      />

      {loading && <Skeleton $h="240px" />}

      {!loading && !!error && <Empty title={text.feedback.loadError} description={errorMessage(error) ?? ''} />}

      {!loading && !error && count === 0 && (
        <Empty title="Nenhum aniversariante" description={`Nenhum membro faz aniversário em ${label.toLowerCase()}.`} />
      )}

      {!loading && !error && count > 0 && (
        <List>
          {birthdays.map((birthday) => {
            const isToday = isBirthdayToday(birthday.birthDate, today);
            const age = birthdayAgeLabel(birthday.birthDate, currentYear, today);
            return (
              <ListItem key={birthday.personId} $selected={isToday}>
                <RowButton type="button" onClick={() => navigate(`${AppRoute.Members}/${birthday.personId}/ficha`)}>
                  <DateBadge date={birthday.birthDate} strong={isToday} />
                  <ListGrow>
                    <Name>{birthday.name}</Name>
                    {age && <Detail>{age}</Detail>}
                  </ListGrow>
                  {isToday && <TonePill $tone="success">Hoje</TonePill>}
                  <ListChevron />
                </RowButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {toast}
    </div>
  );
}
