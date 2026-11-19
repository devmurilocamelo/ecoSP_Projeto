import Link from "next/link";
import { getUsers, getUserStats } from "@/lib/queries";
import { updateMember } from "@/lib/actions";
import { presence } from "@/lib/constants";
import { Avatar, Presence } from "@/components/Badges";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";
import { ROLES } from "@/lib/constants";

export default async function TeamPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);
  const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
  const online = users.filter((u) => presence(u).online).length;
  return (
    <>
      <div className="page-head">
        <div><div className="crumbs">Projeto / Time</div><h1>Time ({users.length})</h1></div>
        <span className="online-count"><span className="presence-dot on" /> {online} online agora</span>
      </div>
      <p className="muted" style={{ marginTop: -8 }}>Clique em um membro para ver as atribuições, as issues e tudo o que ele(a) fez no site.</p>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead><tr><th>Membro</th><th>Status</th><th>Papel</th><th>Atribuições</th><th>Issues abertas</th><th>Pontos abertos</th><th>Concluídas</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link href={`/team/${u.id}`} className="row member-link">
                    <Avatar name={u.name} email={u.email} size={32} />
                    <div><div style={{ fontWeight: 600 }}>{u.name}</div><div className="small muted">{u.email}</div></div>
                  </Link>
                </td>
                <td><Presence user={u} /></td>
                <td>
                  <form action={updateMember}>
                    <input type="hidden" name="id" value={u.id} />
                    <AutoSubmitSelect name="role" defaultValue={u.role} className="select">
                      {[...new Set([...ROLES, u.role])].map((r) => <option key={r} value={r}>{r}</option>)}
                    </AutoSubmitSelect>
                  </form>
                </td>
                <td className="resp-cell">
                  {u.responsibilities
                    ? <span className="small">{u.responsibilities.split("\n")[0]}</span>
                    : <Link href={`/team/${u.id}`} className="small">+ definir</Link>}
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
