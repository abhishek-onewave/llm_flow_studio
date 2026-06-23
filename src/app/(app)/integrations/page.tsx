"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  GitBranch,
  Globe,
  Database,
  MessageSquare,
  FileText,
  HardDrive,

  Code2,
  Zap,
  Upload,
  Shield,
  CheckCircle,
  Lock,
  Eye,
  Settings2,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type IntegrationStatus = "connected" | "not_connected" | "beta";
type FilterCategory = "All" | "Files" | "Code" | "Deployment" | "Databases" | "APIs" | "Search" | "Local tools";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: FilterCategory;
  icon: React.ElementType;
  iconColor: string;
  status: IntegrationStatus;
  permission: string;
  permissionIcon: React.ElementType;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const integrations: Integration[] = [
  {
    id: "int-github",
    name: "GitHub",
    description: "Read repositories, create issues, and open pull requests directly from agents.",
    category: "Code",
    icon: GitBranch,
    iconColor: "bg-ink text-on-dark",
    status: "connected",
    permission: "Read/Write",
    permissionIcon: Unlock,
  },
  {
    id: "int-vercel",
    name: "Vercel",
    description: "Deploy previews, check build status, and trigger production deployments.",
    category: "Deployment",
    icon: Globe,
    iconColor: "bg-ink text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-postgres",
    name: "PostgreSQL",
    description: "Execute SQL queries securely with schema-aware agents.",
    category: "Databases",
    icon: Database,
    iconColor: "bg-accent-blue text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-supabase",
    name: "Supabase",
    description: "Connect for database and storage access with row-level security.",
    category: "Databases",
    icon: Zap,
    iconColor: "bg-accent-green text-on-dark",
    status: "not_connected",
    permission: "Configurable",
    permissionIcon: Lock,
  },
  {
    id: "int-mysql",
    name: "MySQL",
    description: "Connect to MySQL databases for read and write operations.",
    category: "Databases",
    icon: Database,
    iconColor: "bg-accent-blue text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-mongodb",
    name: "MongoDB",
    description: "Query and update MongoDB collections from workflow agents.",
    category: "Databases",
    icon: Database,
    iconColor: "bg-accent-green text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-file-uploads",
    name: "File Uploads",
    description: "Upload and manage files used by workflow nodes for processing.",
    category: "Files",
    icon: Upload,
    iconColor: "bg-primary-cta text-on-primary",
    status: "connected",
    permission: "Read/Write",
    permissionIcon: Unlock,
  },
  {
    id: "int-local-file",
    name: "Local File Agent",
    description: "Safely parse and analyze local CSV, JSON, and text files.",
    category: "Local tools",
    icon: FileText,
    iconColor: "bg-surface-soft text-ink",
    status: "beta",
    permission: "Sandboxed",
    permissionIcon: Shield,
  },
  {
    id: "int-http-api",
    name: "HTTP API",
    description: "Connect to any RESTful API with configurable headers and auth.",
    category: "APIs",
    icon: Code2,
    iconColor: "bg-accent-purple text-on-dark",
    status: "not_connected",
    permission: "Custom",
    permissionIcon: Settings2,
  },
  {
    id: "int-web-search",
    name: "Web Search",
    description: "Allow agents to search the web for real-time information.",
    category: "Search",
    icon: Globe,
    iconColor: "bg-accent-blue text-on-dark",
    status: "connected",
    permission: "External Access",
    permissionIcon: Globe,
  },
  {
    id: "int-vector-db",
    name: "Vector Database",
    description: "Semantic search and RAG via Pinecone, Weaviate, or Qdrant.",
    category: "Databases",
    icon: Database,
    iconColor: "bg-accent-purple text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-slack",
    name: "Slack",
    description: "Send messages, create channels, and receive workflow notifications.",
    category: "APIs",
    icon: MessageSquare,
    iconColor: "bg-accent-purple text-on-dark",
    status: "not_connected",
    permission: "Configurable",
    permissionIcon: Lock,
  },
  {
    id: "int-google-drive",
    name: "Google Drive",
    description: "Read and upload files from Google Drive for document workflows.",
    category: "Files",
    icon: HardDrive,
    iconColor: "bg-accent-blue text-on-dark",
    status: "not_connected",
    permission: "Read-only default",
    permissionIcon: Eye,
  },
  {
    id: "int-notion",
    name: "Notion",
    description: "Read and write to Notion pages, databases, and wikis.",
    category: "APIs",
    icon: FileText,
    iconColor: "bg-ink text-on-dark",
    status: "not_connected",
    permission: "Configurable",
    permissionIcon: Lock,
  },
];

const filterCategories: FilterCategory[] = [
  "All", "Files", "Code", "Deployment", "Databases", "APIs", "Search", "Local tools",
];

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusChip({ status }: { status: IntegrationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "connected" && "bg-accent-green-soft text-accent-green",
        status === "not_connected" && "bg-surface-soft text-mute",
        status === "beta" && "bg-primary-cta/10 text-primary-cta",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "connected" && "bg-accent-green",
          status === "not_connected" && "bg-ash",
          status === "beta" && "bg-primary-cta",
        )}
        aria-hidden="true"
      />
      {status === "connected" && "Connected"}
      {status === "not_connected" && "Not connected"}
      {status === "beta" && "Beta"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Integration card                                                   */
/* ------------------------------------------------------------------ */

function IntegrationCard({ item }: { item: Integration }) {
  const Icon = item.icon;
  const PermIcon = item.permissionIcon;
  const isConnected = item.status === "connected";

  return (
    <div className="flex flex-col rounded-md border border-hairline bg-surface-card p-6">
      {/* Top: icon + status */}
      <div className="flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", item.iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <StatusChip status={item.status} />
      </div>

      {/* Name */}
      <h3 className="mt-3 text-sm font-semibold text-ink">{item.name}</h3>

      {/* Description */}
      <p className="mt-1 flex-1 text-[11px] leading-relaxed text-body">{item.description}</p>

      {/* Permission */}
      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-mute">
        <PermIcon className="h-3 w-3" />
        {item.permission}
      </div>

      {/* Action */}
      <div className="mt-3 border-t border-hairline-soft pt-3">
        <button
          className={cn(
            "w-full rounded-md py-1.5 text-[11px] font-semibold transition-colors",
            isConnected
              ? "border border-hairline bg-surface-card text-body hover:bg-surface-soft"
              : "bg-primary-cta text-on-primary hover:bg-primary-pressed",
          )}
        >
          {isConnected ? "Manage" : "Connect"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Security card                                                      */
/* ------------------------------------------------------------------ */

const securityPoints = [
  "Every integration is permission-gated.",
  "Read-only by default.",
  "Approval required for writes.",
  "Secrets encrypted.",
  "Audit log for every tool call.",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return integrations.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [selectedCategory, search]);

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Integrations</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Connect workflows to the tools you already use.</h1>
          <p className="mt-1 text-sm text-body">
            Grant LLM chains controlled access to files, GitHub, Vercel, databases, APIs, and deployment tools.
          </p>
        </div>
        <button className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8 sm:w-auto sm:justify-start">
          <Plus className="h-3.5 w-3.5" />
          Request integration
        </button>
      </div>

      {/* ---- Search + Filter pills ---- */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            aria-label="Search integrations"
            className="h-8 w-full rounded-md border border-hairline bg-surface-card pl-9 pr-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Filter by category">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              role="radio"
              aria-checked={selectedCategory === cat}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
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

      {/* ---- Security card ---- */}
      <div className="mt-5">
        <div className="relative rounded-md border border-hairline bg-surface-card p-6">
          {/* Mascot peeking over top-right */}
          <div className="absolute -top-5 right-6">
            <MascotPlaceholder size="sm" mood="neutral" />
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary-cta" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-cta">Security</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {securityPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-accent-green" />
                <span className="text-xs text-body">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Integration grid ---- */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <IntegrationCard key={item.id} item={item} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center">
          <MascotPlaceholder size="sm" mood="thinking" />
          <p className="mt-3 text-xs text-mute">No integrations match your search.</p>
        </div>
      )}
    </div>
  );
}
