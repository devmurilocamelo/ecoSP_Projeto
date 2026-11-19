import Link from "next/link";
import { getIssues, getOpenSprints, getUsers } from "@/lib/queries";
import { createSprint, startSprint, completeSprint, deleteSprint, updateSprint } from "@/lib/actions";
import { TYPES, fmtDate } from "@/lib/constants";
import IssueRow from "@/components/IssueRow";
import QuickCreate from "@/components/QuickCreate";
import SubmitButton from "@/components/SubmitButton";

function SprintForm({ sprint, action, submit }) {
  return (
    <form action={action} className="form-grid">
      {sprint && <input type="hidden" name="id" value={sprint.id} />}
      <div className="field"><label>Nome</label><input name="name" className="input" defaultValue={sprint?.name} placeholder="Sprint 1" /></div>
      <div className="field"><label>Início</label><input name="start_date" type="date" className="input" defaultValue={sprint?.start_date ? String(sprint.start_date).slice(0, 10) : ""} /></div>
      <div className="field"><label>Fim</label><input name="end_date" type="date" className="input" defaultValue={sprint?.end_date ? String(sprint.end_date).slice(0, 10) : ""} /></div>
      <div className="field" style={{ gridColumn: "1 / -1" }}><label>Meta da sprint</label><input name="goal" className="input" defaultValue={sprint?.goal} placeholder="O que o time quer entregar?" /></div>
      <div><SubmitButton>{submit}</SubmitButton></div>
    </form>
  );
}

function toISO(d) {
  return d instanceof Date ? d.toISOString().slice(0, 10) : d;
}

export default async function BacklogPage({ searchParams }) {
  const sp = await searchParams;
  const filters = { search: sp.q?.trim(), assignee: sp.assignee, type: sp.type };
  const [issues, sprints, users] = await Promise.all([getIssues(filters), getOpenSprints(), getUsers()]);
  const hasActive = sprints.some((s) => s.status === "active");
  const backlog = issues.filter((i) => !i.sprint_id);
  const filtered = Boolean(filters.search || filters.assignee || filters.type);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs">Projeto / Backlog</div>
          <h1>Backlog</h1>
        </div>
        <form className="row wrap" method="GET">
          <input name="q" className="input" placeholder="Buscar issues…" defaultValue={sp.q} />
          <select name="assignee" className="select" defaultValue={sp.assignee || ""}>
            <option value="">Todos os responsáveis</option>
            <option value="none">Sem responsável</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select name="type" className="select" defaultValue={sp.type || ""}>
            <option value="">Todos os tipos</option>
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <button className="btn">Filtrar</button>
          {filtered && <Link href="/backlog" className="btn btn-ghost">Limpar</Link>}
        </form>
      </div>

      {sprints.map((s) => {
        const items = issues.filter((i) => i.sprint_id === s.id);
        const total = items.reduce((a, i) => a + (i.points || 0), 0);
        const done = items.filter((i) => i.status === "done").reduce((a, i) => a + (i.points || 0), 0);
        const pct = total ? Math.round((done / total) * 100) : 0;
        return (
          <section key={s.id} className={`section ${s.status === "active" ? "active-sprint" : ""}`}>
            <div className="section-head">
              <h2>{s.name}</h2>
              <span className={`pill pill-${s.status}`}>{s.status === "active" ? "Ativa" : "Planejada"}</span>
              <span className="meta">
                {s.start_date ? `${fmtDate(toISO(s.start_date))} – ${fmtDate(toISO(s.end_date))} · ` : ""}
                {items.length} issues · {total} pts
              </span>
              {s.status === "active" && (
                <span className="row small muted"><div className="progress"><div style={{ width: `${pct}%` }} /></div>{pct}%</span>
              )}
              <span className="spacer" />
              {s.status === "planned" && (
                <form action={startSprint}>
                  <input type="hidden" name="id" value={s.id} />
                  <SubmitButton className="btn btn-primary btn-sm" disabled={hasActive} title={hasActive ? "Já existe uma sprint ativa" : ""}>
                    Iniciar sprint
                  </SubmitButton>
                </form>
              )}
              {s.status === "active" && (
                <>
                  <Link href="/board" className="btn btn-sm">Abrir quadro</Link>
                  <form action={completeSprint}>
                    <input type="hidden" name="id" value={s.id} />
                    <SubmitButton className="btn btn-primary btn-sm" confirm="Concluir a sprint? Issues não concluídas voltam para o backlog.">
                      Concluir sprint
                    </SubmitButton>
                  </form>
                </>
              )}
              <details className="inline-form">
                <summary className="btn btn-ghost btn-sm">Editar</summary>
                <div className="popover">
                <SprintForm sprint={s} action={updateSprint} submit="Salvar" />
                {s.status === "planned" && (
                  <form action={deleteSprint} style={{ marginTop: 8 }}>
                    <input type="hidden" name="id" value={s.id} />
                    <SubmitButton className="btn btn-danger btn-sm" confirm="Excluir sprint? As issues voltam para o backlog.">Excluir sprint</SubmitButton>
                  </form>
                )}
                </div>
              </details>
            </div>
            {s.goal && <p className="small muted" style={{ margin: "0 0 8px" }}>🎯 {s.goal}</p>}
            {items.length ? (
              <div className="issue-list">{items.map((i) => <IssueRow key={i.id} issue={i} sprints={sprints} />)}</div>
            ) : (
              <div className="empty">{filtered ? "Nenhuma issue com esses filtros." : "Planeje a sprint movendo issues do backlog para cá."}</div>
            )}
            <QuickCreate sprintId={s.id} users={users} />
          </section>
        );
      })}

      <section className="section">
        <div className="section-head">
          <h2>Backlog do produto</h2>
          <span className="meta">{backlog.length} issues · {backlog.reduce((a, i) => a + (i.points || 0), 0)} pts</span>
          <span className="spacer" />
          <details className="inline-form">
            <summary className="btn btn-sm">+ Criar sprint</summary>
            <div className="popover"><SprintForm action={createSprint} submit="Criar sprint" /></div>
          </details>
        </div>
        {backlog.length ? (
          <div className="issue-list">{backlog.map((i) => <IssueRow key={i.id} issue={i} sprints={sprints} />)}</div>
        ) : (
          <div className="empty">{filtered ? "Nenhuma issue com esses filtros." : "O backlog está vazio. Crie a primeira história abaixo."}</div>
        )}
        <QuickCreate sprintId={null} users={users} />
      </section>
    </>
  );
}
