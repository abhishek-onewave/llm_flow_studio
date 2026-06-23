"use client";

import { useState } from "react";
import { AppTopNav } from "./app-top-nav";
import { AppSidebar } from "./app-sidebar";
import { useWorkspace } from "@/lib/hooks/use-workspace";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, workspace } = useWorkspace();

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <AppTopNav
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        userEmail={user?.email ?? null}
        workspaceName={workspace?.name ?? null}
      />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
