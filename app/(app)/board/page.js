import Link from "next/link";
import { getActiveSprint, getSprintIssues, getUsers } from "@/lib/queries";
import { completeSprint } from "@/lib/actions";
import { fmtDate } from "@/lib/constants";
import Board from "@/components/Board";
import SubmitButton from "@/components/SubmitButton";
import { Avatar } from "@/components/Badges";

const toISO = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d);

export default async function BoardPage({ searchParams }) {
  const sp = await searchParams;
  const sprint = await getActiveSprint();
  if (!sprint) {
    return (
      <>
        <div className="page-head"><div><div className="crumbs">Projeto / Quadro</div><h1>Quadro da Sprint</h1></div></div>
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ marginBottom: 8 }}>Nenhuma sprint ativa</h2>
          <p className="muted">Vá ao backlog, planeje uma sprint e clique em “Iniciar sprint”.</p>
          <Link href="/backlog" className="btn btn-primary">Ir para o backlog</Link>
        </div>
      </>
    );
  }

  const [all, users] = await Promise.all([getSprintIssues(sprint.id), getUsers()]);
  const issues = sp.assignee ? all.filter((i) => String(i.assignee_id ?? "none") === sp.assignee) : all;
  const total = all.reduce((a, i) => a + (i.points || 0), 0);
  const done = all.filter((i) => i.status === "done").reduce((a, i) => a + (i.points || 0), 0);
  const end = sprint.end_date ? new Date(toISO(sprint.end_date) + "T23:59:59") : null;
  const daysLeft = end ? Math.max(0, Math.ceil((end - Date.now()) / 86400000)) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs">Projeto / Quadro</div>
          <h1>{sprint.name}</h1>
          <div className="small muted" style={{ marginTop: 4 }}>
            {fmtDate(toISO(sprint.start_date))} – {fmtDate(toISO(sprint.end_date))}
            {daysLeft !== null && ` · ${daysLeft} dia(s) restante(s)`} · {done}/{total} pts concluídos
            {sprint.goal && <> · 🎯 {sprint.goal}</>}
          </div>
        </div>
        <div className="row wrap">
          <Link href="/board" className={`btn btn-sm ${!sp.assignee ? "btn-primary" : "btn-ghost"}`}>Todos</Link>
          {users.map((u) => (
            <Link key={u.id} href={`/board?assignee=${u.id}`} title={u.name} style={{ opacity: sp.assignee && sp.assignee !== String(u.id) ? 0.4 : 1 }}>
              <Avatar name={u.name} email={u.email} size={28} />
            </Link>
          ))}
          <form action={completeSprint}>
            <input type="hidden" name="id" value={sprint.id} />
            <SubmitButton className="btn btn-sm" confirm="Concluir a sprint? Issues não concluídas voltam para o backlog.">Concluir sprint</SubmitButton>
          </form>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: -8 }}>Arraste os cartões entre as colunas para atualizar o status. Clique para ver detalhes.</p>
      <Board issues={issues} />
    </>
  );
}
