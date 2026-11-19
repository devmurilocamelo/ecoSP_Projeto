import { createIssue } from "@/lib/actions";
import { TYPES, PRIORITIES, POINTS } from "@/lib/constants";
import SubmitButton from "./SubmitButton";

export default function QuickCreate({ sprintId, users }) {
  return (
    <form action={createIssue} className="quick-create">
      <input type="hidden" name="sprint_id" value={sprintId ?? ""} />
      <select name="type" className="select" defaultValue="story" aria-label="Tipo">
        {TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
      </select>
      <input name="title" className="input" placeholder="+ O que precisa ser feito?" required maxLength={200} />
      <select name="priority" className="select" defaultValue="medium" aria-label="Prioridade">
        {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
      </select>
      <select name="points" className="select" defaultValue="" aria-label="Story points">
        <option value="">Pontos</option>
        {POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select name="assignee_id" className="select" defaultValue="" aria-label="Responsável">
        <option value="">Sem responsável</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <SubmitButton pendingText="Criando…">Criar</SubmitButton>
    </form>
  );
}
