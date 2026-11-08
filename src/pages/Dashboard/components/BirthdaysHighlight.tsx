// Libs
import { Skeleton, text } from 'bp-kit';
// Components
import { DateBadge } from '../../../components/DateBadge';
import {
  birthdayAgeLabel,
  birthdayMonth,
  birthdaysInMonth,
  isBirthdayToday,
  MemberBirthday,
  upcomingBirthdaysThisMonth,
} from '../../../domain/birthdays';
import { monthName, todayKey, weekdayLabel } from '../../../domain/dates';
import { useMemberBirthdays } from '../../../queries/person';
import { NAV_ITEMS } from '../../../routes/navigation';
// Local
import {
  AgendaItem,
  AgendaList,
  AgendaTitle,
  BirthdayHeading,
  BirthdaysPanel,
  CardLink,
  Detail,
  PanelText,
  PanelTitle,
} from '../styles';

const UPCOMING_BIRTHDAYS_LIMIT = 5;

function birthdayDetail(birthday: MemberBirthday, today: string): string {
  const day = isBirthdayToday(birthday.birthDate, today)
    ? 'Hoje'
    : weekdayLabel(`${today.slice(0, 4)}${birthday.birthDate.slice(4)}`);
  const age = birthdayAgeLabel(birthday.birthDate, Number(today.slice(0, 4)), today);
  return age ? `${day} · ${age.toLowerCase()}` : day;
}

export function BirthdaysHighlight() {
  const { data, loading, error } = useMemberBirthdays();
  const today = todayKey();
  const month = monthName(birthdayMonth(today)).toLowerCase();
  const monthTotal = birthdaysInMonth(data ?? [], birthdayMonth(today)).length;
  const upcoming = upcomingBirthdaysThisMonth(data ?? [], today);
  const shown = upcoming.slice(0, UPCOMING_BIRTHDAYS_LIMIT);

  return (
    <BirthdaysPanel aria-labelledby="birthdays">
      <BirthdayHeading>
        <PanelTitle id="birthdays">Aniversariantes de {month}</PanelTitle>
        {monthTotal > 0 && <CardLink to={NAV_ITEMS.birthdays.path}>Ver todos os {monthTotal}</CardLink>}
      </BirthdayHeading>
      {loading && <Skeleton $h="120px" />}
      {!loading && !!error && <PanelText>{text.feedback.loadError}</PanelText>}
      {!loading && !error && monthTotal === 0 && <PanelText>Nenhum membro faz aniversário em {month}.</PanelText>}
      {!loading && !error && monthTotal > 0 && upcoming.length === 0 && (
        <PanelText>Os aniversários de {month} já passaram.</PanelText>
      )}
      {shown.length > 0 && (
        <AgendaList>
          {shown.map((birthday) => (
            <AgendaItem key={birthday.personId}>
              <DateBadge date={birthday.birthDate} strong={isBirthdayToday(birthday.birthDate, today)} />
              <span>
                <AgendaTitle>{birthday.name}</AgendaTitle>
                <Detail>{birthdayDetail(birthday, today)}</Detail>
              </span>
            </AgendaItem>
          ))}
        </AgendaList>
      )}
    </BirthdaysPanel>
  );
}
