"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  FolderOpen,
  Code2,
  File,
  Info,
  Plus,
  Eye,
  Trash2,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import { mockFiles, mockCollections, mockFilePreview, type FileStatus } from "@/lib/mock/files";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case "PDF":
    case "DOCX":
    case "Text":
    case "Markdown":
      return <FileText className="h-3.5 w-3.5 text-mute" />;
    case "YAML":
    case "CSV":
    case "JSON":
      return <Code2 className="h-3.5 w-3.5 text-mute" />;
    default:
      return <File className="h-3.5 w-3.5 text-mute" />;
  }
}

function StatusChip({ status }: { status: FileStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "indexed" && "bg-accent-green-soft text-accent-green",
        status === "processing" && "bg-accent-blue-soft text-accent-blue",
        status === "failed" && "bg-accent-red-soft text-accent-red",
      )}
    >
      {status === "indexed" && <CheckCircle className="h-2.5 w-2.5" />}
      {status === "processing" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {status === "failed" && <AlertCircle className="h-2.5 w-2.5" />}
      {status === "indexed" && "Indexed"}
      {status === "processing" && "Processing"}
      {status === "failed" && "Failed"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Selected file preview                                              */
/* ------------------------------------------------------------------ */

const selectedFile = mockFilePreview;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FilesPage() {
  const [selectedFileId, setSelectedFileId] = useState("f1");

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Files</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Give your workflows safe access to documents.</h1>
          <p className="mt-1 text-sm text-body">
            Upload PDFs, CSVs, code files, and more. Files are automatically chunked, indexed, and made available to workflow nodes.
          </p>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface-card px-3 text-xs font-semibold text-body transition-colors hover:bg-surface-soft sm:h-8 sm:flex-initial sm:justify-start">
            <FolderOpen className="h-3.5 w-3.5" />
            Create collection
          </button>
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8 sm:flex-initial sm:justify-start">
            <Upload className="h-3.5 w-3.5" />
            Upload files
          </button>
        </div>
      </div>

      {/* ---- Two-column layout ---- */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* ==== Left column ==== */}
        <div className="flex flex-col gap-5">
          {/* Upload dropzone card */}
          <div className="rounded-md border border-hairline bg-surface-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mute">Upload</h2>
            <div className="relative mt-3 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-hairline px-4 py-8 text-center">
              {/* Mascot carrying folder */}
              <div className="absolute -top-4 right-3">
                <MascotPlaceholder size="sm" mood="working" />
              </div>

              <Upload className="h-6 w-6 text-mute" />
              <p className="mt-2 text-xs font-medium text-ink">Drag files here or click to browse</p>
              <p className="mt-1 text-[10px] leading-relaxed text-mute">
                PDF, DOCX, TXT, MD, CSV, YAML, JSON, code files up to 50 MB
              </p>
            </div>
          </div>

          {/* Collections card */}
          <div className="rounded-md border border-hairline bg-surface-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-mute">Collections</h2>
              <button aria-label="Add collection" className="inline-flex h-6 w-6 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {mockCollections.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-surface-soft cursor-pointer"
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", col.colorClass)} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink">{col.name}</p>
                    <p className="text-[10px] text-mute">
                      {col.fileCount} files &middot; {col.totalSize}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==== Right column ==== */}
        <div className="flex flex-col gap-5">
          {/* Recent files table */}
          <div className="rounded-md border border-hairline bg-surface-card">
            <div className="border-b border-hairline-soft px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-mute">Recent files</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left" aria-label="Recent files">
                <thead>
                  <tr className="border-b border-hairline-soft bg-surface-soft">
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">File name</th>
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Type</th>
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Size</th>
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Status</th>
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Used in workflows</th>
                    <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedFileId(file.id); } }}
                      tabIndex={0}
                      role="row"
                      className={cn(
                        "cursor-pointer border-b border-hairline-soft last:border-0 transition-colors",
                        selectedFileId === file.id ? "bg-surface-soft" : "hover:bg-surface-soft/50",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileIcon type={file.type} />
                          <span className="max-w-[200px] truncate text-[11px] font-medium text-ink">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mute">
                          {file.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-body">{file.size}</td>
                      <td className="px-4 py-2.5"><StatusChip status={file.status} /></td>
                      <td className="px-4 py-2.5">
                        {file.usedIn.length > 0 ? (
                          <span className="text-[11px] text-body">{file.usedIn.join(", ")}</span>
                        ) : (
                          <span className="text-[11px] text-mute italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-mute">{file.uploaded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* File processing preview card */}
          <div className="rounded-md border border-hairline bg-surface-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-mute">File preview</h2>
              <span className="rounded bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mute">PDF</span>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-ink">{selectedFile.name}</h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Pages</p>
                <p className="text-xs font-semibold text-ink">{selectedFile.pages}</p>
              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Extracted text</p>
                <p className="text-xs font-semibold text-ink">{selectedFile.extractedText}</p>
              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Embeddings</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-accent-green">
                  <CheckCircle className="h-3 w-3" />
                  {selectedFile.embeddingsStatus}
                </p>

              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Last used</p>
                <p className="text-xs font-semibold text-ink">{selectedFile.lastUsed}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="inline-flex h-7 items-center gap-1 rounded-md bg-primary-cta px-3 text-[11px] font-semibold text-on-primary transition-colors hover:bg-primary-pressed">
                <ExternalLink className="h-3 w-3" />
                Use in workflow
              </button>
              <button className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-3 text-[11px] font-semibold text-body transition-colors hover:bg-surface-soft">
                <Eye className="h-3 w-3" />
                Preview
              </button>
              <button className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-3 text-[11px] font-semibold text-accent-red transition-colors hover:bg-accent-red-soft">
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>

          {/* Safety callout */}
          <div className="flex items-start gap-3 rounded-md bg-accent-blue-soft px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
            <p className="text-xs leading-relaxed text-ink">
              <span className="font-semibold">Files are treated as data, not instructions.</span>{" "}
              Tool access is controlled by workflow permissions. Uploaded files are never executed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
