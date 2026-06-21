import Link from "next/link";
import { PublicMarketingNav } from "@/components/layout/public-marketing-nav";
import { Footer } from "@/components/layout/footer";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import {
  Blocks,
  Eye,
  GitBranch,
  Plug,
  Zap,
  FileText,
  ArrowRight,
  Bot,
  Database,
  Globe,
  Code2,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mini-workflow preview node                                         */
/* ------------------------------------------------------------------ */
function WorkflowNode({
  label,
  type,
  color,
}: {
  label: string;
  type: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-md border border-hairline bg-surface-card"
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        {type === "file" && <FileText size={20} className="text-body" />}
        {type === "openai" && (
          <span className="text-sm font-bold text-body">AI</span>
        )}
        {type === "claude" && (
          <span className="text-sm font-bold text-body">C</span>
        )}
        {type === "gemini" && (
          <span className="text-sm font-bold text-body">G</span>
        )}
        {type === "output" && <CheckCircle2 size={20} className="text-body" />}
      </div>
      <span className="text-xs font-medium text-mute">{label}</span>
    </div>
  );
}

function WorkflowArrow() {
  return (
    <div className="flex items-center px-1 pb-5">
      <div className="h-px w-6 bg-hairline sm:w-8" />
      <ArrowRight size={14} className="text-hairline" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                       */
/* ------------------------------------------------------------------ */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-surface-soft">
        {icon}
      </div>
      <h3 className="text-lg font-semibold leading-snug text-ink">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-body">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Workflow example step                                              */
/* ------------------------------------------------------------------ */
function ExampleStep({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-cta text-sm font-bold text-on-primary">
        {step}
      </div>
      <div>
        <h4 className="text-base font-semibold text-ink">{title}</h4>
        <p className="mt-0.5 text-[15px] leading-relaxed text-body">{desc}</p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Landing Page                                                       */
/* ================================================================== */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PublicMarketingNav />

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 md:pt-20">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wide text-mute">
              Visual LLM Workflows
            </span>
            <h1 className="mt-4 max-w-3xl text-xl font-bold leading-[1.35] tracking-tight text-ink sm:text-[28px] md:text-[36px] md:leading-[1.4]">
              Build AI workflows by connecting LLMs like blocks.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-[1.6] text-body sm:text-[16px]">
              Drag OpenAI, Claude, Gemini, files, GitHub, Vercel, databases, and
              APIs onto a canvas. Connect them, add instructions, run the whole
              workflow, and inspect every output.
            </p>
            <div className="mt-6 flex w-full flex-col items-center gap-3 sm:mt-8 sm:w-auto sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary-cta px-5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-10 sm:w-auto"
              >
                Start building &mdash; free
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-surface-soft px-4 text-sm font-bold text-ink transition-colors hover:bg-hairline-soft sm:h-10 sm:w-auto"
              >
                View templates
              </Link>
            </div>
          </div>
        </section>

        {/* ── Product preview — mini workflow canvas ─────────────── */}
        <section className="mx-auto max-w-[1280px] px-4 pb-12 sm:px-6 md:pb-20">
          <div className="rounded-md border border-hairline bg-surface-card p-4 sm:p-6 md:p-8">
            {/* Toolbar mock */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent-red opacity-60" />
                <div className="h-3 w-3 rounded-full bg-primary-cta opacity-60" />
                <div className="h-3 w-3 rounded-full bg-accent-green opacity-60" />
              </div>
              <span className="text-xs font-medium text-mute">
                Contract Review Chain
              </span>
            </div>

            {/* Canvas area */}
            <div className="flex items-start justify-center overflow-x-auto rounded-md border border-hairline-soft bg-canvas px-4 py-8 sm:px-8 sm:py-12">
              <div className="flex items-start">
                <WorkflowNode
                  label="File Reader"
                  type="file"
                  color="#2c84e0"
                />
                <WorkflowArrow />
                <WorkflowNode
                  label="OpenAI"
                  type="openai"
                  color="#2c8c66"
                />
                <WorkflowArrow />
                <WorkflowNode label="Claude" type="claude" color="#7c44a6" />
                <WorkflowArrow />
                <WorkflowNode label="Gemini" type="gemini" color="#2c84e0" />
                <WorkflowArrow />
                <WorkflowNode
                  label="Output"
                  type="output"
                  color="#f7a501"
                />
              </div>
            </div>

            {/* Status bar mock */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded-full bg-accent-green-soft px-2 text-[11px] font-semibold text-accent-green">
                  Completed
                </span>
                <span className="text-xs text-mute">5 nodes &middot; 3.2s</span>
              </div>
              <span className="text-xs text-mute">18,420 tokens &middot; $0.29</span>
            </div>
          </div>
        </section>

        {/* ── Feature grid ──────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="mb-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wide text-mute">
              Capabilities
            </span>
            <h2 className="mt-2 text-[24px] font-bold leading-tight text-ink">
              Everything you need to build LLM pipelines
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Blocks size={20} className="text-ink" />}
              title="Visual Canvas Builder"
              desc="Drag-and-drop nodes onto an infinite canvas. Connect them with edges to define your data flow."
            />
            <FeatureCard
              icon={<Bot size={20} className="text-ink" />}
              title="Multi-Model Orchestration"
              desc="Chain OpenAI, Claude, Gemini, and Mistral in a single workflow. Use each model where it excels."
            />
            <FeatureCard
              icon={<Eye size={20} className="text-ink" />}
              title="Node Inspector"
              desc="Click any node to configure prompts, view outputs, and tune parameters in a live side panel."
            />
            <FeatureCard
              icon={<Zap size={20} className="text-ink" />}
              title="Mock Execution"
              desc="Run workflows with simulated streaming output. Test your logic before connecting real APIs."
            />
            <FeatureCard
              icon={<GitBranch size={20} className="text-ink" />}
              title="Conditional Branching"
              desc="Add condition nodes to route data based on LLM output. Build workflows with if/else logic."
            />
            <FeatureCard
              icon={<Plug size={20} className="text-ink" />}
              title="Tool Integrations"
              desc="Connect GitHub, Vercel, databases, web search, file readers, and HTTP APIs as workflow nodes."
            />
          </div>
        </section>

        {/* ── Workflow example section ──────────────────────────── */}
        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — explanation */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-mute">
                How it works
              </span>
              <h2 className="mt-2 text-[24px] font-bold leading-tight text-ink">
                From idea to running pipeline in minutes
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-body">
                Build complex multi-model workflows without writing integration
                code. Every step is visible, configurable, and inspectable.
              </p>
              <div className="mt-8 flex flex-col gap-6">
                <ExampleStep
                  step="1"
                  title="Drag nodes onto the canvas"
                  desc="Pick from LLM models, file readers, APIs, databases, and tool nodes."
                />
                <ExampleStep
                  step="2"
                  title="Connect and configure"
                  desc="Draw edges between nodes. Click to set prompts, models, and parameters."
                />
                <ExampleStep
                  step="3"
                  title="Run and inspect"
                  desc="Execute the workflow. Watch streaming output node by node. Inspect every intermediate result."
                />
              </div>
            </div>

            {/* Right — code/prompt preview card */}
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-hairline bg-surface-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Code2 size={16} className="text-mute" />
                  <span className="text-xs font-bold uppercase tracking-wide text-mute">
                    System Prompt
                  </span>
                </div>
                <div className="rounded-md bg-surface-dark px-5 py-4">
                  <code className="block font-mono text-sm leading-relaxed text-on-dark">
                    <span className="text-primary-cta">You are</span> a senior
                    code reviewer.{"\n"}
                    Be concise and constructive.{"\n"}
                    Flag security issues as HIGH priority.{"\n"}
                    Suggest fixes for each issue found.
                  </code>
                </div>
              </div>

              <div className="rounded-md border border-hairline bg-surface-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Database size={16} className="text-mute" />
                  <span className="text-xs font-bold uppercase tracking-wide text-mute">
                    Node Output
                  </span>
                </div>
                <div className="space-y-2 text-sm text-body">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-red-soft text-[10px] font-bold text-accent-red">
                      !
                    </span>
                    <span>
                      <strong className="text-ink">HIGH:</strong> SQL query in{" "}
                      <code className="rounded-xs bg-surface-soft px-1.5 py-0.5 font-mono text-xs text-ink">
                        processOrder()
                      </code>{" "}
                      is vulnerable to injection
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-cta/20 text-[10px] font-bold text-primary-cta">
                      !
                    </span>
                    <span>
                      <strong className="text-ink">MEDIUM:</strong> Missing null
                      check before accessing{" "}
                      <code className="rounded-xs bg-surface-soft px-1.5 py-0.5 font-mono text-xs text-ink">
                        user.profile
                      </code>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-blue-soft text-[10px] font-bold text-accent-blue">
                      i
                    </span>
                    <span>
                      <strong className="text-ink">Suggestion:</strong> Extract
                      validation logic into a reusable helper
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product screenshot cards (use cases) ─────────────── */}
        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="mb-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wide text-mute">
              Use Cases
            </span>
            <h2 className="mt-2 text-[24px] font-bold leading-tight text-ink">
              Workflows for every team
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FileText size={20} className="text-ink" />,
                title: "Contract Review",
                desc: "Extract key terms, assess risk, and generate an executive summary from any contract.",
                nodes: "6 nodes",
                models: "GPT-4o + Claude",
              },
              {
                icon: <Code2 size={20} className="text-ink" />,
                title: "Code Review Pipeline",
                desc: "Fetch a PR diff, run AI code review, and post feedback comments automatically.",
                nodes: "6 nodes",
                models: "Claude Sonnet",
              },
              {
                icon: <Globe size={20} className="text-ink" />,
                title: "Research Brief Builder",
                desc: "Search the web, summarize findings, and produce a structured research brief.",
                nodes: "7 nodes",
                models: "GPT-4o + Mistral",
              },
            ].map((uc) => (
              <div
                key={uc.title}
                className="group rounded-md border border-hairline bg-surface-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-surface-soft">
                  {uc.icon}
                </div>
                <h3 className="text-lg font-semibold text-ink">{uc.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-body">
                  {uc.desc}
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-hairline-soft pt-3">
                  <span className="text-xs font-medium text-mute">
                    {uc.nodes}
                  </span>
                  <span className="text-xs text-hairline">&middot;</span>
                  <span className="text-xs font-medium text-mute">
                    {uc.models}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA section ──────────────────────────────────────── */}
        <section className="mx-auto max-w-[1280px] px-6 pb-20">
          <div className="rounded-md border border-hairline bg-surface-card px-6 py-12 text-center sm:px-12 sm:py-16">
            <MascotPlaceholder size="md" mood="working" className="mx-auto" />
            <h2 className="mt-6 text-[24px] font-bold leading-tight text-ink">
              Start building your first workflow
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-body">
              No API keys required for the demo. Drag, connect, run, and inspect
              — all in your browser.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center rounded-full bg-primary-cta px-5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-pressed"
              >
                Start building &mdash; free
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-10 items-center rounded-md bg-surface-soft px-4 text-sm font-bold text-ink transition-colors hover:bg-hairline-soft"
              >
                Browse templates
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
