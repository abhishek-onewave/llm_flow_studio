"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceContextValue {
  user: User | null;
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  user: null,
  workspace: null,
  workspaceId: null,
  loading: true,
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (cancelled || !authUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      setUser(authUser);

      // Get the user's first workspace via workspace_members
      const { data: membership } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, name, slug)")
        .eq("user_id", authUser.id)
        .limit(1)
        .single();

      if (cancelled) return;

      if (membership?.workspaces) {
        const ws = membership.workspaces as unknown as Workspace;
        setWorkspace(ws);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspace,
        workspaceId: workspace?.id ?? null,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
