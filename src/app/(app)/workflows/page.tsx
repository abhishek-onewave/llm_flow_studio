import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WorkflowsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Workflows"
        description="Manage your AI workflow pipelines."
        actions={
          <Link href="/workflows/builder?new=1">
            <Button>New workflow</Button>
          </Link>
        }
      />
      <div className="mt-6 rounded-md border border-hairline bg-surface-card p-10 text-center">
        <p className="text-sm text-mute">No workflows yet. Create your first one to get started.</p>
      </div>
    </div>
  );
}
