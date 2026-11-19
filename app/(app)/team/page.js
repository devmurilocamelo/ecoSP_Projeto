import { getUsers, getUserStats } from "@/lib/queries";
import { updateRole } from "@/lib/actions";
import { Avatar } from "@/components/Badges";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";

const ROLES = ["Product Owner", "Scrum Master", "Desenvolvedor", "QA", "Designer", "Membro"];

export default async function TeamPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);
  const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
  return (
    <>
      <div className="page-head">
        <div><div className="crumbs">Projeto / Time</div><h1>Time ({users.length})</h1></div>
      </div>
      <p className="muted" style={{ marginTop: -8 }}>Qualquer pessoa entra com nome e e-mail (e o código do time, se configurado) e passa a aparecer aqui.</p>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead><tr><th>Membro</th><th>Papel</th><th>Issues abertas</th><th>Pontos abertos</th><th>Concluídas</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><div className="row"><Avatar name={u.name} email={u.email} size={32} /><div><div style={{ fontWeight: 600 }}>{u.name}</div><div className="small muted">{u.email}</div></div></div></td>
                <td>
                  <form action={updateRole}>
                    <input type="hidden" name="id" value={u.id} />
                    <AutoSubmitSelect name="role" defaultValue={u.role} className="select">
                      {[...new Set([...ROLES, u.role])].map((r) => <option key={r} value={r}>{r}</option>)}
                    </AutoSubmitSelect>
                  </form>
                </td>
                <td>{byId[u.id]?.open_issues ?? 0}</td>
                <td>{byId[u.id]?.open_points ?? 0}</td>
                <td>{byId[u.id]?.done_issues ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
