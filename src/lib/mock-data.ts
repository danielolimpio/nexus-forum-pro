export type Category = {
  slug: string;
  name: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  { slug: "tecnologia", name: "Tecnologia", description: "Software, hardware, IA e dev" },
  { slug: "negocios", name: "Negócios & Finanças", description: "Mercado, investimentos, gestão" },
  { slug: "ciencia", name: "Ciência", description: "Pesquisa, descobertas e debate" },
  { slug: "educacao", name: "Educação & Carreira", description: "Estudos, concursos, trajetória" },
  { slug: "saude", name: "Saúde & Bem-estar", description: "Medicina, hábitos, longevidade" },
  { slug: "direito", name: "Direito & Política", description: "Legislação, instituições" },
  { slug: "cultura", name: "Cultura & Sociedade", description: "Filosofia, história, debate" },
  { slug: "criativo", name: "Indústria Criativa", description: "Design, escrita, mídia" },
  { slug: "engenharia", name: "Engenharia", description: "Civil, mecânica, elétrica" },
  { slug: "marketing", name: "Marketing & Vendas", description: "Crescimento e mercado" },
  { slug: "produtividade", name: "Produtividade", description: "Métodos, ferramentas, foco" },
  { slug: "lifestyle", name: "Estilo de Vida", description: "Hábitos, finanças pessoais" },
];

export type Group = {
  slug: string;
  name: string;
  members: number;
  category: string;
  visibility: "public" | "private";
};

export const GROUPS: Group[] = [
  { slug: "engenharia-software", name: "Engenharia de Software", members: 12840, category: "tecnologia", visibility: "public" },
  { slug: "renda-variavel", name: "Renda Variável BR", members: 9420, category: "negocios", visibility: "public" },
  { slug: "ia-aplicada", name: "IA Aplicada", members: 7610, category: "tecnologia", visibility: "public" },
  { slug: "direito-tributario", name: "Direito Tributário", members: 3210, category: "direito", visibility: "private" },
  { slug: "carreira-tech", name: "Carreira em Tech", members: 5400, category: "educacao", visibility: "public" },
  { slug: "longevidade", name: "Longevidade & Saúde", members: 2890, category: "saude", visibility: "public" },
];

export type Post = {
  id: string;
  title: string;
  group: string;
  author: string;
  createdAt: string;
  excerpt: string;
  replies: number;
  upvotes: number;
  keyword: string;
};

export const POSTS: Post[] = [
  {
    id: "1",
    title: "Qual a arquitetura ideal para um SaaS B2B em estágio inicial?",
    group: "engenharia-software",
    author: "marina.alves",
    createdAt: "há 2 h",
    excerpt:
      "Estou avaliando começar com modular monolith antes de partir para microsserviços. Quais critérios objetivos vocês usam para tomar essa decisão em times pequenos?",
    replies: 38,
    upvotes: 214,
    keyword: "arquitetura saas b2b inicial",
  },
  {
    id: "2",
    title: "Como interpretar o resultado trimestral antes de aumentar posição?",
    group: "renda-variavel",
    author: "rafael.duarte",
    createdAt: "há 4 h",
    excerpt:
      "Tenho me concentrado em margem operacional e geração de caixa livre. Que outras métricas vocês consideram inegociáveis na leitura de um ITR?",
    replies: 22,
    upvotes: 156,
    keyword: "leitura resultado trimestral itr",
  },
  {
    id: "3",
    title: "Fine-tuning vs RAG para conhecimento corporativo restrito",
    group: "ia-aplicada",
    author: "joao.pq",
    createdAt: "há 7 h",
    excerpt:
      "Equipe pequena, base documental de ~40k páginas, atualizada semanalmente. Faz sentido investir tempo em fine-tuning ou RAG bem indexado resolve?",
    replies: 51,
    upvotes: 302,
    keyword: "fine-tuning rag conhecimento corporativo",
  },
  {
    id: "4",
    title: "Roteiro de estudos para transição de carreira para dados",
    group: "carreira-tech",
    author: "luiza.m",
    createdAt: "há 1 d",
    excerpt:
      "Background em administração. Quero um plano realista de 12 meses cobrindo SQL, Python, estatística e portfólio. Aceito críticas duras.",
    replies: 64,
    upvotes: 480,
    keyword: "transicao carreira dados",
  },
  {
    id: "5",
    title: "Protocolos de sono que efetivamente moveram o ponteiro",
    group: "longevidade",
    author: "andre.s",
    createdAt: "há 1 d",
    excerpt:
      "Tirando o óbvio (horário fixo, sem cafeína à tarde), o que de fato mudou a qualidade do seu sono nos últimos 12 meses?",
    replies: 29,
    upvotes: 198,
    keyword: "protocolos sono qualidade",
  },
];

export const TRENDING_KEYWORDS = [
  "arquitetura saas b2b inicial",
  "leitura resultado trimestral itr",
  "fine-tuning rag conhecimento corporativo",
  "transicao carreira dados",
  "protocolos sono qualidade",
  "valuation empresa pre-receita",
  "gestao tempo deep work",
  "reforma tributaria impacto pj",
];

// Threaded discussion sample
export type Reply = {
  id: string;
  author: string;
  createdAt: string;
  body: string;
  upvotes: number;
  children?: Reply[];
};

export const SAMPLE_THREAD: Reply[] = [
  {
    id: "r1",
    author: "carlos.eng",
    createdAt: "há 1 h",
    upvotes: 84,
    body:
      "Para times de até 8 engenheiros, modular monolith quase sempre vence. O custo cognitivo de orquestração de microsserviços só compensa quando há limites de domínio claros e times independentes.",
    children: [
      {
        id: "r1-1",
        author: "marina.alves",
        createdAt: "há 50 min",
        upvotes: 22,
        body:
          "Faz sentido. E como você define o momento de extrair um módulo? Tem algum gatilho objetivo — número de deploys, tamanho do time, latência?",
        children: [
          {
            id: "r1-1-1",
            author: "carlos.eng",
            createdAt: "há 30 min",
            upvotes: 11,
            body:
              "Três sinais: (1) ciclos de deploy independentes desejados, (2) requisitos de escala muito assimétricos, (3) ownership real por outro time. Sem pelo menos dois, mantenho dentro do monolito.",
          },
        ],
      },
    ],
  },
  {
    id: "r2",
    author: "paula.dev",
    createdAt: "há 2 h",
    upvotes: 41,
    body:
      "Recomendo desenhar contratos internos como se já fossem serviços — interfaces explícitas, sem acoplamento a tabelas alheias. Isso facilita a extração futura sem pagar o custo antes da hora.",
  },
];
