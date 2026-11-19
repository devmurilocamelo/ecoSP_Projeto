# AgilBoard — gestão ágil colaborativa (estilo Jira)

Plataforma web para o time trabalhar com Scrum: **backlog do produto**, **sprints**, **quadro Kanban com arrastar e soltar**, **detalhes da issue com comentários e histórico**, **time** e **relatório de velocidade**. Todos os membros acessam o mesmo projeto e as telas se atualizam sozinhas a cada ~8 s.

**Stack:** Next.js 16 (App Router + Server Actions) · React 19 · Postgres (Neon) · deploy na Vercel.

---

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Backlog** | Lista sprints abertas e o backlog do produto. Criação rápida de issues (tipo, prioridade, story points, responsável), mover issues entre backlog e sprints, criar/editar/iniciar/concluir sprints, busca e filtros. |
| **Quadro da Sprint** | Colunas *A Fazer → Em Andamento → Em Revisão → Concluído*. Arraste os cartões para mudar o status. Filtro por membro, dias restantes e pontos concluídos. |
| **Issue** | Título, descrição (história + critérios de aceite), status, responsável, tipo, prioridade, pontos, sprint. Comentários e histórico de alterações. |
| **Relatórios** | Velocidade média, gráfico comprometido × concluído por sprint e contagem por status. |
| **Time** | Membros, papel (PO, Scrum Master, Dev, QA…) e carga de trabalho. |

Regras: só uma sprint ativa por vez; ao concluir a sprint, as issues não concluídas voltam para o backlog e os pontos ficam registrados para o gráfico de velocidade.

**Acesso:** cada pessoa entra com nome + e-mail + **código do time** (variável `TEAM_ACCESS_CODE`). Quem tem o código acessa tudo — é o modelo "todos têm acesso". As tabelas do banco são criadas automaticamente no primeiro acesso.

---

## Deploy na Vercel (passo a passo)

1. **Suba o código para o GitHub**
   ```bash
   cd agilboard
   git init && git add . && git commit -m "AgilBoard"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/agilboard.git
   git push -u origin main
   ```
2. **Importe na Vercel:** <https://vercel.com/new> → selecione o repositório → *Framework: Next.js* (detectado sozinho). Ainda não clique em Deploy se quiser já configurar tudo — ou faça o deploy e configure depois (passo 5).
3. **Crie o banco:** no projeto da Vercel, aba **Storage → Create Database → Neon (Postgres)** → conecte ao projeto. A Vercel cria a variável `DATABASE_URL` automaticamente (plano gratuito atende bem).
4. **Variáveis de ambiente** (*Settings → Environment Variables*):

   | Nome | Valor |
   |---|---|
   | `TEAM_ACCESS_CODE` | código que o time vai usar para entrar, ex.: `scrum-2026` |
   | `SESSION_SECRET` | texto aleatório longo (gere com `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_PROJECT_NAME` | *(opcional)* nome do projeto, ex.: `AgilBoard` |
   | `NEXT_PUBLIC_PROJECT_KEY` | *(opcional)* sigla das issues, ex.: `AGL` → `AGL-12` |

5. **Deploy:** *Deployments → Redeploy* (para aplicar as variáveis). Compartilhe a URL `https://seu-projeto.vercel.app` e o código do time com a equipe.

> Alternativa pela linha de comando: `npm i -g vercel && vercel` (e `vercel --prod` para produção).

---

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

Sem `DATABASE_URL`, o app usa um Postgres embutido (PGlite) salvo em `./.data` — não precisa instalar nada. Para usar o mesmo banco da produção, crie um `.env.local` com as variáveis do `.env.example` (ou rode `vercel env pull .env.local`).

---

## Estrutura

```
app/
  login/                 tela de entrada
  (app)/layout.js        menu lateral + atualização automática
  (app)/backlog/         backlog e sprints
  (app)/board/           quadro Kanban
  (app)/issues/[id]/     detalhe da issue
  (app)/reports/         relatórios / velocidade
  (app)/team/            membros do time
components/              Board (drag & drop), IssueRow, QuickCreate, badges…
lib/
  db.js                  conexão (Neon na Vercel, PGlite local) + criação das tabelas
  auth.js                sessão em cookie assinado (HMAC)
  actions.js             Server Actions (criar/editar issues, sprints, comentários)
  queries.js             consultas SQL
```

## Próximos passos possíveis

- Login com Microsoft/Google (Auth.js) em vez do código do time
- Vários projetos/boards, épicos com issues filhas, subtarefas e labels
- Gráfico de burndown e notificações por e-mail
- Atualização em tempo real via WebSocket (Pusher/Ably) no lugar do polling
