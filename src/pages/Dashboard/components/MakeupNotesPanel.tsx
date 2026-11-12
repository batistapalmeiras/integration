// Components
import { List, ListItem, ListName } from '../../../components/List';
import { MakeupNote } from '../../../domain/lessonMakeups';
// Local
import { Detail, Panel, PanelText, PanelTitle } from '../styles';

export function MakeupNotesPanel({ notes }: { notes: MakeupNote[] }) {
  return (
    <Panel aria-labelledby="makeups">
      <PanelTitle id="makeups">Dúvidas das reposições</PanelTitle>
      <List>
        {notes.map((note) => (
          <ListItem key={`${note.personId}-${note.cohortName}-${note.lessonNumber}`}>
            <ListName>{note.personName}</ListName>
            <Detail>Aula {note.lessonNumber}</Detail>
            <PanelText>{note.notes}</PanelText>
          </ListItem>
        ))}
      </List>
    </Panel>
  );
}
