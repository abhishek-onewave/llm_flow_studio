"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Layers,
  Cpu,
  Wrench,
  Globe,
  Plug,
  Shield,
  Code2,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

/* ------------------------------------------------------------------ */
/*  Sidebar nav                                                        */
/* ------------------------------------------------------------------ */

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarSection {
  heading: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    heading: "Learn",
    items: [
      { id: "getting-started", label: "Getting started", icon: BookOpen },
      { id: "workflow-builder", label: "Workflow builder", icon: Layers },
      { id: "llm-nodes", label: "LLM nodes", icon: Cpu },
      { id: "tool-nodes", label: "Tool nodes", icon: Wrench },
    ],
  },
  {
    heading: "Configure",
    items: [
      { id: "model-providers", label: "Model providers", icon: Globe },
      { id: "integrations", label: "Integrations", icon: Plug },
      { id: "security", label: "Security", icon: Shield },
    ],
  },
  {
    heading: "Reference",
    items: [
      { id: "api-reference", label: "API reference", icon: Code2 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Right TOC                                                          */
/* ------------------------------------------------------------------ */

const tocItems = [
  "Create a workflow",
  "Add your first LLM node",
  "Connect nodes with arrows",
  "Configure instructions",
  "Run the workflow",
  "Inspect outputs",
];

/* ------------------------------------------------------------------ */
/*  Callout                                                            */
/* ------------------------------------------------------------------ */

type CalloutVariant = "tip" | "success" | "warning" | "note";

const calloutConfig: Record<
  CalloutVariant,
  { bg: string; border: string; icon: React.ElementType; iconColor: string; label: string }
> = {
  tip: {
    bg: "bg-accent-blue-soft",
    border: "border-l-accent-blue",
    icon: Lightbulb,
    iconColor: "text-accent-blue",
    label: "Tip",
  },
  success: {
    bg: "bg-accent-green-soft",
    border: "border-l-accent-green",
    icon: CheckCircle2,
    iconColor: "text-accent-green",
    label: "Success",
  },
  warning: {
    bg: "bg-accent-red-soft",
    border: "border-l-accent-red",
    icon: AlertTriangle,
    iconColor: "text-accent-red",
    label: "Warning",
  },
  note: {
    bg: "bg-accent-purple-soft",
    border: "border-l-accent-purple",
    icon: Info,
    iconColor: "text-accent-purple",
    label: "Note",
  },
};

function Callout({ variant, children }: { variant: CalloutVariant; children: React.ReactNode }) {
  const c = calloutConfig[variant];
  const Icon = c.icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-md border-l-[3px] px-4 py-3", c.bg, c.border)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", c.iconColor)} />
      <div>
        <p className="text-[11px] font-bold text-ink">{c.label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-body">{children}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline code chip                                                   */
/* ------------------------------------------------------------------ */

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[2px] bg-surface-soft px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink">
      {children}
    </code>
  );
}

/* ------------------------------------------------------------------ */
/*  Code block                                                         */
/* ------------------------------------------------------------------ */

const codeSnippet = `{
  "name": "product-researcher",
  "nodes": [
    {
      "id": "input-1",
      "type": "input",
      "data": { "label": "User Query" }
    },
    {
      "id": "llm-1",
      "type": "openai",
      "data": {
        "model": "gpt-4o",
        "temperature": 0.7,
        "systemPrompt": "You are a product researcher.",
        "promptTemplate": "Research: {{workflow.input}}"
      }
    },
    {
      "id": "llm-2",
      "type": "claude",
      "data": {
        "model": "claude-sonnet-4",
        "systemPrompt": "Critique the research.",
        "promptTemplate": "Review: {{node.llm-1.output.text}}"
      }
    },
    {
      "id": "output-1",
      "type": "output",
      "data": { "label": "Final Report" }
    }
  ]
}`;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="flex">
      {/* ==== Left sidebar ==== */}
      <nav className="hidden w-[240px] shrink-0 border-r border-hairline-soft lg:block">
        <div className="sticky top-0 flex flex-col gap-5 py-6 pl-2 pr-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
            <input
              type="text"
              placeholder="Ask LLM Flow AI..."
              aria-label="Search documentation"
              className="h-8 w-full rounded-md border border-hairline bg-surface-card pl-9 pr-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none"
            />
          </div>

          {/* Sections */}
          {sidebarSections.map((section) => (
            <div key={section.heading}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-mute">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-xs transition-colors",
                          isActive
                            ? "bg-surface-soft font-semibold text-ink"
                            : "text-body hover:bg-surface-soft/50 hover:text-ink",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Sidebar mascot */}
          <div className="flex flex-col items-center pt-4">
            <MascotPlaceholder size="sm" mood="happy" />
            <p className="mt-1 text-[9px] text-mute">v1.0.0-alpha</p>
          </div>
        </div>
      </nav>

      {/* ==== Center article ==== */}
      <article className="min-w-0 max-w-[720px] flex-1 py-6 pl-8 pr-4">
        {/* Breadcrumb */}
        <p className="text-[10px] text-mute">
          Docs <span className="mx-1">/</span> Getting started
        </p>

        {/* Article title */}
        <div className="relative mt-3">
          {/* Mascot in margin */}
          <div className="absolute -right-2 -top-2 hidden xl:block">
            <MascotPlaceholder size="sm" mood="happy" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Build your first multi-model workflow</h1>
          <p className="mt-2 text-sm leading-relaxed text-body">
            This guide walks you through creating a workflow that chains multiple LLM providers together.
            You&apos;ll learn how to add nodes, connect them, configure instructions, and inspect outputs.
          </p>
        </div>

        {/* ---- Section 1 ---- */}
        <section className="mt-8">
          <h2 id="create-workflow" className="text-lg font-bold text-ink">1. Create a workflow</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              From the dashboard, click <InlineCode>New Workflow</InlineCode>. Give it a name
              like &quot;Product Researcher&quot; and you&apos;ll land on the visual builder canvas with
              an empty workspace.
            </p>
          </div>
        </section>

        {/* ---- Section 2 ---- */}
        <section className="mt-8">
          <h2 id="add-llm-node" className="text-lg font-bold text-ink">2. Add your first LLM node</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              Open the node palette on the left and drag an <strong>OpenAI</strong> node onto the canvas.
              The node will appear with a default configuration. You can also drag a <strong>Claude</strong> or
              <strong> Gemini</strong> node to build a multi-model chain.
            </p>
          </div>

          <div className="mt-3">
            <Callout variant="tip">
              Use variable chips like <InlineCode>workflow.input</InlineCode> in your prompt templates
              to pass data between nodes dynamically.
            </Callout>
          </div>
        </section>

        {/* ---- Section 3 ---- */}
        <section className="mt-8">
          <h2 id="connect-nodes" className="text-lg font-bold text-ink">3. Connect nodes with arrows</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              Click and drag from the output handle (right side) of one node to the input handle (left side)
              of another. The arrow defines data flow — the output of the first node becomes available as
              <InlineCode>node.output.text</InlineCode> in the next node&apos;s prompt template.
            </p>
          </div>
        </section>

        {/* ---- Section 4 ---- */}
        <section className="mt-8">
          <h2 id="configure-instructions" className="text-lg font-bold text-ink">4. Configure instructions</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              Click any node to open the inspector on the right. Set the system prompt, user prompt template,
              model, temperature, and max tokens. Here&apos;s an example workflow configuration:
            </p>
          </div>

          {/* Dark code block */}
          <div className="mt-3 overflow-hidden rounded-md bg-surface-dark">
            <div className="flex items-center justify-between border-b border-[#33342d] px-4 py-2">
              <span className="text-[10px] font-medium text-mute">workflow.json</span>
              <button aria-label="Copy code" className="text-[10px] text-mute transition-colors hover:text-on-dark">Copy</button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-on-dark">
              <code>{codeSnippet}</code>
            </pre>
          </div>

          <div className="mt-3">
            <Callout variant="note">
              Model availability depends on your configured API keys in Settings &gt; Secrets.
              You can add multiple providers and switch between them per node.
            </Callout>
          </div>
        </section>

        {/* ---- Section 5 ---- */}
        <section className="mt-8">
          <h2 id="run-workflow" className="text-lg font-bold text-ink">5. Run the workflow</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              Click <InlineCode>Run workflow</InlineCode> in the top toolbar. Nodes execute in topological order —
              each node waits for its upstream dependencies to complete before starting. You can watch
              progress in the bottom run console.
            </p>
          </div>

          <div className="mt-3">
            <Callout variant="success">
              Workflows are saved to localStorage automatically. Your work persists
              across browser sessions on this device.
            </Callout>
          </div>
        </section>

        {/* ---- Section 6 ---- */}
        <section className="mt-8">
          <h2 id="inspect-outputs" className="text-lg font-bold text-ink">6. Inspect outputs</h2>
          <div className="mt-3 rounded-md border border-hairline bg-surface-doc p-5">
            <p className="text-sm leading-relaxed text-body">
              After a run completes, click any node to view its output in the inspector panel.
              The Output tab shows the generated text, the Logs tab shows timing and token usage,
              and the Cost tab shows the estimated cost breakdown. You can reference any node&apos;s output
              using <InlineCode>node.output.text</InlineCode> in downstream nodes.
            </p>
          </div>

          <div className="mt-3">
            <Callout variant="warning">
              Database and file-write operations require explicit approval when running workflows.
              Enable the Human Approval node for any destructive operations.
            </Callout>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="mt-12 border-t border-hairline-soft pt-6">
          <p className="text-xs text-mute">
            Was this page helpful? Let us know at <span className="font-medium text-accent-blue">feedback@llmflow.studio</span>
          </p>
        </div>

        <div className="h-8" />
      </article>

      {/* ==== Right TOC ==== */}
      <aside className="hidden w-[200px] shrink-0 xl:block">
        <div className="sticky top-0 py-6 pl-4 pr-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-mute">On this page</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {tocItems.map((item, i) => (
              <li key={item}>
                <a
                  href={`#${["create-workflow", "add-llm-node", "connect-nodes", "configure-instructions", "run-workflow", "inspect-outputs"][i]}`}
                  className="block text-[11px] leading-snug text-body transition-colors hover:text-ink"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
