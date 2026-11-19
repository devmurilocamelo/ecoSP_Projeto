import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { PROJECT_NAME, PROJECT_KEY } from "@/lib/constants";
import NavLinks from "@/components/NavLinks";
import AutoRefresh from "@/components/AutoRefresh";
import { Avatar } from "@/components/Badges";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }) {
  const user = await requireUser();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">{PROJECT_KEY[0]}</div>
          <div>
            <div className="brand-name">{PROJECT_NAME}</div>
            <div className="brand-sub">Projeto Scrum · {PROJECT_KEY}</div>
          </div>
        </div>
        <NavLinks />
        <div className="sidebar-footer">
          <Avatar name={user.name} email={user.email} size={32} />
          <div className="who">
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div className="small muted">{user.role}</div>
          </div>
          <form action={logout}>
            <button className="btn btn-ghost btn-sm" title="Sair">Sair</button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
      <AutoRefresh />
    </div>
  );
}
