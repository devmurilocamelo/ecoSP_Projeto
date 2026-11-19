import { getCompletedSprints, getActiveSprint, getSprintIssues } from "@/lib/queries";
import { q } from "@/lib/db";
import { STATUSES, label } from "@/lib/constants";

export default async function ReportsPage() {
  const [completed, active, byStatus] = await Promise.all([
    getCompletedSprints(),
    getActiveSprint(),
    q(`SELECT i.status, COUNT(*)::int AS n FROM issues i LEFT JOIN sprints s ON s.id = i.sprint_id
       WHERE i.sprint_id IS NULL OR s.status <> 'completed' GROUP BY i.status`),
  ]);
  const activeIssues = active ? await getSprintIssues(active.id) : [];
  const sprints = [...completed].reverse();
  const velocity = sprints.length ? Math.round(sprints.reduce((a, s) => a + (s.completed_points || 0), 0) / sprints.length) : 0;
  const max = Math.max(1, ...sprints.map((s) => Math.max(s.committed_points || 0, s.completed_points || 0)));
  const activeTotal = activeIssues.reduce((a, i) => a + (i.points || 0), 0);
  const activeDone = activeIssues.filter((i) => i.status === "done").reduce((a, i) => a + (i.points || 0), 0);
  const counts = Object.fromEntries(byStatus.map((r) => [r.status, r.n]));

  return (
    <>
      <div className="page-head"><div><div className="crumbs">Projeto / Relatórios</div><h1>Relatórios</h1></div></div>

      <div className="stats">
        <div className="panel stat"><div className="small muted">Velocidade média</div><div className="stat-value">{velocity} pts</div><div className="small muted">últimas {sprints.length} sprint(s)</div></div>
        <div className="panel stat"><div className="small muted">Sprint ativa</div><div className="stat-value">{active ? `${activeDone}/${activeTotal}` : "—"}</div><div className="small muted">{active ? `${active.name} · pontos concluídos` : "nenhuma em andamento"}</div></div>
        {STATUSES.map((s) => (
          <div key={s.id} className="panel stat"><div className="small muted">{label(STATUSES, s.id)}</div><div className="stat-value">{counts[s.id] ?? 0}</div><div className="small muted">issues no backlog e sprints abertas</div></div>
        ))}
      </div>

      <div className="panel">
        <div style={{ padding: "16px 16px 0" }}><h2>Velocidade por sprint</h2></div>
        {sprints.length === 0 ? (
          <div className="empty" style={{ margin: 16 }}>Conclua a primeira sprint para ver o gráfico de velocidade.</div>
        ) : (
          <>
            <div className="velocity">
              {sprints.map((s) => (
                <div key={s.id} className="vbar-group">
                  <div className="vbars">
                    <div className="vbar" style={{ height: `${((s.committed_points || 0) / max) * 150}px`, background: "#b3b9c4" }}><span>{s.committed_points}</span></div>
                    <div className="vbar" style={{ height: `${((s.completed_points || 0) / max) * 150}px`, background: "var(--success)" }}><span>{s.completed_points}</span></div>
                  </div>
                  <div className="small muted" style={{ paddingBottom: 8, whiteSpace: "nowrap" }}>{s.name}</div>
                </div>
              ))}
            </div>
            <div className="legend">
              <span><i className="dot" style={{ background: "#b3b9c4" }} />Comprometido</span>
              <span><i className="dot" style={{ background: "var(--success)" }} />Concluído</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
