// Libs
import { Card, Typography } from 'bp-kit';
// Local
import { PublicPage } from '../../../components/PublicPage';
import { formatDate } from '../../../domain/dates';
import { MOCK_STORE_ITEMS } from '../mock';
import { ItemImage, ItemList, ItemMeta } from './styles';

export function StorePublicPage() {
  const items = MOCK_STORE_ITEMS.filter((item) => item.active);

  return (
    <PublicPage title="Loja">
      <ItemList>
        {items.map((item) => (
          <Card key={item.id}>
            {item.imageUrls?.[0] && <ItemImage src={item.imageUrls[0]} alt="" />}
            <Typography type="h6">{item.name}</Typography>
            <ItemMeta>
              {item.sizes && <Typography type="caption">Tamanhos: {item.sizes.join(', ')}</Typography>}
              {item.deadline && <Typography type="caption">Disponível até {formatDate(item.deadline)}</Typography>}
            </ItemMeta>
          </Card>
        ))}
      </ItemList>
    </PublicPage>
  );
}
