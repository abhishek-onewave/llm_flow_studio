import type { IntegrationRecord } from "@/types/integrations";

export const mockIntegrations: IntegrationRecord[] = [
  { id: "int-github", name: "GitHub", slug: "github", description: "Fetch repos, PRs, issues, and diffs. Post comments and reviews.", category: "developer_tools", iconSlug: "github", status: "connected", docsUrl: "/docs" },
  { id: "int-vercel", name: "Vercel", slug: "vercel", description: "Deploy previews, check build status, and manage deployments.", category: "cloud", iconSlug: "vercel", status: "disconnected", docsUrl: "/docs" },
  { id: "int-postgres", name: "PostgreSQL", slug: "postgres", description: "Read and write to PostgreSQL databases.", category: "data", iconSlug: "database", status: "connected", docsUrl: "/docs" },
  { id: "int-supabase", name: "Supabase", slug: "supabase", description: "Connect to Supabase for auth, database, and storage.", category: "data", iconSlug: "supabase", status: "disconnected", docsUrl: "/docs" },
  { id: "int-slack", name: "Slack", slug: "slack", description: "Send messages, create channels, and receive notifications.", category: "communication", iconSlug: "slack", status: "disconnected", docsUrl: "/docs" },
  { id: "int-notion", name: "Notion", slug: "notion", description: "Read and write to Notion pages and databases.", category: "communication", iconSlug: "notion", status: "disconnected", docsUrl: "/docs" },
  { id: "int-google-drive", name: "Google Drive", slug: "google-drive", description: "Read and upload files from Google Drive.", category: "cloud", iconSlug: "google-drive", status: "disconnected", docsUrl: "/docs" },
  { id: "int-serpapi", name: "SerpAPI", slug: "serpapi", description: "Web search results via Google, Bing, and more.", category: "ai", iconSlug: "search", status: "connected", docsUrl: "/docs" },
  { id: "int-pinecone", name: "Pinecone", slug: "pinecone", description: "Vector database for RAG and semantic search.", category: "ai", iconSlug: "pinecone", status: "disconnected", docsUrl: "/docs" },
  { id: "int-aws-s3", name: "AWS S3", slug: "aws-s3", description: "Read and write files to S3 buckets.", category: "cloud", iconSlug: "aws", status: "disconnected", docsUrl: "/docs" },
];
