# Padrões do projeto

Convenções já em uso no código. Qualquer tela nova deve seguir a mesma forma.

## 1. Estrutura de pastas por feature

Cada tela vive em `src/pages/<Nome>/`:

```
pages/Volunteers/
├── index.tsx        # página (thin, monta hook + UI)
├── styles.ts         # styled-components locais
├── types.ts           # tipos/interfaces locais
├── domain.ts           # regra de negócio pura, sem estado
├── validators.ts        # schemas zod do form
├── mock.ts               # dados mock (enquanto não há backend)
├── hooks/
│   └── useVolunteers.ts # estado + CRUD da feature
├── components/
│   └── AddVolunteerModal.tsx
└── Detail/                # sub-rota = subpasta, mesmo padrão
    └── index.tsx
```

Fora de `pages/`: `components/` (compartilhado entre features), `domain/`
(regra de negócio compartilhada), `lib/` (integrações externas, ex.
supabase), `routes/` (paths + árvore de rotas), `types/` (enums/tipos
globais). Duas features nunca importam uma da outra — o que é comum sobe
pra raiz.

## 2. Imports

Agrupados por comentário, nesta ordem, alfabético dentro de cada bloco:

```tsx
// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, PageHeader, text } from 'bp-kit';
// Components
import { AppRoute } from '../../routes/paths';
// Local
import { useVolunteers } from './hooks/useVolunteers';
import { Section } from './styles';
```

React (`react`, `react-router-dom`, `react-hook-form`) → Libs (bp-kit,
lucide-react, zod) → Components (outros módulos do app, fora da pasta
atual) → Local (tudo dentro da própria pasta). Bloco vazio simplesmente
não aparece.

## 3. Componentes visuais

Sempre `styled-components` — nunca HTML cru com `style={{}}`. Valores
sempre do tema do bp-kit (`theme.colors`, `theme.spacing`, `theme.rounded`,
`theme.breakpoints`), nunca valor mágico solto. Desktop-first, estreitando
com `@media (max-width: ...)`. Props de estilo dinâmico com prefixo `$`
(`$active`, `$hideOnMobile`).

## 4. bp-kit vs. componente local

bp-kit = genérico, sem lógica da igreja, compartilhado com o cantina
(`Button`, `Form`, `PageHeader`, `ImageUpload`, tema, `useModal`).
`integration/src/components` = específico do domínio da igreja
(`StatusPill`, `Layout`). Mudança de UMA tela nunca vira mudança de
componente compartilhado sem confirmar o alcance antes. Publicar bp-kit:
bump de versão → build → commit+tag+push → `npm install` no integration
→ reiniciar o dev server.

## 5. Hooks

Um hook de feature expõe estado **e** as operações, nunca só o dado cru:

```tsx
export function useStoreItems() {
  const [items, setItems] = useState<StoreItem[]>(MOCK_STORE_ITEMS);
  const addItem = (item: Omit<StoreItem, 'id'>) => { ... };
  return { items, addItem, updateItem, removeItem };
}
```

Nome `use<Coisa>`, mora em `hooks/use<Coisa>.ts`. Contexto compartilhado
entre rotas de uma mesma feature vira `hooks/<Coisa>Provider.tsx` +
`use<Coisa>Ctx()`. Página nunca usa `useState` pra dado de domínio — só
pra UI local. Mock = `useState` seedado de `mock.ts`, tudo em memória.

## 6. Formulários

Sempre React Hook Form + Zod. Schema com mensagens de `text.validation.*`
do bp-kit:

```tsx
const schema = z.object({
  name: z.string().min(1, text.validation.required('o nome')),
});
type FormValues = z.infer<typeof schema>;
```

Inputs recebem `control`+`name` do RHF diretamente. Loading do submit
vem de `formState.isSubmitting`, nunca um `useState` extra.

## 7. Tabelas

Sempre as primitivas de `src/components/Table` (`TableWrapper`, `Table`,
`Tr`, `Th`, `Td`, `RowActions`) — nunca `<table>` do zero. Linha
clicável: `$clickable`. Coluna dispensável no mobile: `$hideOnMobile`.

## 8. Modais e drawers

Sempre `useModal('drawer' | 'modal')` do bp-kit (`open`, `close`,
`modal`). Conteúdo do modal é componente próprio em `components/`,
recebe `close` e um callback (`onSave`) — nunca faz fetch/mutação
sozinho. Confirmação destrutiva: `ModalTitle` + aviso + `ModalActions`
com `Button variant="danger"`.

## 9. Rotas

`routes/paths.ts` — um `enum AppRoute` com todos os caminhos (em
português). `routes/index.tsx` — árvore de `<Route>`, com
`<ProtectedRoute roles={[...]}>` quando restrita a papéis. Uma página
pode responder por duas rotas (ex. mobile vs. desktop). Sub-rotas de
uma feature: `<Route path={...}/*>` + `<Routes>` interno.

## 10. Nomenclatura e idioma

Identificadores de código sempre em inglês; texto de UI sempre em
português. Enum: chave `PascalCase`, valor `snake_case`. Props de
estilo: `$camelCase`. `types.ts` pra interfaces, `enums.ts` pra enums —
nunca misturado com componente.

## 11. Botões (ícone)

Botão de ação (salvar, excluir, logout, copiar link) sempre com ícone
antes do texto: `<Save size={16}/> Salvar`. Botão de navegação pura
(Cancelar, Entrar, voltar) só texto, sem ícone.
