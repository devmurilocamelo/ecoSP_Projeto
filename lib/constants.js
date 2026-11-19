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
