import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PROJECT_NAME, PROJECT_KEY } from "@/lib/constants";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/backlog");
  return (
    <div className="login-wrap">
      <div className="panel login-card">
        <div className="brand" style={{ padding: "0 0 20px" }}>
          <div className="brand-logo">{PROJECT_KEY[0]}</div>
          <div>
            <div className="brand-name">{PROJECT_NAME}</div>
            <div className="brand-sub">Gestão ágil colaborativa</div>
          </div>
        </div>
        <h1 style={{ marginBottom: 6 }}>Entrar no projeto</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 20 }}>
          Todo o time acessa o mesmo backlog, sprints e quadro.
        </p>
        <LoginForm needsCode={Boolean(process.env.TEAM_ACCESS_CODE)} />
      </div>
    </div>
  );
}
