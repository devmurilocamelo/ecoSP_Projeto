import "./globals.css";
import { PROJECT_NAME } from "@/lib/constants";

export const metadata = {
  title: `${PROJECT_NAME} · Gestão Ágil`,
  description: "Plataforma colaborativa de gestão ágil: backlog, sprints e quadro Kanban.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
