// React
import { Link } from 'react-router-dom';
// Libs
import { LinkButton } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Components
import { Field, FieldLabel, FieldValue, Panel, PanelHeader, PanelTitle } from '../../../components/Panel';
// Local
import { relationLabel } from '../../../domain/family';
import { Relative } from '../../../repositories/family';
import { AppRoute } from '../../../routes/paths';
import { ChildLinks, RelativeGrid } from '../styles';

interface Props {
  family: Relative[];
  onEdit: () => void;
}

const relativePath = (relative: Relative) => `${AppRoute.Members}/${relative.id}`;

export function FamilyPanel({ family, onEdit }: Props) {
  const spouse = family.find((relative) => relative.relation === 'spouse');
  const children = family.filter((relative) => relative.relation === 'child');
  const others = family.filter((relative) => relative.relation !== 'spouse' && relative.relation !== 'child');

  return (
    <Panel aria-label="Família">
      <PanelHeader>
        <PanelTitle>Família</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <RelativeGrid>
        <Field $wide={false}>
          <FieldLabel>Cônjuge</FieldLabel>
          <FieldValue $empty={!spouse}>{spouse ? <Link to={relativePath(spouse)}>{spouse.name}</Link> : '—'}</FieldValue>
        </Field>
        <Field $wide={false}>
          <FieldLabel>Filhos</FieldLabel>
          {children.length > 0 ? (
            <FieldValue $empty={false}>
              <ChildLinks>
                {children.map((child) => (
                  <li key={child.id}>
                    <Link to={relativePath(child)}>{child.name}</Link>
                  </li>
                ))}
              </ChildLinks>
            </FieldValue>
          ) : (
            <FieldValue $empty>—</FieldValue>
          )}
        </Field>
        {others.map((relative) => (
          <Field key={relative.id} $wide={false}>
            <FieldLabel>{relationLabel(relative.relation, relative.gender)}</FieldLabel>
            <FieldValue $empty={false}>
              <Link to={relativePath(relative)}>{relative.name}</Link>
            </FieldValue>
          </Field>
        ))}
      </RelativeGrid>
    </Panel>
  );
}
