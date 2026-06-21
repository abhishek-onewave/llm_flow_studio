/** Status of a file in the system */
export type FileStatus = "indexed" | "processing" | "failed";

/** A file record in the file manager */
export interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  status: FileStatus;
  usedIn: string[];
  uploaded: string;
}

/** A file collection (folder) */
export interface FileCollection {
  name: string;
  fileCount: number;
  totalSize: string;
  colorClass: string;
}

/** Preview metadata for a selected file */
export interface FilePreview {
  name: string;
  type: string;
  pages: number;
  extractedText: string;
  embeddingsStatus: "Complete" | "In progress" | "Not started";
  lastUsed: string;
}

export const mockFiles: FileRecord[] = [
  { id: "f1", name: "contract-acme-2026.pdf", type: "PDF", size: "2.4 MB", status: "indexed", usedIn: ["Contract Review", "Risk Analysis"], uploaded: "Jun 20, 2026" },
  { id: "f2", name: "vendor-agreement-v3.docx", type: "DOCX", size: "890 KB", status: "indexed", usedIn: ["Contract Review"], uploaded: "Jun 19, 2026" },
  { id: "f3", name: "product-requirements.md", type: "Markdown", size: "45 KB", status: "indexed", usedIn: ["PRD to Tasks"], uploaded: "Jun 18, 2026" },
  { id: "f4", name: "api-spec-v2.yaml", type: "YAML", size: "12 KB", status: "processing", usedIn: [], uploaded: "Jun 21, 2026" },
  { id: "f5", name: "meeting-notes-q2.txt", type: "Text", size: "8 KB", status: "indexed", usedIn: ["Summary Chain"], uploaded: "Jun 17, 2026" },
  { id: "f6", name: "error-log-june.csv", type: "CSV", size: "1.2 MB", status: "failed", usedIn: [], uploaded: "Jun 21, 2026" },
  { id: "f7", name: "design-tokens.json", type: "JSON", size: "34 KB", status: "indexed", usedIn: ["Design Audit"], uploaded: "Jun 15, 2026" },
  { id: "f8", name: "research-paper-llm.pdf", type: "PDF", size: "4.1 MB", status: "indexed", usedIn: ["Research Brief"], uploaded: "Jun 14, 2026" },
];

export const mockCollections: FileCollection[] = [
  { name: "Legal documents", fileCount: 12, totalSize: "45 MB", colorClass: "bg-primary-cta" },
  { name: "Product specs", fileCount: 8, totalSize: "2.1 MB", colorClass: "bg-accent-blue" },
  { name: "Engineering docs", fileCount: 24, totalSize: "890 KB", colorClass: "bg-accent-green" },
  { name: "Research papers", fileCount: 6, totalSize: "18 MB", colorClass: "bg-accent-purple" },
];

export const mockFilePreview: FilePreview = {
  name: "contract-acme-2026.pdf",
  type: "PDF",
  pages: 24,
  extractedText: "18,240 tokens",
  embeddingsStatus: "Complete",
  lastUsed: "Jun 20, 2026",
};
