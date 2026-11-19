import { TYPES, PRIORITIES, STATUSES, label, icon, colorFor, initials } from "@/lib/constants";

export function TypeIcon({ type }) {
  return (
    <span className={`type type-${type}`} title={label(TYPES, type)}>
      {icon(TYPES, type)}
    </span>
  );
}

export function Priority({ priority }) {
  return (
    <span className={`prio prio-${priority}`} title={`Prioridade: ${label(PRIORITIES, priority)}`}>
      {icon(PRIORITIES, priority)}
    </span>
  );
}

export function Status({ status }) {
  return <span className={`status status-${status}`}>{label(STATUSES, status)}</span>;
}

export function Points({ points }) {
  return <span className="points" title="Story points">{points ?? "–"}</span>;
}

export function Avatar({ name, email, size = 24 }) {
  if (!name) {
    return (
      <span className="avatar avatar-empty" style={{ width: size, height: size, fontSize: size * 0.42 }} title="Sem responsável">
        ?
      </span>
    );
  }
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: colorFor(email || name) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
