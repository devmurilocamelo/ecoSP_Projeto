"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { STATUSES, issueKey } from "@/lib/constants";
import { setIssueStatus } from "@/lib/actions";
import { TypeIcon, Priority, Points, Avatar } from "./Badges";

export default function Board({ issues: initial }) {
  const [issues, setIssues] = useState(initial);
  const [over, setOver] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [, startTransition] = useTransition();

  // Recebe atualizações vindas de outros usuários
  useEffect(() => setIssues(initial), [initial]);

  function drop(status) {
    const id = dragId;
    setOver(null);
    setDragId(null);
    if (!id) return;
    const issue = issues.find((i) => i.id === id);
    if (!issue || issue.status === status) return;
    setIssues((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
    startTransition(() => setIssueStatus(id, status));
  }

  return (
    <div className="board">
      {STATUSES.map((col) => {
        const items = issues.filter((i) => i.status === col.id);
        const pts = items.reduce((s, i) => s + (i.points || 0), 0);
        return (
          <div
            key={col.id}
            className={`column ${over === col.id ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
            onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
            onDrop={(e) => { e.preventDefault(); drop(col.id); }}
          >
            <div className="column-head">
              <span>{col.label} · {items.length}</span>
              <span title="Story points">{pts} pts</span>
            </div>
            {items.map((i) => (
              <Link
                key={i.id}
                href={`/issues/${i.id}`}
                draggable
                onDragStart={(e) => { setDragId(i.id); e.dataTransfer.effectAllowed = "move"; }}
                onDragEnd={() => { setDragId(null); setOver(null); }}
                className={`card ${dragId === i.id ? "dragging" : ""}`}
              >
                <div className="card-title">{i.title}</div>
                <div className="card-foot">
                  <TypeIcon type={i.type} />
                  <span className="key">{issueKey(i.id)}</span>
                  <Priority priority={i.priority} />
                  <Points points={i.points} />
                  <Avatar name={i.assignee_name} email={i.assignee_email} />
                </div>
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}
