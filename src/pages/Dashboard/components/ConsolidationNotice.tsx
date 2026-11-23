// Local
import { useConsolidationQueue } from '../../../queries/consolidations';
import { NAV_ITEMS } from '../../../routes/navigation';
import { CardLink, Panel, PanelText, PanelTitle } from '../styles';

export function ConsolidationNotice() {
  const overdue = (useConsolidationQueue().data ?? []).filter((item) => item.overdue).length;
  if (overdue === 0) return null;

  return (
    <Panel aria-labelledby="consolidation">
      <PanelTitle id="consolidation">Consolidação</PanelTitle>
      <PanelText>
        {overdue === 1
          ? 'Passaram 2 meses para 1 pessoa num PG ou ministério. Falta a resposta final.'
          : `Passaram 2 meses para ${overdue} pessoas em PGs e ministérios. Falta a resposta final.`}
      </PanelText>
      <CardLink to={NAV_ITEMS.consolidation.path}>Responder agora</CardLink>
    </Panel>
  );
}
