# Questionários Inteligentes - Instituto UP

Aplicação de questionários adaptativos com relatório personalizado, captura de contato e painel administrativo protegido por senha. Tudo serverless e pronto para Vercel.

## Recursos

- Questionário de ansiedade com 5 perguntas adaptativas.
- Questionário de comunicação e oratória com 5 perguntas adaptativas.
- Motor adaptativo que seleciona perguntas com base nas respostas anteriores.
- Resumo imediato e relatório completo enviado por WhatsApp.
- Página administrativa com senha para ver respostas e baixar relatórios em PDF.
- Armazenamento em PostgreSQL.

## Configuração

1. Crie o arquivo .env.local com as variáveis abaixo:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
DATABASE_CA_CERT=
ADMIN_PASSWORD=defina-uma-senha-forte
```

2. Instale dependências e rode o projeto:

```
npm install
npm run dev
```

## Rotas principais

- / -> página inicial
- /questionario/ansiedade -> questionário de ansiedade
- /questionario/comunicacao -> questionário de comunicação e oratória
- /questionario/vendas -> questionário de vendas e negociação
- /questionario -> lista de questionários
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
