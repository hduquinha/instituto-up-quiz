export type QuizOption = {
  label: string;
  value: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  segment: "base" | "sutil" | "moderado" | "intenso";
  tags: string[];
};

/* ── Perguntas abertas (texto livre) ── */
export type OpenQuizQuestion = {
  id: string;
  text: string;
  placeholder: string;
  tags: string[];
  /** Palavras-chave negativas usadas pelo algoritmo de interpretação */
  negativeKeywords: string[];
  /** Palavras-chave positivas */
  positiveKeywords: string[];
};

export type QuizDefinition = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  hookLine: string;
  urgencyLine: string;
  socialProof: string;
  totalQuestions: number;
  questionPool: QuizQuestion[];
  /** Pool de perguntas abertas (versão escrita) */
  openQuestions?: OpenQuizQuestion[];
};

/* ───────── Opções reutilizáveis ───────── */

const frequencyOptions: QuizOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Às vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Quase sempre", value: 4 },
];

const certaintyOptions: QuizOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Em alguns casos", value: 2 },
  { label: "Na maioria", value: 3 },
  { label: "Quase sempre", value: 4 },
];

const timeToCalmOptions: QuizOption[] = [
  { label: "Até 5 min", value: 0 },
  { label: "5–15 min", value: 1 },
  { label: "15–30 min", value: 2 },
  { label: "30–60 min", value: 3 },
  { label: "Mais de 60 min", value: 4 },
];

const intensityOptions: QuizOption[] = [
  { label: "Nada", value: 0 },
  { label: "Baixo", value: 1 },
  { label: "Médio", value: 2 },
  { label: "Alto", value: 3 },
  { label: "Muito alto", value: 4 },
];

const agreementOptions: QuizOption[] = [
  { label: "Discordo totalmente", value: 0 },
  { label: "Discordo", value: 1 },
  { label: "Neutro", value: 2 },
  { label: "Concordo", value: 3 },
  { label: "Concordo totalmente", value: 4 },
];

/* ═══════════════════════════════════════════════
   QUESTIONÁRIO DE ANSIEDADE  (5 perguntas adaptativas)
   ═══════════════════════════════════════════════ */

const ansiedadeQuiz: QuizDefinition = {
  id: "ansiedade",
  slug: "ansiedade",
  title: "Teste de Ansiedade — Descubra o que você não está vendo",
  subtitle:
    "87% das pessoas descobrem padrões ocultos que afetam sono, foco e decisões.",
  description:
    "Apenas 5 perguntas rápidas. O questionário se adapta às suas respostas e revela o que passa despercebido no dia a dia.",
  hookLine:
    "A maioria das pessoas só percebe a ansiedade quando ela já está no limite. Você vai esperar chegar lá?",
  urgencyLine:
    "⏳ Relatório gratuito disponível por tempo limitado — aproveite agora.",
  socialProof:
    "Mais de 3.200 pessoas já fizeram este questionário e descobriram padrões que ignoravam.",
  totalQuestions: 5,
  questionPool: [
    /* ── base (1ª pergunta sempre) ── */
    {
      id: "ans-base-1",
      text: "Quando algo sai do controle, quanto tempo você leva para se acalmar?",
      options: timeToCalmOptions,
      segment: "base",
      tags: ["controle", "corpo"],
    },
    /* ── sutil ── */
    {
      id: "ans-sutil-1",
      text: "Você sente o corpo cansado no fim do dia mesmo sem esforço físico?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["corpo", "rotina"],
    },
    {
      id: "ans-sutil-2",
      text: "Antes de conversas importantes, você ensaia mentalmente o que vai falar?",
      options: certaintyOptions,
      segment: "sutil",
      tags: ["social", "controle"],
    },
    {
      id: "ans-sutil-3",
      text: "Sua mente fica revisando situações que já passaram?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["foco", "controle"],
    },
    {
      id: "ans-sutil-4",
      text: "Você evita tomar decisões rápidas por medo de errar?",
      options: certaintyOptions,
      segment: "sutil",
      tags: ["controle", "foco"],
    },
    /* ── moderado ── */
    {
      id: "ans-mod-1",
      text: "Você acorda já pensando em tudo que precisa resolver?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["sono", "foco"],
    },
    {
      id: "ans-mod-2",
      text: "Você se irrita quando algo simples foge do plano?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["controle", "corpo"],
    },
    {
      id: "ans-mod-3",
      text: "Lugares cheios geram desconforto mesmo quando está tudo bem?",
      options: certaintyOptions,
      segment: "moderado",
      tags: ["social", "corpo"],
    },
    {
      id: "ans-mod-4",
      text: "Você sente o coração acelerar em situações comuns do dia a dia?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["corpo"],
    },
    /* ── intenso ── */
    {
      id: "ans-int-1",
      text: "Seus pensamentos aceleram a ponto de travar suas decisões?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["foco", "controle"],
    },
    {
      id: "ans-int-2",
      text: "Você tem dificuldade para relaxar mesmo quando tudo está sob controle?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["corpo", "controle"],
    },
    {
      id: "ans-int-3",
      text: "Você já evitou compromissos por receio de não se sentir bem?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["social", "rotina"],
    },
    {
      id: "ans-int-4",
      text: "Você sente um medo ou aperto sem motivo claro?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["corpo"],
    },
  ],
  openQuestions: [
    {
      id: "ans-open-1",
      text: "Descreva como você se sente quando algo inesperado acontece no seu dia.",
      placeholder: "Ex: Fico nervoso, meu coração dispara e não consigo pensar...",
      tags: ["controle", "corpo"],
      negativeKeywords: ["nervoso", "ansioso", "medo", "pânico", "desespero", "trava", "congela", "paralisa", "acelera", "coração", "tremor", "suor", "sufoca", "aperto", "angústia", "descontrole", "irritado", "agitado", "preocupado", "tenso"],
      positiveKeywords: ["calmo", "tranquilo", "respiro", "controle", "equilíbrio", "natural", "lido", "resolvo", "aceito", "normal"],
    },
    {
      id: "ans-open-2",
      text: "Como está a qualidade do seu sono? Descreva uma noite típica.",
      placeholder: "Ex: Demoro para dormir, acordo várias vezes pensando...",
      tags: ["sono", "corpo"],
      negativeKeywords: ["insônia", "acordo", "demoro", "pensando", "ruminando", "pesadelo", "cansado", "exausto", "agitado", "inquieto", "madrugada", "não durmo", "leve", "ruim", "péssimo", "irregular"],
      positiveKeywords: ["bem", "profundo", "descansado", "regular", "rápido", "tranquilo", "sem problemas"],
    },
    {
      id: "ans-open-3",
      text: "Como você reage em situações sociais que exigem sua participação ativa?",
      placeholder: "Ex: Evito falar, fico desconfortável, prefiro não ir...",
      tags: ["social", "controle"],
      negativeKeywords: ["evito", "desconfortável", "medo", "vergonha", "julgamento", "observam", "fujo", "escapo", "não vou", "cancelo", "tenso", "suor", "tremor", "esgota", "drena", "cansativo"],
      positiveKeywords: ["gosto", "natural", "confortável", "tranquilo", "participo", "socializo", "fácil"],
    },
    {
      id: "ans-open-4",
      text: "Descreva o que acontece na sua mente quando você precisa tomar uma decisão importante.",
      placeholder: "Ex: Fico indeciso, penso em todos os cenários ruins...",
      tags: ["foco", "controle"],
      negativeKeywords: ["indeciso", "confuso", "cenários", "medo", "errar", "arrepender", "paraliso", "trava", "demoro", "inseguro", "risco", "catástrofe", "piores", "consequências", "ansioso", "angústia"],
      positiveKeywords: ["analiso", "decido", "confio", "racional", "objetivo", "claro", "seguro", "rápido"],
    },
    {
      id: "ans-open-5",
      text: "Como seu corpo reage em momentos de pressão no trabalho ou na vida pessoal?",
      placeholder: "Ex: Sinto dor de cabeça, aperto no peito, tensão muscular...",
      tags: ["corpo", "rotina"],
      negativeKeywords: ["dor", "cabeça", "peito", "tensão", "muscular", "estômago", "náusea", "tremor", "suor", "falta de ar", "palpitação", "aperto", "enjoo", "formigamento", "tontura", "cansaço", "exaustão", "queda"],
      positiveKeywords: ["normal", "bem", "controlo", "respiro", "tranquilo", "nada", "saudável", "disposto"],
    },
  ],
};

/* ═══════════════════════════════════════════════
   QUESTIONÁRIO DE COMUNICAÇÃO E ORATÓRIA  (5 perguntas adaptativas)
   ═══════════════════════════════════════════════ */

const comunicacaoQuiz: QuizDefinition = {
  id: "comunicacao",
  slug: "comunicacao",
  title: "Teste de Comunicação — Sua voz transmite o que você quer?",
  subtitle:
    "92% dos profissionais subestimam falhas na própria comunicação. Descubra as suas.",
  description:
    "5 perguntas rápidas que revelam pontos cegos na sua oratória, presença e poder de persuasão.",
  hookLine:
    "Você pode estar perdendo oportunidades sem perceber — sua comunicação diz mais do que você imagina.",
  urgencyLine:
    "⏳ Vagas limitadas para o relatório personalizado gratuito. Não perca.",
  socialProof:
    "Mais de 2.800 profissionais já identificaram falhas invisíveis na sua comunicação.",
  totalQuestions: 5,
  questionPool: [
    /* ── base (1ª pergunta sempre) ── */
    {
      id: "com-base-1",
      text: "Quando você fala em público ou em reuniões, sente que as pessoas realmente prestam atenção?",
      options: certaintyOptions,
      segment: "base",
      tags: ["presenca", "impacto"],
    },
    /* ── sutil ── */
    {
      id: "com-sutil-1",
      text: "Você percebe que perde o fio da ideia no meio de uma explicação?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["clareza", "estrutura"],
    },
    {
      id: "com-sutil-2",
      text: "Antes de apresentações, você sente insegurança sobre o que vai dizer?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["confianca", "preparo"],
    },
    {
      id: "com-sutil-3",
      text: "As pessoas pedem para você repetir ou explicar melhor o que disse?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["clareza", "impacto"],
    },
    {
      id: "com-sutil-4",
      text: "Você evita situações onde precisa falar na frente de outros?",
      options: certaintyOptions,
      segment: "sutil",
      tags: ["confianca", "presenca"],
    },
    /* ── moderado ── */
    {
      id: "com-mod-1",
      text: "Sua voz treme, fica baixa ou acelerada quando o assunto é importante?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["voz", "confianca"],
    },
    {
      id: "com-mod-2",
      text: "Você sente que não consegue convencer as pessoas mesmo tendo razão?",
      options: certaintyOptions,
      segment: "moderado",
      tags: ["persuasao", "impacto"],
    },
    {
      id: "com-mod-3",
      text: "Após uma conversa importante, você fica remoendo o que deveria ter dito?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["preparo", "confianca"],
    },
    {
      id: "com-mod-4",
      text: "Você tem dificuldade de manter contato visual ao falar com alguém?",
      options: certaintyOptions,
      segment: "moderado",
      tags: ["presenca", "voz"],
    },
    /* ── intenso ── */
    {
      id: "com-int-1",
      text: "Você já perdeu oportunidades profissionais por não saber se posicionar verbalmente?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["impacto", "persuasao"],
    },
    {
      id: "com-int-2",
      text: "Pessoas menos preparadas que você acabam sendo mais ouvidas em reuniões?",
      options: certaintyOptions,
      segment: "intenso",
      tags: ["presenca", "persuasao"],
    },
    {
      id: "com-int-3",
      text: "Você sente que sua comunicação limita seu crescimento profissional?",
      options: agreementOptions,
      segment: "intenso",
      tags: ["impacto", "confianca"],
    },
    {
      id: "com-int-4",
      text: "Quando precisa improvisar uma fala, você trava ou fica em branco?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["estrutura", "confianca"],
    },
  ],
  openQuestions: [
    {
      id: "com-open-1",
      text: "Descreva como você se sente quando precisa falar em público ou em uma reunião importante.",
      placeholder: "Ex: Fico nervoso, minha voz falha, esqueço o que ia dizer...",
      tags: ["confianca", "presenca"],
      negativeKeywords: ["nervoso", "medo", "trava", "branco", "esquece", "embaraço", "vergonha", "ansioso", "tremo", "suor", "voz falha", "gaguejo", "inseguro", "evito", "pânico", "desconfortável", "fraco"],
      positiveKeywords: ["confiante", "natural", "fluente", "preparo", "tranquilo", "gosto", "domino", "seguro"],
    },
    {
      id: "com-open-2",
      text: "Como as pessoas costumam reagir quando você apresenta uma ideia? Descreva.",
      placeholder: "Ex: Pedem para repetir, parecem desinteressadas, não entendem...",
      tags: ["clareza", "impacto"],
      negativeKeywords: ["repetir", "desinteresse", "confuso", "não entendem", "perdem", "dispersam", "ignoram", "interrompem", "mudam de assunto", "dúvida", "perdido", "complicado", "longo", "enrolado"],
      positiveKeywords: ["entendem", "concordam", "interessam", "atenção", "claro", "direto", "engajam", "elogiam"],
    },
    {
      id: "com-open-3",
      text: "Descreva uma situação em que você precisou convencer alguém e como foi o resultado.",
      placeholder: "Ex: Tentei argumentar mas a pessoa não me ouviu, não soube me posicionar...",
      tags: ["persuasao", "impacto"],
      negativeKeywords: ["não ouviu", "não convenci", "perdeu", "fracassou", "fraco", "desistiu", "não consegui", "ignorou", "rejeitou", "dificuldade", "inseguro", "posicionar", "argumentar"],
      positiveKeywords: ["convenci", "aceitou", "concordou", "influenciei", "consegui", "persuadi", "resultado"],
    },
    {
      id: "com-open-4",
      text: "Como você se prepara antes de uma apresentação ou conversa importante?",
      placeholder: "Ex: Não me preparo muito, fico ansioso pensando no que pode dar errado...",
      tags: ["preparo", "estrutura"],
      negativeKeywords: ["não preparo", "improviso", "ansioso", "medo", "errado", "esqueço", "desorganizado", "última hora", "atrasado", "caótico", "sem estrutura", "não planejo", "confuso"],
      positiveKeywords: ["pesquiso", "organizo", "estruturo", "ensaio", "preparo", "roteiro", "planejado", "treino"],
    },
    {
      id: "com-open-5",
      text: "Descreva como sua voz e postura se comportam quando você está sob pressão ao falar.",
      placeholder: "Ex: Minha voz fica baixa, falo rápido demais, cruzo os braços...",
      tags: ["voz", "presenca"],
      negativeKeywords: ["baixa", "rápido", "tremo", "gaguejo", "cruzo", "encolho", "desvio olhar", "inseguro", "monótono", "fraco", "sem energia", "cansado", "tenso", "rígido", "fechado"],
      positiveKeywords: ["firme", "claro", "forte", "confiante", "aberto", "contato visual", "pausas", "natural"],
    },
  ],
};

/* ═══════════════════════════════════════════════
   QUESTIONÁRIO DE VENDAS  (5 perguntas adaptativas)
   ═══════════════════════════════════════════════ */

const vendasQuiz: QuizDefinition = {
  id: "vendas",
  slug: "vendas",
  title: "Teste de Vendas — Você está deixando dinheiro na mesa?",
  subtitle:
    "94% dos vendedores cometem erros que custam até 40% do faturamento sem perceber.",
  description:
    "5 perguntas rápidas que expõem os gargalos ocultos no seu processo de vendas e negociação.",
  hookLine:
    "Se você acha que vende bem, este teste vai te mostrar exatamente onde está perdendo dinheiro.",
  urgencyLine:
    "⏳ Diagnóstico gratuito disponível por tempo limitado — descubra seus gaps agora.",
  socialProof:
    "Mais de 4.100 profissionais já identificaram falhas invisíveis que travavam suas vendas.",
  totalQuestions: 5,
  questionPool: [
    /* ── base (1ª pergunta sempre) ── */
    {
      id: "ven-base-1",
      text: "Quando um cliente diz 'vou pensar', você sabe exatamente o que fazer para reverter?",
      options: certaintyOptions,
      segment: "base",
      tags: ["objecao", "fechamento"],
    },
    /* ── sutil ── */
    {
      id: "ven-sutil-1",
      text: "Você consegue identificar o real motivo de compra do cliente nos primeiros minutos?",
      options: certaintyOptions,
      segment: "sutil",
      tags: ["diagnostico", "escuta"],
    },
    {
      id: "ven-sutil-2",
      text: "Seus clientes costumam pedir desconto antes de você apresentar o valor completo?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["valor", "posicionamento"],
    },
    {
      id: "ven-sutil-3",
      text: "Você segue um processo estruturado de vendas ou depende mais da intuição?",
      options: agreementOptions,
      segment: "sutil",
      tags: ["processo", "consistencia"],
    },
    {
      id: "ven-sutil-4",
      text: "Com que frequência você perde vendas que pareciam certas?",
      options: frequencyOptions,
      segment: "sutil",
      tags: ["fechamento", "diagnostico"],
    },
    /* ── moderado ── */
    {
      id: "ven-mod-1",
      text: "Você sente desconforto ao falar de preço ou pedir o fechamento?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["fechamento", "mentalidade"],
    },
    {
      id: "ven-mod-2",
      text: "Seus clientes comparam você com concorrentes mais baratos com frequência?",
      options: frequencyOptions,
      segment: "moderado",
      tags: ["valor", "posicionamento"],
    },
    {
      id: "ven-mod-3",
      text: "Depois de uma reunião de vendas, você sabe dizer qual foi o erro se não fechou?",
      options: certaintyOptions,
      segment: "moderado",
      tags: ["processo", "diagnostico"],
    },
    {
      id: "ven-mod-4",
      text: "Você depende de poucos clientes grandes em vez de ter uma base diversificada?",
      options: agreementOptions,
      segment: "moderado",
      tags: ["consistencia", "prospecção"],
    },
    /* ── intenso ── */
    {
      id: "ven-int-1",
      text: "Você já baixou seu preço só para não perder a venda, mesmo sabendo que não deveria?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["valor", "mentalidade"],
    },
    {
      id: "ven-int-2",
      text: "Suas metas de vendas estão estagnadas ou caindo nos últimos meses?",
      options: agreementOptions,
      segment: "intenso",
      tags: ["consistencia", "processo"],
    },
    {
      id: "ven-int-3",
      text: "Você sente que trabalha muito mas o resultado financeiro não acompanha o esforço?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["mentalidade", "prospecção"],
    },
    {
      id: "ven-int-4",
      text: "Clientes que demonstraram interesse somem sem dar retorno depois do primeiro contato?",
      options: frequencyOptions,
      segment: "intenso",
      tags: ["objecao", "fechamento"],
    },
  ],
  openQuestions: [
    {
      id: "ven-open-1",
      text: "Descreva o que acontece quando um cliente diz que precisa pensar antes de fechar.",
      placeholder: "Ex: Aceito e espero ele voltar, não sei o que fazer...",
      tags: ["objecao", "fechamento"],
      negativeKeywords: ["aceito", "espero", "não sei", "perco", "desisto", "voltar", "ligação", "insisto", "pressiono", "desconto", "nervoso", "frustrado", "impotente", "medo", "desconfortável"],
      positiveKeywords: ["pergunto", "investigo", "entendo", "contorno", "técnica", "agendo", "acompanho", "processo"],
    },
    {
      id: "ven-open-2",
      text: "Como você identifica o que o cliente realmente precisa antes de oferecer sua solução?",
      placeholder: "Ex: Já apresento meu produto direto, não faço muitas perguntas...",
      tags: ["diagnostico", "escuta"],
      negativeKeywords: ["direto", "não pergunto", "apresento", "adivinhar", "assumo", "acho", "intuição", "rapidez", "pulo", "ignoro", "não escuto", "falo mais"],
      positiveKeywords: ["pergunto", "escuto", "investigo", "diagnóstico", "necessidade", "dor", "mapeio", "entendo"],
    },
    {
      id: "ven-open-3",
      text: "Descreva como você apresenta o preço do seu produto ou serviço ao cliente.",
      placeholder: "Ex: Falo o preço e espero a reação, fico desconfortável...",
      tags: ["valor", "posicionamento"],
      negativeKeywords: ["desconfortável", "medo", "espero", "reação", "desconto", "barato", "caro", "justificar", "nervoso", "baixo", "preço", "comparação", "concorrente", "inseguro"],
      positiveKeywords: ["valor", "resultado", "transformação", "investimento", "confiante", "ancoro", "comparo", "benefício"],
    },
    {
      id: "ven-open-4",
      text: "Descreva como é o seu processo de vendas desde o primeiro contato até o fechamento.",
      placeholder: "Ex: Não tenho processo definido, depende do cliente...",
      tags: ["processo", "consistencia"],
      negativeKeywords: ["não tenho", "depende", "improviso", "diferente", "cada caso", "sorte", "aleatório", "sem padrão", "confuso", "desorganizado", "informal", "intuitivo", "acaso"],
      positiveKeywords: ["etapas", "funil", "processo", "script", "padrão", "métricas", "acompanho", "estruturado", "definido"],
    },
    {
      id: "ven-open-5",
      text: "Como você se sente quando precisa prospectar novos clientes ou iniciar contatos frios?",
      placeholder: "Ex: Evito prospectar, não gosto de ligar para desconhecidos...",
      tags: ["mentalidade", "prospeccao"],
      negativeKeywords: ["evito", "não gosto", "medo", "rejeição", "desconfortável", "vergonha", "difícil", "chato", "cansativo", "esgota", "procrastino", "adio", "ansioso", "incomoda", "constrangimento"],
      positiveKeywords: ["gosto", "natural", "rotina", "disciplina", "prospecção", "oportunidade", "confiante", "motivado"],
    },
  ],
};

/* ───────── Exportações ───────── */

const quizzes = [ansiedadeQuiz, comunicacaoQuiz, vendasQuiz];

export const getQuizBySlug = (slug: string) =>
  quizzes.find((quiz) => quiz.slug === slug);

export const getQuizById = (id: string) =>
  quizzes.find((quiz) => quiz.id === id);

export const getAllQuizzes = () => quizzes;
