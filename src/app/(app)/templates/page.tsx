"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowRight,
  Clock,
  FileText,
  Code2,
  Globe,
  MessageSquare,
  Database,
  Bot,
  Zap,
  Star,
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

/* ------------------------------------------------------------------ */
/*  Extended mock templates (matches user spec)                        */
/* ------------------------------------------------------------------ */

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodeCount: number;
  setupMinutes: number;
  icon: React.ElementType;
  miniWorkflow: string[];
  featured?: boolean;
}

const templates: Template[] = [
  {
    id: "tpl-product-researcher",
    name: "Multi-model Product Researcher",
    description: "A powerful chain that gathers data with GPT, critiques with Claude, synthesizes with Gemini, and outputs a structured report.",
    category: "Research",
    tags: ["GPT-4o", "Claude", "Gemini", "multi-model"],
    nodeCount: 5,
    setupMinutes: 5,
    icon: Globe,
    miniWorkflow: ["Search", "GPT", "Claude", "Gemini", "Output"],
    featured: true,
  },
  {
    id: "tpl-doc-summary",
    name: "Document Summary Chain",
    description: "Upload a document, extract key sections, and generate a structured summary with an LLM.",
    category: "Document analysis",
    tags: ["RAG", "GPT-4o", "file_reader"],
    nodeCount: 4,
    setupMinutes: 2,
    icon: FileText,
    miniWorkflow: ["File", "Parse", "GPT", "Output"],
  },
  {
    id: "tpl-contract-risk",
    name: "Contract Risk Review",
    description: "Parse legal contracts, identify high-risk clauses, and generate a risk assessment report.",
    category: "Document analysis",
    tags: ["Claude", "legal", "analysis"],
    nodeCount: 6,
    setupMinutes: 3,
    icon: FileText,
    miniWorkflow: ["File", "Parse", "Claude", "Risk", "Summary", "Output"],
  },
  {
    id: "tpl-pr-review",
    name: "GitHub PR Review",
    description: "Fetch a PR diff from GitHub, run AI code review, and post feedback as a comment.",
    category: "Coding",
    tags: ["GitHub", "Claude", "code_review"],
    nodeCount: 6,
    setupMinutes: 3,
    icon: GitPullRequest,
    miniWorkflow: ["Input", "GitHub", "Claude", "Condition", "Post", "Output"],
  },
  {
    id: "tpl-blog-post",
    name: "Blog Post Generator",
    description: "Generate SEO-optimized blog posts from an outline with editorial review and formatting.",
    category: "Marketing",
    tags: ["GPT-4o", "SEO", "content"],
    nodeCount: 5,
    setupMinutes: 2,
    icon: MessageSquare,
    miniWorkflow: ["Input", "GPT", "Edit", "Format", "Output"],
  },
  {
    id: "tpl-research-brief",
    name: "Research Brief Builder",
    description: "Search the web, summarize findings, and produce a structured research brief.",
    category: "Research",
    tags: ["web_search", "GPT-4o", "Gemini"],
    nodeCount: 7,
    setupMinutes: 4,
    icon: Globe,
    miniWorkflow: ["Input", "Search", "GPT", "Gemini", "Merge", "Format", "Output"],
  },
  {
    id: "tpl-sql-assistant",
    name: "SQL Query Assistant",
    description: "Convert natural language questions into SQL queries and execute them against your database.",
    category: "Data",
    tags: ["GPT-4o", "PostgreSQL", "database"],
    nodeCount: 4,
    setupMinutes: 3,
    icon: Database,
    miniWorkflow: ["Input", "GPT", "DB", "Output"],
  },
  {
    id: "tpl-support-router",
    name: "Customer Support Router",
    description: "Classify incoming tickets, draft responses, and escalate high-priority issues automatically.",
    category: "Support",
    tags: ["Claude", "classification", "Slack"],
    nodeCount: 5,
    setupMinutes: 3,
    icon: MessageSquare,
    miniWorkflow: ["Input", "Claude", "Route", "Draft", "Output"],
  },
  {
    id: "tpl-prd-tasks",
    name: "Product Spec to Tasks",
    description: "Convert product requirements into a technical architecture and granular task breakdown.",
    category: "Coding",
    tags: ["GPT-4o", "engineering", "planning"],
    nodeCount: 6,
    setupMinutes: 4,
    icon: Code2,
    miniWorkflow: ["Input", "Parse", "GPT", "Arch", "Tasks", "Output"],
  },
  {
    id: "tpl-vercel-deploy",
    name: "Vercel Deploy Assistant",
    description: "Validate code, run checks, and trigger a Vercel deployment with status monitoring.",
    category: "Coding",
    tags: ["Vercel", "GitHub", "automation"],
    nodeCount: 5,
    setupMinutes: 3,
    icon: Zap,
    miniWorkflow: ["Input", "GitHub", "Check", "Vercel", "Output"],
  },
  {
    id: "tpl-agent-loop",
    name: "Autonomous Agent Loop",
    description: "A recursive agent that plans, executes tools, evaluates results, and iterates until the goal is met.",
    category: "Agents",
    tags: ["Claude", "tool_use", "recursive"],
    nodeCount: 8,
    setupMinutes: 6,
    icon: Bot,
    miniWorkflow: ["Input", "Plan", "Tool", "Eval", "Loop", "Output"],
  },
];

const filterCategories = ["All", "Document analysis", "Coding", "Research", "Marketing", "Data", "Support", "Agents"];

/* ------------------------------------------------------------------ */
/*  Mini workflow diagram                                              */
/* ------------------------------------------------------------------ */

function MiniWorkflow({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <span className="shrink-0 rounded bg-surface-soft px-1.5 py-0.5 text-[9px] font-medium text-mute">
            {step}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight className="mx-0.5 h-2.5 w-2.5 shrink-0 text-hairline" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.tags.some((tag) => tag.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [selectedCategory, search]);

  const featured = filtered.find((t) => t.featured);
  const grid = filtered.filter((t) => !t.featured);

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Templates</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Start with a workflow that already works.</h1>
          <p className="mt-1 text-sm text-body">
            Pick a template, connect your models, and customize every node.
          </p>
        </div>
        <Link
          href="/workflows/builder"
          className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8 sm:w-auto sm:justify-start"
        >
          <Plus className="h-3.5 w-3.5" />
          Create blank workflow
        </Link>
      </div>

      {/* ---- Search + Filter pills ---- */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            aria-label="Search templates"
            className="h-8 w-full rounded-md border border-hairline bg-surface-card pl-9 pr-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none"
          />
        </div>
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Filter templates by category">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              role="radio"
              aria-checked={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-ink text-on-dark"
                  : "border border-hairline bg-surface-card text-body hover:bg-surface-soft",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Featured template card ---- */}
      {featured && (
        <div className="mt-5">
          <div className="relative rounded-md border border-hairline bg-surface-card p-6">
            {/* Mascot peeking over top-right */}
            <div className="absolute -top-5 right-6">
              <MascotPlaceholder size="sm" mood="happy" />
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-primary-cta" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-cta">Featured</span>
            </div>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-lg">
                <h2 className="text-base font-bold text-ink">{featured.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-body">{featured.description}</p>

                <div className="mt-3">
                  <MiniWorkflow steps={featured.miniWorkflow} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-mute">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <Link
                  href="/workflows/builder"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary-cta px-4 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed"
                >
                  Use this template
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="flex items-center gap-1 text-[10px] text-mute">
                  <Clock className="h-3 w-3" />
                  {featured.setupMinutes} min setup
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Template grid ---- */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div key={tpl.id} className="flex flex-col rounded-md border border-hairline bg-surface-card p-6">
              {/* Icon + category */}
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-soft">
                  <Icon className="h-4 w-4 text-mute" />
                </div>
                <span className="text-[10px] font-medium text-mute">{tpl.category}</span>
              </div>

              {/* Title */}
              <h3 className="mt-3 text-sm font-semibold text-ink">{tpl.name}</h3>

              {/* Description */}
              <p className="mt-1 flex-1 text-[11px] leading-relaxed text-body">{tpl.description}</p>

              {/* Mini workflow */}
              <div className="mt-3">
                <MiniWorkflow steps={tpl.miniWorkflow} />
              </div>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-soft px-2 py-0.5 text-[9px] font-medium text-mute">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer: use template + setup time */}
              <div className="mt-3 flex items-center justify-between border-t border-hairline-soft pt-3">
                <Link
                  href="/workflows/builder"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink transition-colors hover:text-primary-cta"
                >
                  Use template
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span className="flex items-center gap-1 text-[10px] text-mute">
                  <Clock className="h-2.5 w-2.5" />
                  {tpl.setupMinutes} min setup
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center">
          <MascotPlaceholder size="sm" mood="thinking" />
          <p className="mt-3 text-xs text-mute">No templates match your search.</p>
        </div>
      )}
    </div>
  );
}
