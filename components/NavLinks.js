"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/backlog", label: "Backlog", icon: "☰" },
  { href: "/board", label: "Quadro da Sprint", icon: "▦" },
  { href: "/reports", label: "Relatórios", icon: "📈" },
  { href: "/team", label: "Time", icon: "👥" },
];

export default function NavLinks() {
  const path = usePathname();
  return LINKS.map((l) => (
    <Link key={l.href} href={l.href} className={`nav-link ${path.startsWith(l.href) ? "active" : ""}`}>
      <span className="nav-icon">{l.icon}</span>
      {l.label}
    </Link>
  ));
}
