export const PROJECT_KEY = process.env.NEXT_PUBLIC_PROJECT_KEY || "AGL";
export const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "AgilBoard";

export const issueKey = (id) => `${PROJECT_KEY}-${id}`;

export const STATUSES = [
  { id: "todo", label: "A Fazer" },
  { id: "in_progress", label: "Em Andamento" },
  { id: "review", label: "Em Revisão" },
  { id: "done", label: "Concluído" },
];

export const TYPES = [
  { id: "story", label: "História", icon: "▣" },
  { id: "task", label: "Tarefa", icon: "✓" },
  { id: "bug", label: "Bug", icon: "●" },
  { id: "epic", label: "Épico", icon: "⚡" },
];

export const PRIORITIES = [
  { id: "highest", label: "Altíssima", icon: "⇈" },
  { id: "high", label: "Alta", icon: "↑" },
  { id: "medium", label: "Média", icon: "=" },
  { id: "low", label: "Baixa", icon: "↓" },
  { id: "lowest", label: "Baixíssima", icon: "⇊" },
];

export const POINTS = [1, 2, 3, 5, 8, 13, 21];

export const ROLES = ["Product Owner", "Scrum Master", "Desenvolvedor", "QA", "Designer", "Membro"];

export const label = (list, id) => list.find((x) => x.id === id)?.label ?? id;
export const icon = (list, id) => list.find((x) => x.id === id)?.icon ?? "";

const COLORS = ["#0052cc", "#00875a", "#de350b", "#6554c0", "#ff8b00", "#00a3bf", "#c9372c", "#5243aa"];
export function colorFor(seed = "") {
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}
export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T12:00:00" : d) : d;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
export function fmtDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

/* ---------- Presença ---------- */
export const ONLINE_SECONDS = 60;

const PAGES = [
  [/^\/backlog/, "Backlog"],
  [/^\/board/, "Quadro da Sprint"],
  [/^\/reports/, "Relatórios"],
  [/^\/team\/\d+/, "perfil de um membro"],
  [/^\/team/, "Time"],
];
export function pageLabel(path = "") {
  const m = /^\/issues\/(\d+)/.exec(path || "");
  if (m) return `a issue ${issueKey(m[1])}`;
  return PAGES.find(([re]) => re.test(path || ""))?.[1] ?? "o projeto";
}

export function timeAgo(seconds) {
  if (seconds == null) return "nunca entrou";
  if (seconds < 60) return "agora há pouco";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

/** { online, text } a partir de seen_ago (segundos) e last_path */
export function presence(user) {
  const online = user.seen_ago != null && user.seen_ago < ONLINE_SECONDS;
  if (online) return { online, text: `Online agora · vendo ${pageLabel(user.last_path)}` };
  return { online, text: user.seen_ago == null ? "Nunca entrou" : `Visto ${timeAgo(user.seen_ago)}` };
}
