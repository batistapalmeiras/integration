export interface StatuteClause {
  label: string;
  text: string;
}

export interface StatuteBlock {
  label?: string;
  text: string;
  clauses?: StatuteClause[];
}

export interface StatuteArticle {
  label: string;
  blocks: StatuteBlock[];
}

export interface StatuteChapter {
  id: string;
  number: string;
  title: string;
  articles: StatuteArticle[];
}

export const STATUTE_CHAPTERS: StatuteChapter[] = [
  {
    id: 'members',
    number: 'Capítulo II',
    title: 'Dos membros, admissão e desligamento',
    articles: [
      {
        label: 'Art. 5º',
        blocks: [
          {
            text: 'A Igreja é constituída por homens e mulheres, sem distinção de idade, sexo (cuja definição sexual seja biologicamente natural), cor, nacionalidade, condição social ou grau de instrução, civilmente capazes, relativamente capazes e absolutamente incapazes que, em conjunto e de forma harmônica, professam a sua fé em Jesus Cristo como único Salvador e Senhor, aceitam a Bíblia Sagrada como a Palavra de Deus e sua regra de fé, a declaração doutrinária da Convenção Batista Brasileira como sua prática que distingue de outras denominações cristãs e, individualmente, a disciplina adotada pela Igreja, sem nenhuma distinção como citadas acima.',
          },
          {
            label: '§ 1º',
            text: 'Não há limitação para o número de membros da Igreja, composta das pessoas físicas observando-se as disposições deste Estatuto e do Manual de Administração Eclesiástica quando houver.',
          },
          {
            label: '§ 2º',
            text: 'Depois de cumpridas as exigências do caput desse artigo, poderão ser membros da Igreja aqueles que por si ou seus representantes, manifestarem sua vontade de forma inequívoca, através de requerimento escrito à Diretoria da Igreja, que encaminhará o desejo da pessoa ao Conselho Administrativo, através de uma das seguintes formas:',
            clauses: [
              {
                label: 'I',
                text: 'Batismo dos candidatos, previamente aprovados, com testemunha(s) de sua mudança de conduta; somente após 3 (três) meses de frequência às atividades da Igreja e, principalmente, a classe de doutrina e integração de membros;',
              },
              {
                label: 'II',
                text: 'Transferência por carta de membros de outras Igrejas da mesma fé e ordem; somente após 3 (três) meses de frequência às atividades da Igreja e, principalmente, a classe de integração de membros ou entrevista com o pastor da Igreja;',
              },
              {
                label: 'III',
                text: 'Reconciliação, de irmãos excluídos ou desligados desta ou de outra Igreja da mesma fé e ordem, cessados os motivos que geraram a exclusão; somente após 6 (seis) meses de frequência às atividades da Igreja e, principalmente, a classe de doutrina e integração de membros e uma entrevista com o Conselho Administrativo;',
              },
              {
                label: 'IV',
                text: 'Aclamação precedida de testemunho público e compromisso quando não houver possibilidade de obtenção de carta de transferência, que ocorrerá somente após 6 (seis) meses de frequência às atividades da Igreja e, principalmente, a classe de doutrina e integração de membros.',
              },
            ],
          },
          {
            label: '§ 3º',
            text: 'O membro não poderá ser representado, perante a Igreja, por procuração, pois sua vinculação obedece aos princípios de fé, exige convicção pessoal e conduta compatível com os ensinos extraídos da Bíblia ministrados aos seus membros.',
          },
        ],
      },
      {
        label: 'Art. 6º',
        blocks: [
          {
            text: 'Não se admite como membro da Igreja qualquer pessoa que viva em adultério, fornicação ou mantenha relacionamento sexual com pessoa do mesmo sexo, por infringir preceitos bíblicos contido nos livros de Gênesis 1:27; Levíticos 18:22; Deuteronômio 22:5; 1 Coríntios 6:9, dentre outros.',
          },
        ],
      },
      {
        label: 'Art. 7º',
        blocks: [
          {
            text: 'O membro da Igreja que descumprir as decisões e violar os preceitos deste Estatuto estará sujeito às seguintes penalidades, aplicados pelo Conselho administrativo da Igreja, sem a necessidade de obediência do caráter progressivo:',
            clauses: [
              { label: 'I', text: 'Advertência;' },
              { label: 'II', text: 'Exoneração dos cargos e funções que exerça por eleição ou nomeação da Igreja;' },
              { label: 'III', text: 'Desligamento do Rol de membros da Igreja.' },
            ],
          },
        ],
      },
      {
        label: 'Art. 8º',
        blocks: [
          {
            text: 'Perde a condição de membro da Igreja aquele que for desligado, nas seguintes hipóteses:',
            clauses: [
              { label: 'I', text: 'Ter solicitado desligamento ou haver falecido;' },
              { label: 'II', text: 'Ser transferido para outra Igreja da mesma fé e ordem;' },
              {
                label: 'III',
                text: 'Ausentar-se dos cultos e deixar de participar das atividades eclesiásticas, por tempo igual e/ou superior a 180 (cento e oitenta) dias, desde que injustificadamente, para caracterizar abandono e desinteresse pela Igreja e pela obra que realiza;',
              },
              {
                label: 'IV',
                text: 'Estar defendendo e professando doutrinas ou práticas que contrariem a Declaração Doutrinária da Convenção Batista Brasileira;',
              },
              {
                label: 'V',
                text: 'Infringir os princípios éticos, morais e da boa conduta defendidos pela Igreja com fundamento na Bíblia Sagrada.',
              },
              { label: 'VI', text: 'Infringir o presente Estatuto e as deliberações da Igreja.' },
              {
                label: 'VII',
                text: 'Comprovadamente, proceder na sua vida particular ou pública de forma contrária aos princípios, ensinos e moral da Bíblia, bem como, de qualquer forma, prejudicar os trabalhos do culto religioso, o nome, a imagem, a dignidade e honra da Igreja e/ou suas doutrinas, bem como de suas organizações futuras, permanecendo no erro após esgotadas todas as medidas necessárias pelos organismos competentes.',
              },
              {
                label: 'VIII',
                text: 'Outros casos não previstos neste estatuto, mediante decisão do Conselho administrativo.',
              },
            ],
          },
          {
            label: '§ 1º',
            text: 'O membro excluído pode, a seu pedido, retornar ao rol de membros, a critério da Igreja, seguindo os critérios do Artigo 5º, §2º, Inciso III.',
          },
          {
            label: '§ 2º',
            text: 'Sob nenhuma alegação, nenhum direito poderá ser concedido àquele que deixar de ser membro da Igreja, extinguindo-se, no ato de desligamento, seja por qual motivo for, a relação jurídica entre as partes, nem restituição pecuniária ou patrimonial poderá ser concedido àquele que deixar de ser membro da Igreja.',
          },
        ],
      },
      {
        label: 'Art. 9º',
        blocks: [
          {
            text: 'Para que o assunto seja tratado, salvaguardando-se a honra da Igreja e do membro incurso no Artigo 8º, quando necessário, será instituída comissão composta por 03 (três) membros, presidida pelo Pastor Titular e nomeada pelo conselho administrativo, sendo ouvidos, quando for o caso, denunciante e denunciado, emitindo-se, ao final, parecer que deverá ser encaminhado ao Conselho Administrativo, que deliberará sobre a exclusão ou não, por maioria simples de votos.',
          },
          {
            label: 'Parágrafo único',
            text: 'Casos especiais e omissos quanto a admissão e desligamento de membros serão decididos pelo Conselho Administrativo por maioria simples de votos.',
          },
        ],
      },
    ],
  },
  {
    id: 'rights',
    number: 'Capítulo III',
    title: 'Dos direitos e deveres dos membros',
    articles: [
      {
        label: 'Art. 10',
        blocks: [
          {
            text: 'A Igreja tem duas categorias de membros: Ativos e Inativos.',
            clauses: [
              {
                label: 'I',
                text: 'Membros ativos são todos os que estão em comunhão com a Igreja, presentes aos cultos e participando do sustento financeiro da Igreja.',
              },
              {
                label: 'II',
                text: 'Será incluído automaticamente no rol de membros inativos, o membro que estiver ausente do convívio e das atividades da Igreja por um período superior a 90 (noventa) dias sem justificativa ao Conselho Administrativo.',
              },
            ],
          },
          {
            label: 'Parágrafo único',
            text: 'A permanência no rol de membros inativos por um período superior a 90 (noventa) dias, ensejará automaticamente no seu desligamento por abandono, sendo necessário, somente, registro na reunião do Conselho Administrativo.',
          },
        ],
      },
      {
        label: 'Art. 11',
        blocks: [
          {
            text: 'Para fins de informação estatística, quórum para tomadas de decisões e participação da estrutura administrativa da Igreja, somente os membros ativos, civilmente capazes, serão considerados.',
          },
          {
            label: 'Parágrafo único',
            text: 'Somente os membros ativos poderão votar e ser votados para os diversos cargos, respeitada a capacidade civil para o exercício das funções.',
          },
        ],
      },
      {
        label: 'Art. 12',
        blocks: [
          {
            text: 'São direitos dos membros ativos civilmente capazes:',
            clauses: [
              { label: 'I', text: 'Participar das atividades da Igreja;' },
              { label: 'II', text: 'Receber assistência espiritual;' },
              {
                label: 'III',
                text: 'Participar da Assembleia Geral, com direito ao uso da palavra e ao exercício do voto;',
              },
              {
                label: 'IV',
                text: 'Votar e ser votado para cargos ou funções, observada a maioridade civil, quando se tratar de eleição da Diretoria Executiva da Igreja;',
              },
            ],
          },
          {
            label: 'Parágrafo único',
            text: 'A qualidade de membro da Igreja é intransmissível sob qualquer alegação, não podendo se fazer substituir nem mesmo por procuração.',
          },
        ],
      },
      {
        label: 'Art. 13',
        blocks: [
          {
            text: 'São deveres dos membros:',
            clauses: [
              {
                label: 'I',
                text: 'Manter uma conduta compatível diante da Igreja e sociedade com os princípios espirituais, éticos e morais, de acordo com os ensinamentos da Bíblia Sagrada;',
              },
              { label: 'II', text: 'Participar das atividades da Igreja; bem como zelar pelo patrimônio da Igreja.' },
              { label: 'III', text: 'Exercitar os dons e talentos de que são dotados;' },
              {
                label: 'IV',
                text: 'Contribuir com dízimos e ofertas, para que a Igreja atinja seus objetivos e cumpra sua missão;',
              },
              { label: 'V', text: 'Exercer com zelo e dedicação os cargos ou funções para os quais forem eleitos;' },
              {
                label: 'VI',
                text: 'Observar o presente Estatuto e decisões dos órgãos administrativos e eclesiásticos nele previstos, zelando por seu cumprimento.',
              },
              {
                label: 'VII',
                text: 'Evitar participação em demandas judiciais contra irmãos da fé, pastores, entidades, instituições ou qualquer órgão denominacional conforme princípios éticos e cristãos determinados na Palavra de Deus em I Coríntios 6:1 a 11.',
              },
              { label: 'VIII', text: 'Não difamar, caluniar e injuriar o bom nome da Igreja, sua liderança e seus membros.' },
              { label: 'IX', text: 'Manter atualizados seus dados cadastrais junto a Igreja.' },
            ],
          },
        ],
      },
    ],
  },
];
