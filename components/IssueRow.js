import Link from "next/link";
import { issueKey } from "@/lib/constants";
import { moveIssueToSprint } from "@/lib/actions";
import { TypeIcon, Priority, Status, Points, Avatar } from "./Badges";
import AutoSubmitSelect from "./AutoSubmitSelect";

export default function IssueRow({ issue, sprints }) {
  return (
    <div className="issue-row">
      <TypeIcon type={issue.type} />
      <Link href={`/issues/${issue.id}`} className="key">{issueKey(issue.id)}</Link>
      <Link href={`/issues/${issue.id}`} className="title">{issue.title}</Link>
      <span className="hide-sm"><Status status={issue.status} /></span>
      <Priority priority={issue.priority} />
      <Points points={issue.points} />
      <Avatar name={issue.assignee_name} email={issue.assignee_email} />
      <form action={moveIssueToSprint} className="hide-sm">
        <input type="hidden" name="id" value={issue.id} />
        <AutoSubmitSelect name="sprint_id" defaultValue={issue.sprint_id ?? ""} aria-label="Mover para" style={{ width: "100%" }}>
          <option value="">Backlog</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </AutoSubmitSelect>
      </form>
    </div>
  );
}
