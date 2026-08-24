import { DashboardShell } from "@/components/dashboard-shell";
import { requireWorkspace } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, workspace, membership } = await requireWorkspace();
  return <DashboardShell user={{ name: user.name, email: user.email }} workspace={workspace.name} role={membership.role}>{children}</DashboardShell>;
}
