import { DashboardShell } from "@/components/dashboard-shell";
import { requireWorkspace } from "@/lib/auth";
import { validateRuntimeConfig } from "@/lib/runtime-config";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, workspace, membership } = await requireWorkspace();
  const { publicDemo } = validateRuntimeConfig();
  return <DashboardShell user={{ name: user.name, email: user.email }} workspace={workspace.name} role={membership.role} publicDemo={publicDemo}>{children}</DashboardShell>;
}
