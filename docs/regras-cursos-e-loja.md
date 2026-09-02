# Regras de negócio: Cursos presenciais e Loja/Reservas

> Este documento descreve regras levantadas em conversa com o Pastor/admin
> para uma futura tela de "Reservas" ou "Loja" (nome ainda não definido).
> **Nada disso está implementado.** A ideia combinada é: por enquanto tudo
> fica como MOCK (dados/estado local, sem tabela no Supabase, sem RLS, sem
> persistência real), e este arquivo serve de referência pra quando formos
> implementar de verdade.

## Contexto geral

A tela cobre duas necessidades distintas da igreja, que hoje são
resolvidas com formulários do Google Forms:

1. **Camisas** — a igreja precisa saber quem quer camisas novas (de
   voluntário ou da igreja).
2. **Cursos presenciais** — a igreja precisa de uma lista de quem vai
   participar de cada curso presencial, com contato, pra organização.

Não há problema em tratar as duas coisas na mesma área do admin, mas são
fluxos de dados diferentes (uma reserva de produto vs. uma inscrição em
turma de curso).

## Cursos presenciais

### Tipos de curso são dinâmicos, não uma lista fixa

Os exemplos reais recebidos até agora são "Homem ao Máximo", "Mulher
Única" e "Upgrade" (turmas de 02/2026), mas o próprio Pastor reforçou
duas vezes que isso **pode mudar e podem existir outros** cursos no
futuro. Ou seja: o cadastro de tipo de curso precisa ser
admin-configurável (o admin cria/edita o nome do curso livremente), e
não um enum fixo no código com esses três nomes.

### Dados de cada curso/turma (oferta)

Cada oferta de curso (uma "turma" daquele curso, num determinado
período) tem:

- **Nome do curso**
- **Data de início**
- **Horário**
- **Duração** (em semanas)
- **Valor** — texto livre, não um número. Precisa aceitar anotações
  condicionais dentro do próprio texto, por exemplo:
  `"R$ 60,00 para o casal (se não tiver o livro)"`. Por isso não dá pra
  modelar como campo numérico simples — é uma string.
- **Local**

### Turmas ao longo do ano

Um mesmo curso pode ter várias ofertas/turmas ao longo do ano (por
exemplo, "Homem ao Máximo" pode rodar mais de uma vez). O cadastro
precisa suportar isso: tipo de curso (nome reutilizável) → várias
ofertas (cada uma com sua própria data/horário/turma).

### Modo de inscrição: individual vs. casal

Cada curso é configurado como um dos dois modos abaixo — os campos do
formulário de inscrição mudam de acordo:

**Individual:**
- Nome completo
- E-mail
- CPF
- Telefone (com WhatsApp)

**Casal:**
- Nome completo (Esposa)
- Nome completo (Esposo)
- E-mail (Esposa)
- E-mail (Esposo)
- Telefone com WhatsApp (Esposa)
- Telefone com WhatsApp (Esposo)

Importante: inscrição de casal **não tem campo de CPF** — só a
individual pede CPF.

### Sem controle de pagamento (por enquanto)

O sistema não precisa saber quem pagou ou não. A única finalidade é
dar uma relação de nomes e dados de contato pra organização do curso.
Isso pode mudar no futuro, mas não é escopo agora ("ainda").

## Camisas (Loja/Reservas)

- A igreja precisa saber os nomes de quem quer camisas novas — tanto
  camisa de voluntário quanto camisa da igreja.
- Campos da reserva: **telefone** (identifica a pessoa), **quantidade**
  e **tamanho**.
- **Pendente**: o formulário de referência (Google Forms) que a igreja
  usa hoje pra isso ainda não foi enviado. Este documento deve ser
  revisado quando ele chegar, antes de qualquer implementação.

## Decisões já confirmadas

- Tudo mock por enquanto — sem tabela nova no Supabase, sem RLS, sem
  persistência real. Estado local até decidirmos implementar de
  verdade.
- Nome definitivo da tela ("Reservas" vs "Loja") ainda em aberto.

## Em aberto / próximos passos

- Receber o formulário de referência de Camisas.
- Decidir o nome final da tela/rota.
- Só depois disso: desenhar o modelo de dados real e a UI mock.
