import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember, getMemberIssues, getMemberActivity, getMemberStats } from "@/lib/queries";
import { updateMember } from "@/lib/actions";
import { ROLES, issueKey, fmtDateTime } from "@/lib/constants";
import { Avatar, Presence, TypeIcon, Status, Priority, Points } from "@/components/Badges";
import SubmitButton from "@/components/SubmitButton";

export default async function MemberPage({ params }) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) notFound();
  const member = await getMember(memberId);
  if (!member) notFound();
  const [issues, activity, stats] = await Promise.all([
    getMemberIssues(memberId), getMemberActivity(memberId), getMemberStats(memberId),
  ]);
  const open = issues.filter((i) => i.status !== "done");
  const done = issues.filter((i) => i.status === "done");

  return (
    <>
      <div className="crumbs"><Link href="/team">Time</Link> / {member.name}</div>

      <div className="panel member-head">
        <Avatar name={member.name} email={member.email} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{member.name}</h1>
          <div className="muted">{member.role} · {member.email}</div>
          <div style={{ marginTop: 6 }}><Presence user={member} /></div>
        </div>
      </div>

      <div className="stats" style={{ marginTop: 16 }}>
        <div className="panel stat"><div className="small muted">Issues abertas</div><div className="stat-value">{stats.open_issues}</div></div>
        <div className="panel stat"><div className="small muted">Pontos em aberto</div><div className="stat-value">{stats.open_points}</div></div>
        <div className="panel stat"><div className="small muted">Concluídas</div><div className="stat-value">{stats.done_issues}</div></div>
        <div className="panel stat"><div className="small muted">Issues criadas</div><div className="stat-value">{stats.reported}</div></div>
        <div className="panel stat"><div className="small muted">Comentários</div><div className="stat-value">{stats.comments}</div></div>
      </div>

      <div className="detail">
        <div>
          <h3>Issues de {member.name.split(" ")[0]} ({open.length} abertas)</h3>
          <div className="panel" style={{ marginBottom: 20 }}>
            {open.length === 0 && <div className="empty">Nenhuma issue aberta atribuída.</div>}
            {open.map((i) => <MemberIssue key={i.id} issue={i} />)}
          </div>

          {done.length > 0 && (
            <>
              <h3>Concluídas ({done.length})</h3>
              <div className="panel" style={{ marginBottom: 20 }}>
                {done.map((i) => <MemberIssue key={i.id} issue={i} />)}
              </div>
            </>
          )}

          <h3>O que fez no site</h3>
          <div className="panel timeline">
            {activity.length === 0 && <div className="empty">Nenhuma atividade registrada ainda.</div>}
            {activity.map((a) => (
              <div key={a.id} className="timeline-item">
                <span className="timeline-dot" />
                <div>
                  <div>
                    {a.message}
                    {a.issue_id && (
                      <> em <Link href={`/issues/${a.issue_id}`}>{issueKey(a.issue_id)}</Link>
                        {a.issue_title && <span className="muted"> · {a.issue_title}</span>}</>
                    )}
                  </div>
                  <div className="small muted">{fmtDateTime(a.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <form action={updateMember} className="panel side-panel">
            <input type="hidden" name="id" value={member.id} />
            <h3>Atribuições</h3>
            <div className="field">
              <label htmlFor="role">Papel</label>
              <select id="role" name="role" className="select" defaultValue={member.role}>
                {[...new Set([...ROLES, member.role])].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="responsibilities">Responsável por</label>
              <textarea id="responsibilities" name="responsibilities" className="textarea" rows={8}
                defaultValue={member.responsibilities}
                placeholder={"Ex.:\n- Front-end das telas de login\n- Revisar PRs do time\n- Conduzir a daily"} />
            </div>
            <SubmitButton>Salvar atribuições</SubmitButton>
          </form>
        </aside>
      </div>
    </>
  );
}

function MemberIssue({ issue }) {
  return (
    <Link href={`/issues/${issue.id}`} className="issue-row member-issue">
      <TypeIcon type={issue.type} />
      <span className="key">{issueKey(issue.id)}</span>
      <span className="title">{issue.title}</span>
      <span className="hide-sm small muted">{issue.sprint_name || "Backlog"}</span>
      <Status status={issue.status} />
      <Priority priority={issue.priority} />
      <Points points={issue.points} />
    </Link>
  );
}
