// Carga inicial do plano EcoSP (Módulo C – Back-end e Módulo E – Front-end).
// Roda uma única vez por banco: a linha em `seeds` funciona como trava, então
// mesmo com várias instâncias da Vercel subindo juntas só uma aplica o plano.
import "server-only";

const SEED = "ecosp-plano-v1";

// Membros do time. Quem já existe é encontrado pelo nome (sem diferenciar maiúsculas).
const TEAM = [
  {
    key: "murilo", name: "Murilo Camelo", email: "murilo@ecosp.com", role: "Tech Lead",
    responsibilities: [
      "Tech Lead do projeto EcoSP — tarefas mais complexas e revisão de código do time.",
      "BACK-END: estrutura da API (roteamento, conexão MySQL ecosp_db, respostas JSON) e POST /api/schedules (validações, cálculo de EcoPoints e protocolo).",
      "FRONT-END: arquitetura da SPA e navegação (header + bottom nav) e fluxo de resgate da tela de Recompensas.",
      "Apoia: Vinicius (extrato/saldo) e Adolfo (upload de foto).",
    ].join("\n"),
  },
  {
    key: "vinicius", name: "Vinicius Barros", email: "vinicius.barros@ecosp.com", role: "Desenvolvedor",
    responsibilities: [
      "BACK-END: GET /api/schedules/citizen/{email} — histórico, saldo de EcoPoints e kg reciclados.",
      "FRONT-END: tela de Extrato de Pontos (saldo, nível, meta mensal, impacto ambiental e tabela de histórico) e dados mock compartilhados.",
      "Par de aprendizado: Murilo.",
    ].join("\n"),
  },
  {
    key: "adolfo", name: "Adolfo Leon", email: "adolfo.leon@ecosp.com", role: "Desenvolvedor",
    responsibilities: [
      "BACK-END: POST /api/schedules/upload-photo (multipart, pasta uploads/, photo_path no MySQL).",
      "FRONT-END: tela Início e responsividade + acessibilidade (375px, ≥1024px, foco, aria, 44px).",
      "Par de aprendizado: Murilo.",
    ].join("\n"),
  },
  {
    key: "henrique", name: "Henrique", email: "henrique@ecosp.com", role: "Desenvolvedor",
    responsibilities: [
      "BACK-END: banco ecosp_db com schema_inicial.sql, README.md e testes de todas as rotas da API.",
      "FRONT-END: Splash Screen de 3 s e microinterações dos cards (entrada escalonada e hover).",
    ].join("\n"),
  },
  {
    key: "caetano", name: "Caetano Neto", email: "caetano.neto@ecosp.com", role: "Desenvolvedor",
    responsibilities: [
      "BACK-END: GET /api/ecopoints com filtros category_id e neighborhood + accepted_categories.",
      "FRONT-END: tela de Ecopontos (cards, badges de materiais e filtro por pills).",
    ].join("\n"),
  },
  {
    key: "sofia", name: "Sofia Pontes", email: "sofia.pontes@ecosp.com", role: "Desenvolvedor",
    responsibilities: [
      "BACK-END: GET /api/categories.",
      "FRONT-END: design tokens + tema Dark/Light com persistência e modal de Newsletter aos 20 s.",
    ].join("\n"),
  },
];

const BACK = "Sprint 1 · Módulo C — EcoSP Core API (Back-end)";
const FRONT = "Sprint 2 · Módulo E — EcoSP Totem & App (Front-end)";

// [sprint, dono, tipo, prioridade, pontos, título, descrição]
const ISSUES = [
  // ---------- Módulo C · Back-end ----------
  [BACK, "murilo", "task", "highest", 5, "[API] Estrutura da API: roteamento, conexão MySQL e respostas JSON",
    `Base que todo o time vai usar.

Critérios de aceite:
- API acessível em /XXX_modulo_c/api/
- Conexão única com o banco MySQL ecosp_db (nada de SQLite ou memória)
- Roteador para GET/POST com rotas /api/categories, /api/ecopoints, /api/schedules...
- Helper de resposta JSON com status HTTP correto (200, 201, 404, 422) e Content-Type application/json
- Documentar no README como criar uma rota nova (para o time aprender)`],
  [BACK, "henrique", "task", "highest", 2, "[API] Banco ecosp_db com schema_inicial.sql + README.md",
    `Critérios de aceite:
- Criar o banco ecosp_db no MySQL e importar schema_inicial.sql (arquivos de apoio)
- Conferir tabelas, chaves e dados iniciais (categorias e ecopontos)
- README.md na raiz com: requisitos, como importar o banco, configurar conexão e rodar a API`],
  [BACK, "sofia", "story", "high", 2, "[API] GET /api/categories",
    `Retorna todas as categorias com a pontuação por quilo.

Critérios de aceite:
- 200 OK com array JSON
- Campos: id, name, slug, points_per_kg, icon_name
- Ex.: { "id": 1, "name": "Plásticos e Garrafas PET", "slug": "plasticos", "points_per_kg": 15, "icon_name": "plastic" }`],
  [BACK, "caetano", "story", "high", 5, "[API] GET /api/ecopoints com filtros",
    `Lista os ecopontos da cidade.

Critérios de aceite:
- 200 OK com array JSON
- Cada ecoponto traz accepted_categories (materiais aceitos)
- Filtro opcional ?category_id= → só ecopontos que recolhem a categoria
- Filtro opcional ?neighborhood= → bairro contém o termo (LIKE)
- Os dois filtros funcionam juntos`],
  [BACK, "murilo", "story", "highest", 8, "[API] POST /api/schedules — validações, EcoPoints e protocolo",
    `Agendamento de descarte (a regra de negócio principal).

Payload: citizen_name, citizen_email, ecopoint_id, category_id, weight_kg, scheduled_date

Critérios de aceite:
- Todos os campos obrigatórios
- E-mail com formato válido
- weight_kg <= 0 → HTTP 422
- scheduled_date não pode ser anterior a hoje
- O ecoponto precisa aceitar a categoria; senão, erro explicativo
- ecopoints_earned = round(weight_kg * points_per_kg)
- Protocolo único ECO-2026-XXXXX (alfanumérico aleatório, checar duplicidade)
- Gravar no MySQL com status "Pendente"
- 201 Created com dados do agendamento, protocolo e pontuação`],
  [BACK, "adolfo", "story", "medium", 5, "[API] POST /api/schedules/upload-photo",
    `Upload simplificado da foto do resíduo (multipart).

Critérios de aceite:
- Campos: protocol e photo
- Protocolo inexistente → 404 Not Found
- Salvar em uploads/ mantendo o nome original (sem subpastas, sem renomear)
- Atualizar photo_path no MySQL (ex.: uploads/foto_residuo.png)
- 201 Created: { "message": "Foto do resíduo vinculada com sucesso ao agendamento!", "protocol": "...", "photo_path": "uploads/..." }`],
  [BACK, "vinicius", "story", "high", 5, "[API] GET /api/schedules/citizen/{email} — histórico e saldo",
    `Critérios de aceite:
- Busca todos os agendamentos do e-mail
- Retorna citizen_email, citizen_name, total_ecopoints, total_weight_recycled_kg, schedules_count
- history[]: protocol, ecopoint_name, category_name, weight_kg, ecopoints_earned, scheduled_date, status, photo_path
- Sem histórico → 404 com JSON e mensagem informativa`],
  [BACK, "henrique", "task", "medium", 3, "[API] Testes de todas as rotas (Postman/Insomnia)",
    `Critérios de aceite:
- Coleção com todas as rotas e exemplos de payload
- Casos de erro: campo faltando, e-mail inválido, peso 0 (422), data passada, ecoponto incompatível, protocolo inexistente (404), cidadão sem histórico (404)
- Registrar bugs encontrados como issues no AgilBoard`],

  // ---------- Módulo E · Front-end ----------
  [FRONT, "murilo", "task", "highest", 8, "[UI] Arquitetura da SPA + navegação header/bottom nav",
    `Critérios de aceite:
- Estrutura modular (HTML, CSS e JS separados), acessível em /XXX_modulo_e/
- HTML5 semântico: header, nav, main, section, article, aside, table
- Troca entre Início, Ecopontos, Extrato e Recompensas sem recarregar a página
- Menu do header (desktop) e bottom nav (mobile) sincronizados
- Botões de CTA da tela Início levam direto à tela interna
- Estado global simples (saldo, histórico) compartilhado entre as telas`],
  [FRONT, "sofia", "task", "highest", 3, "[UI] Design tokens + tema Dark/Light com persistência",
    `Critérios de aceite:
- Tokens centralizados (CSS custom properties): primária, superfícies, bordas, sombras e textos
- Botão de alternar tema no header
- Transição suave de cores em todos os componentes
- Preferência salva no localStorage e mantida ao recarregar`],
  [FRONT, "henrique", "story", "high", 3, "[UI] Splash Screen de 3 segundos",
    `Critérios de aceite:
- Tela cheia cobrindo a janela ao carregar
- Logo EcoSP com animação de pulso + rotação suave
- Título "EcoSP Experience" com gradiente e subtítulo de inicialização
- Barra 0% → 100% em exatamente 3000 ms, com % numérico sincronizado
- Fade-out ao chegar em 100%, liberando a interface
- role="progressbar" com aria-valuenow`],
  [FRONT, "vinicius", "task", "high", 2, "[UI] Dados mock compartilhados (ecopontos, recompensas, histórico)",
    `Critérios de aceite:
- Arquivo JS/JSON com ecopontos (nome, zona, endereço, horário, status, materiais), recompensas (categoria, ícone, descrição, custo) e histórico de descartes
- Usar nomes e materiais iguais aos da API (plasticos, papeis, metais, vidros, eletronicos)
- Combinar o formato com o time antes de começar as telas`],
  [FRONT, "adolfo", "story", "medium", 3, "[UI] Tela Início",
    `Critérios de aceite:
- Banner institucional com chamada de ação
- Ecopontos em destaque
- Resumo do impacto ecológico
- CTAs levando para Ecopontos / Extrato / Recompensas`],
  [FRONT, "caetano", "story", "high", 5, "[UI] Tela Ecopontos — cards, badges e filtro por pills",
    `Critérios de aceite:
- Cards em grade responsiva: nome, zona, endereço, horário e status de atendimento
- Badges coloridos por material (Plásticos, Papéis, Metais, Vidros, Eletrônicos)
- Pills: Todos, Plásticos, Papéis, Metais, Vidro, Eletrônicos
- Clicar filtra na hora, sem recarregar; pill ativa com destaque visual`],
  [FRONT, "vinicius", "story", "high", 5, "[UI] Tela Extrato de Pontos & metas",
    `Critérios de aceite:
- Saldo de EcoPoints em destaque
- Nível do munícipe (ex.: Cidadão Sustentável • Nível Prata) + progresso da meta mensal
- Grade de impacto com ícones: kg de CO₂, litros de água, kWh e árvores salvas (calculados)
- Tabela responsiva: Data, Ecoponto, Material, Peso (kg), Pontos (+pts), Status
- Resgates feitos em Recompensas aparecem como saída (combinar com Murilo)`],
  [FRONT, "murilo", "story", "highest", 8, "[UI] Tela Recompensas + fluxo de resgate",
    `Critérios de aceite:
- Saldo disponível visível no topo
- Cards: IPTU Verde, Bilhete Único SPTrans, Feira Orgânica, Muda Nativa, Kit Composteira, Ecobag — com badge, ícone, descrição, custo e botão
- Saldo suficiente: debita, atualiza a tela na hora, gera código de voucher único e mostra confirmação
- Resgate entra no extrato como transação de saída
- Saldo insuficiente: alerta amigável com quantos pontos faltam`],
  [FRONT, "sofia", "story", "medium", 5, "[UI] Modal de Newsletter aos 20 segundos",
    `Critérios de aceite:
- Abre sozinho após 20 s de navegação
- Fundo escurecido com backdrop-filter (desfoque)
- Fecha pelo X, clicando fora ou com ESC
- Validação de e-mail
- Salva em array JSON no localStorage
- Marca "já cadastrado" para não reabrir
- Feedback de sucesso e fechamento suave`],
  [FRONT, "adolfo", "task", "medium", 3, "[UI] Responsividade e acessibilidade",
    `Critérios de aceite:
- Desktop (>= 1024px): navegação no header e grades de 2–3 colunas
- Mobile (375px): coluna única, sem rolagem horizontal, bottom nav fixa com ícones e rótulos
- Foco visível ao navegar com Tab
- aria-label/role em botões e barras de progresso
- Áreas de toque de no mínimo 44px`],
  [FRONT, "henrique", "task", "low", 2, "[UI] Microinterações dos cards",
    `Critérios de aceite:
- Entrada escalonada dos cards ao entrar na tela (IntersectionObserver ou animation-delay)
- Hover/focus em cards de ecopontos e recompensas: elevação, sombra e borda com transição suave`],
];

export async function runSeed(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS seeds (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const lock = await client.query(
    `INSERT INTO seeds (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING name`, [SEED]
  );
  if (lock.length === 0) return; // já aplicado

  try {
    const ids = {};
    for (const m of TEAM) {
      const first = m.name.split(" ")[0];
      const found = await client.query(
        `SELECT id FROM users WHERE lower(name) = lower($1) OR lower(email) = lower($2)
            OR (lower(name) LIKE lower($3) || '%' AND $4::boolean)
         ORDER BY (lower(name) = lower($1)) DESC, last_seen_at DESC NULLS LAST, id LIMIT 1`,
        [m.name, m.email, first, m.key === "murilo"]
      );
      let id = found[0]?.id;
      if (!id) {
        id = (await client.query(
          `INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id`, [m.name, m.email, m.role]
        ))[0].id;
      }
      await client.query(
        `UPDATE users SET responsibilities = $1,
           role = CASE WHEN role = 'Membro' THEN $2 ELSE role END WHERE id = $3`,
        [m.responsibilities, m.role, id]
      );
      ids[m.key] = id;
    }

    const hasActive = (await client.query(`SELECT 1 FROM sprints WHERE status = 'active' LIMIT 1`)).length > 0;
    const back = (await client.query(
      `INSERT INTO sprints (name, goal, status, start_date, end_date) VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + 7) RETURNING id`,
      [BACK, "API RESTful da EcoSP com MySQL: categorias, ecopontos, agendamentos, upload de foto e extrato do cidadão.", hasActive ? "planned" : "active"]
    ))[0].id;
    const front = (await client.query(
      `INSERT INTO sprints (name, goal, status, start_date, end_date) VALUES ($1, $2, 'planned', CURRENT_DATE + 7, CURRENT_DATE + 14) RETURNING id`,
      [FRONT, "Experiência do totem e app EcoSP: splash, SPA, ecopontos, extrato, recompensas, tema e newsletter."]
    ))[0].id;
    const sprintId = { [BACK]: back, [FRONT]: front };

    let pos = 0;
    for (const [sprint, owner, type, priority, points, title, description] of ISSUES) {
      const issue = (await client.query(
        `INSERT INTO issues (title, description, type, priority, points, assignee_id, reporter_id, sprint_id, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [title, description, type, priority, points, ids[owner], ids.murilo, sprintId[sprint], ++pos]
      ))[0];
      await client.query(
        `INSERT INTO activity (issue_id, user_id, message) VALUES ($1, $2, 'criou a issue')`, [issue.id, ids.murilo]
      );
    }
  } catch (e) {
    // Libera a trava para tentar de novo no próximo acesso
    await client.query(`DELETE FROM seeds WHERE name = $1`, [SEED]).catch(() => {});
    throw e;
  }
}
