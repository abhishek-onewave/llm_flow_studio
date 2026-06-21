import { DocsShell } from "@/components/layout/docs-shell";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
