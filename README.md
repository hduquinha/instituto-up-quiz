# Quiz inteligente - Ansiedade

Aplicação de quiz gamificado com relatório personalizado, captura de contato e painel administrativo protegido por senha. Tudo serverless e pronto para Vercel.

## Recursos

- Quiz de ansiedade com 12 perguntas em passos.
- Resumo imediato e relatório completo enviado para a equipe.
- Página administrativa com senha para ver respostas e baixar relatórios.
- Armazenamento em PostgreSQL.

## Configuração

1. Crie o arquivo .env.local com as variáveis abaixo:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
ADMIN_PASSWORD=defina-uma-senha-forte
```

2. Instale dependências e rode o projeto:

```
npm install
npm run dev
```

## Rotas principais

- / -> página inicial
- /quiz/ansiedade -> quiz de ansiedade
- /quiz -> lista de quizzes
- /admin -> painel administrativo

## Banco de dados

A tabela é criada automaticamente na primeira requisição de API. Se preferir, o esquema é:

```
CREATE TABLE quiz_responses (
	id uuid PRIMARY KEY,
	quiz_id text NOT NULL,
	name text NOT NULL,
	email text,
	phone text,
	answers jsonb NOT NULL,
	score integer NOT NULL,
	level text NOT NULL,
	report text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);
```
