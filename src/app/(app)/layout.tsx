import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceProvider } from "@/lib/hooks/use-workspace";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
