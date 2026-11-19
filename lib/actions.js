"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "./db";
import { createSession, destroySession, requireUser } from "./auth";
import { STATUSES, TYPES, PRIORITIES, label } from "./constants";

const str = (fd, k) => String(fd.get(k) ?? "").trim();
const intOrNull = (v) => (v === "" || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const oneOf = (list, v, fallback) => (list.some((x) => x.id === v) ? v : fallback);

function refresh() {
  revalidatePath("/", "layout");
}

async function log(issueId, userId, message) {
  await q("INSERT INTO activity (issue_id, user_id, message) VALUES ($1, $2, $3)", [issueId, userId, message]);
}

/* ---------- Autenticação ---------- */

export async function login(_prev, fd) {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const code = str(fd, "code");
  const expected = process.env.TEAM_ACCESS_CODE;

  if (!name || !email) return { error: "Informe nome e e-mail." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "E-mail inválido." };
  if (expected && code !== expected) return { error: "Código de acesso do time incorreto." };

  const user = await one(
    `INSERT INTO users (name, email) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, email]
  );
  await createSession(user.id);
  redirect("/backlog");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function updateRole(fd) {
  await requireUser();
  await q("UPDATE users SET role = $1 WHERE id = $2", [str(fd, "role") || "Membro", Number(fd.get("id"))]);
  refresh();
}

/* ---------- Issues ---------- */

export async function createIssue(fd) {
  const user = await requireUser();
  const title = str(fd, "title");
  if (!title) return;
  const sprintId = intOrNull(fd.get("sprint_id"));
  const pos = await one(
    "SELECT COALESCE(MAX(position), 0) + 1 AS p FROM issues WHERE sprint_id IS NOT DISTINCT FROM $1",
    [sprintId]
  );
  const issue = await one(
    `INSERT INTO issues (title, type, priority, points, assignee_id, reporter_id, sprint_id, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      title,
      oneOf(TYPES, str(fd, "type"), "story"),
      oneOf(PRIORITIES, str(fd, "priority"), "medium"),
      intOrNull(fd.get("points")),
      intOrNull(fd.get("assignee_id")),
      user.id,
      sprintId,
      pos.p,
    ]
  );
  await log(issue.id, user.id, "criou a issue");
  refresh();
}

export async function updateIssue(fd) {
  const user = await requireUser();
  const id = Number(fd.get("id"));
  const before = await one("SELECT * FROM issues WHERE id = $1", [id]);
  if (!before) return;

  const next = {
    title: str(fd, "title") || before.title,
    description: str(fd, "description"),
    type: oneOf(TYPES, str(fd, "type"), before.type),
    status: oneOf(STATUSES, str(fd, "status"), before.status),
    priority: oneOf(PRIORITIES, str(fd, "priority"), before.priority),
    points: intOrNull(fd.get("points")),
    assignee_id: intOrNull(fd.get("assignee_id")),
    sprint_id: intOrNull(fd.get("sprint_id")),
  };

  await q(
    `UPDATE issues SET title=$1, description=$2, type=$3, status=$4, priority=$5, points=$6,
       assignee_id=$7, sprint_id=$8, updated_at=now() WHERE id=$9`,
    [next.title, next.description, next.type, next.status, next.priority, next.points, next.assignee_id, next.sprint_id, id]
  );

  const changes = [];
  if (before.status !== next.status) changes.push(`mudou status para "${label(STATUSES, next.status)}"`);
  if (before.priority !== next.priority) changes.push(`mudou prioridade para "${label(PRIORITIES, next.priority)}"`);
  if (before.assignee_id !== next.assignee_id) changes.push("alterou o responsável");
  if (before.sprint_id !== next.sprint_id) changes.push("moveu de sprint");
  if (before.points !== next.points) changes.push(`definiu ${next.points ?? 0} story points`);
  if (before.title !== next.title || before.description !== next.description) changes.push("editou os detalhes");
  for (const c of changes) await log(id, user.id, c);
  refresh();
}

export async function setIssueStatus(id, status) {
  const user = await requireUser();
  status = oneOf(STATUSES, status, null);
  if (!status) return;
  const before = await one("SELECT status FROM issues WHERE id = $1", [id]);
  if (!before || before.status === status) return;
  await q("UPDATE issues SET status = $1, updated_at = now() WHERE id = $2", [status, id]);
  await log(id, user.id, `mudou status para "${label(STATUSES, status)}"`);
  refresh();
}

export async function moveIssueToSprint(fd) {
  const user = await requireUser();
  const id = Number(fd.get("id"));
  const sprintId = intOrNull(fd.get("sprint_id"));
  await q("UPDATE issues SET sprint_id = $1, updated_at = now() WHERE id = $2", [sprintId, id]);
  await log(id, user.id, sprintId ? "moveu para uma sprint" : "moveu para o backlog");
  refresh();
}

export async function deleteIssue(fd) {
  await requireUser();
  await q("DELETE FROM issues WHERE id = $1", [Number(fd.get("id"))]);
  refresh();
  redirect("/backlog");
}

export async function addComment(fd) {
  const user = await requireUser();
  const body = str(fd, "body");
  const issueId = Number(fd.get("issue_id"));
  if (!body) return;
  await q("INSERT INTO comments (issue_id, author_id, body) VALUES ($1, $2, $3)", [issueId, user.id, body]);
  await q("UPDATE issues SET updated_at = now() WHERE id = $1", [issueId]);
  refresh();
}

/* ---------- Sprints ---------- */

export async function createSprint(fd) {
  await requireUser();
  const count = await one("SELECT COUNT(*)::int AS n FROM sprints");
  const name = str(fd, "name") || `Sprint ${count.n + 1}`;
  await q("INSERT INTO sprints (name, goal, start_date, end_date) VALUES ($1, $2, $3, $4)", [
    name,
    str(fd, "goal"),
    str(fd, "start_date") || null,
    str(fd, "end_date") || null,
  ]);
  refresh();
}

export async function updateSprint(fd) {
  await requireUser();
  await q("UPDATE sprints SET name=$1, goal=$2, start_date=$3, end_date=$4 WHERE id=$5", [
    str(fd, "name") || "Sprint",
    str(fd, "goal"),
    str(fd, "start_date") || null,
    str(fd, "end_date") || null,
    Number(fd.get("id")),
  ]);
  refresh();
}

export async function startSprint(fd) {
  await requireUser();
  const id = Number(fd.get("id"));
  const active = await one("SELECT id FROM sprints WHERE status = 'active'");
  if (active) return; // só uma sprint ativa por vez
  await q(
    `UPDATE sprints SET status='active',
       start_date = COALESCE(start_date, CURRENT_DATE),
       end_date = COALESCE(end_date, CURRENT_DATE + 14)
     WHERE id=$1`,
    [id]
  );
  refresh();
}

export async function completeSprint(fd) {
  await requireUser();
  const id = Number(fd.get("id"));
  const stats = await one(
    `SELECT COALESCE(SUM(points),0)::int AS committed,
            COALESCE(SUM(CASE WHEN status='done' THEN points ELSE 0 END),0)::int AS completed
     FROM issues WHERE sprint_id = $1`,
    [id]
  );
  await q(
    `UPDATE sprints SET status='completed', committed_points=$1, completed_points=$2, completed_at=now() WHERE id=$3`,
    [stats.committed, stats.completed, id]
  );
  // Issues não concluídas voltam para o backlog
  await q("UPDATE issues SET sprint_id = NULL WHERE sprint_id = $1 AND status <> 'done'", [id]);
  refresh();
  redirect("/reports");
}

export async function deleteSprint(fd) {
  await requireUser();
  const id = Number(fd.get("id"));
  await q("UPDATE issues SET sprint_id = NULL WHERE sprint_id = $1", [id]);
  await q("DELETE FROM sprints WHERE id = $1 AND status <> 'active'", [id]);
  refresh();
}
