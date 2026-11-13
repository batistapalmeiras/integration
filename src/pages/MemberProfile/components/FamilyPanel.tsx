// React
import { Link } from 'react-router-dom';
// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Components
import { Field, FieldLabel, FieldValue, Fields, Panel, PanelHeader, PanelTitle } from '../../../components/Panel';
// Local
import { relationLabel } from '../../../domain/family';
import { Relative } from '../../../repositories/family';
import { AppRoute } from '../../../routes/paths';

interface Props {
  family: Relative[];
  onEdit: () => void;
}

export function FamilyPanel({ family, onEdit }: Props) {
  return (
    <Panel aria-label="Família">
      <PanelHeader>
        <PanelTitle>Família</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      {family.length > 0 && (
        <Fields>
          {family.map((relative) => (
            <Field key={relative.id} $wide>
              <FieldLabel>{relationLabel(relative.relation)}</FieldLabel>
              <FieldValue $empty={false}>
                <Link to={`${AppRoute.Members}/${relative.id}`}>{relative.name}</Link>
              </FieldValue>
            </Field>
          ))}
        </Fields>
      )}
    </Panel>
  );
}
