import type { TemplateRecord } from "@/types/integrations";

export const mockTemplates: TemplateRecord[] = [
  { id: "tpl-contract-review", name: "Contract Review Chain", description: "Extract key terms, assess risk, and generate an executive summary from any contract.", category: "Legal", nodeCount: 6, tags: ["legal", "analysis", "multi-model"], workflowId: "wf-contract-review", popularity: 95 },
  { id: "tpl-prd-to-eng", name: "PRD to Engineering Plan", description: "Convert product requirements into a technical architecture and task breakdown.", category: "Engineering", nodeCount: 6, tags: ["engineering", "planning", "multi-model"], workflowId: "wf-prd-to-eng", popularity: 88 },
  { id: "tpl-code-review", name: "GitHub Code Review", description: "Fetch a PR diff, run AI code review, and post feedback automatically.", category: "Developer Tools", nodeCount: 6, tags: ["code_review", "github", "automation"], workflowId: "wf-gh-code-review", popularity: 92 },
  { id: "tpl-research-brief", name: "Research Brief Builder", description: "Search the web, summarize findings, and produce a structured research brief.", category: "Research", nodeCount: 7, tags: ["research", "content", "web_search"], workflowId: "wf-research-brief", popularity: 80 },
  { id: "tpl-customer-support", name: "Customer Support Triage", description: "Classify incoming tickets, draft responses, and escalate high-priority issues.", category: "Support", nodeCount: 5, tags: ["support", "classification", "automation"], workflowId: "", popularity: 75 },
  { id: "tpl-content-pipeline", name: "Content Generation Pipeline", description: "Generate blog posts from outlines with SEO optimization and editorial review.", category: "Content", nodeCount: 5, tags: ["content", "seo", "writing"], workflowId: "", popularity: 70 },
  { id: "tpl-data-extraction", name: "Structured Data Extraction", description: "Extract structured JSON data from unstructured documents using LLMs.", category: "Data", nodeCount: 4, tags: ["data", "extraction", "json"], workflowId: "", popularity: 65 },
  { id: "tpl-translation", name: "Multi-Language Translation", description: "Translate content across multiple languages with quality validation.", category: "Content", nodeCount: 5, tags: ["translation", "i18n", "validation"], workflowId: "", popularity: 60 },
];
