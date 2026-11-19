import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssue, getComments, getActivity, getUsers, getOpenSprints } from "@/lib/queries";
import { updateIssue, deleteIssue, addComment } from "@/lib/actions";
import { STATUSES, TYPES, PRIORITIES, POINTS, issueKey, fmtDateTime } from "@/lib/constants";
import { TypeIcon, Avatar } from "@/components/Badges";
import SubmitButton from "@/components/SubmitButton";

export default async function IssuePage({ params }) {
  const { id } = await params;
  const issueId = Number(id);
  if (!Number.isInteger(issueId)) notFound();
  const issue = await getIssue(issueId);
  if (!issue) notFound();
  const [comments, activity, users, sprints] = await Promise.all([
    getComments(issueId), getActivity(issueId), getUsers(), getOpenSprints(),
  ]);
  // Mantém a sprint atual disponível na lista mesmo se já estiver concluída
  const sprintOptions = issue.sprint_id && !sprints.some((s) => s.id === issue.sprint_id)
    ? [...sprints, { id: issue.sprint_id, name: `${issue.sprint_name} (concluída)` }]
    : sprints;

  return (
    <>
      <div className="crumbs">
        <Link href="/backlog">Backlog</Link> / <span className="row" style={{ display: "inline-flex", gap: 4 }}><TypeIcon type={issue.type} /> {issueKey(issue.id)}</span>
      </div>

      <form action={updateIssue} id="issue-form">
        <input type="hidden" name="id" value={issue.id} />
        <div className="detail" style={{ marginTop: 8 }}>
          <div>
            <input name="title" className="detail-title" defaultValue={issue.title} required maxLength={200} aria-label="Título" />
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="description">Descrição</label>
              <textarea id="description" name="description" className="textarea" defaultValue={issue.description}
                placeholder={"Como [persona], quero [objetivo] para [benefício].\n\nCritérios de aceite:\n- ..."} rows={8} />
            </div>
            <SubmitButton>Salvar alterações</SubmitButton>
          </div>

          <aside className="panel side-panel">
            <div className="field">
              <label>Status</label>
              <select name="status" className="select" defaultValue={issue.status}>
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Responsável</label>
              <select name="assignee_id" className="select" defaultValue={issue.assignee_id ?? ""}>
                <option value="">Sem responsável</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select name="type" className="select" defaultValue={issue.type}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Prioridade</label>
              <select name="priority" className="select" defaultValue={issue.priority}>
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Story points</label>
              <select name="points" className="select" defaultValue={issue.points ?? ""}>
                <option value="">Sem estimativa</option>
                {POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sprint</label>
              <select name="sprint_id" className="select" defaultValue={issue.sprint_id ?? ""}>
                <option value="">Backlog</option>
                {sprintOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Relator</label>
              <div className="row"><Avatar name={issue.reporter_name} email={issue.reporter_email} /> {issue.reporter_name || "—"}</div>
            </div>
            <div className="small muted">
              Criada em {fmtDateTime(issue.created_at)}<br />Atualizada em {fmtDateTime(issue.updated_at)}
            </div>
            <div className="row" style={{ marginTop: 16 }}>
              <SubmitButton className="btn btn-primary btn-sm">Salvar</SubmitButton>
            </div>
          </aside>
        </div>
      </form>

      <div className="detail" style={{ marginTop: 32 }}>
        <div>
          <h3>Comentários ({comments.length})</h3>
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar name={c.author_name} email={c.author_email} size={32} />
              <div style={{ flex: 1 }}>
                <div className="small"><strong>{c.author_name || "Usuário removido"}</strong> <span className="muted">· {fmtDateTime(c.created_at)}</span></div>
                <div className="comment-body">{c.body}</div>
              </div>
            </div>
          ))}
          <form action={addComment}>
            <input type="hidden" name="issue_id" value={issue.id} />
            <textarea name="body" className="textarea" style={{ minHeight: 80 }} placeholder="Adicione um comentário…" required />
            <div style={{ marginTop: 8 }}><SubmitButton pendingText="Enviando…">Comentar</SubmitButton></div>
          </form>

          <form action={deleteIssue} style={{ marginTop: 40 }}>
            <input type="hidden" name="id" value={issue.id} />
            <SubmitButton className="btn btn-danger btn-sm" confirm="Excluir esta issue permanentemente?">Excluir issue</SubmitButton>
          </form>
        </div>
        <div>
          <h3>Histórico</h3>
          {activity.length === 0 && <div className="activity">Sem atividades.</div>}
          {activity.map((a) => (
            <div key={a.id} className="activity">
              <strong>{a.user_name || "Alguém"}</strong> {a.message} <span className="small">· {fmtDateTime(a.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
