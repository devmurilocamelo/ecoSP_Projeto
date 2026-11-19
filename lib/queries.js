import "server-only";
import { q, one } from "./db";

const ISSUE_SELECT = `
  SELECT i.*, a.name AS assignee_name, a.email AS assignee_email,
         r.name AS reporter_name, r.email AS reporter_email,
         s.name AS sprint_name
  FROM issues i
  LEFT JOIN users a ON a.id = i.assignee_id
  LEFT JOIN users r ON r.id = i.reporter_id
  LEFT JOIN sprints s ON s.id = i.sprint_id`;

// seen_ago: segundos desde a última atividade (calculado no banco, sem diferença de relógio)
const USER_FIELDS = `id, name, email, role, responsibilities, created_at, last_seen_at, last_path,
  EXTRACT(EPOCH FROM (now() - last_seen_at))::int AS seen_ago`;

export const getUsers = () => q(`SELECT ${USER_FIELDS} FROM users ORDER BY name`);

export const getMember = (id) => one(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [id]);

export const getMemberIssues = (id) =>
  q(`${ISSUE_SELECT} WHERE i.assignee_id = $1
     ORDER BY CASE i.status WHEN 'in_progress' THEN 0 WHEN 'review' THEN 1 WHEN 'todo' THEN 2 ELSE 3 END,
              i.updated_at DESC
     LIMIT 100`, [id]);

export const getMemberActivity = (id) =>
  q(`SELECT a.*, i.title AS issue_title FROM activity a
     LEFT JOIN issues i ON i.id = a.issue_id
     WHERE a.user_id = $1 ORDER BY a.created_at DESC LIMIT 60`, [id]);

export const getMemberStats = (id) =>
  one(`SELECT
       (SELECT COUNT(*) FROM issues WHERE assignee_id = $1 AND status <> 'done')::int AS open_issues,
       (SELECT COALESCE(SUM(points), 0) FROM issues WHERE assignee_id = $1 AND status <> 'done')::int AS open_points,
       (SELECT COUNT(*) FROM issues WHERE assignee_id = $1 AND status = 'done')::int AS done_issues,
       (SELECT COUNT(*) FROM issues WHERE reporter_id = $1)::int AS reported,
       (SELECT COUNT(*) FROM comments WHERE author_id = $1)::int AS comments,
       (SELECT COUNT(*) FROM activity WHERE user_id = $1)::int AS actions`, [id]);

export const getOpenSprints = () =>
  q(`SELECT * FROM sprints WHERE status <> 'completed'
     ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id`);

export const getActiveSprint = () => one("SELECT * FROM sprints WHERE status = 'active' LIMIT 1");

export const getCompletedSprints = () =>
  q("SELECT * FROM sprints WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 12");

export function getIssues({ search, assignee, type } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(i.title ILIKE $${params.length} OR i.description ILIKE $${params.length} OR CAST(i.id AS TEXT) = $${params.length + 1})`);
    params.push(search.replace(/\D/g, "") || "-1");
  }
  if (assignee === "none") where.push("i.assignee_id IS NULL");
  else if (assignee) { params.push(Number(assignee)); where.push(`i.assignee_id = $${params.length}`); }
  if (type) { params.push(type); where.push(`i.type = $${params.length}`); }
  // Sprints concluídas não aparecem no backlog
  where.push("(i.sprint_id IS NULL OR s.status <> 'completed')");
  return q(`${ISSUE_SELECT} WHERE ${where.join(" AND ")} ORDER BY i.position, i.id`, params);
}

export const getSprintIssues = (sprintId) =>
  q(`${ISSUE_SELECT} WHERE i.sprint_id = $1 ORDER BY i.position, i.id`, [sprintId]);

export const getIssue = (id) => one(`${ISSUE_SELECT} WHERE i.id = $1`, [id]);

export const getComments = (issueId) =>
  q(`SELECT c.*, u.name AS author_name, u.email AS author_email FROM comments c
     LEFT JOIN users u ON u.id = c.author_id WHERE c.issue_id = $1 ORDER BY c.created_at`, [issueId]);

export const getActivity = (issueId) =>
  q(`SELECT a.*, u.name AS user_name FROM activity a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.issue_id = $1 ORDER BY a.created_at DESC LIMIT 30`, [issueId]);

export const getUserStats = () =>
  q(`SELECT u.id,
       COUNT(i.id) FILTER (WHERE i.status <> 'done')::int AS open_issues,
       COALESCE(SUM(i.points) FILTER (WHERE i.status <> 'done'), 0)::int AS open_points,
       COUNT(i.id) FILTER (WHERE i.status = 'done')::int AS done_issues
     FROM users u LEFT JOIN issues i ON i.assignee_id = u.id GROUP BY u.id`);
