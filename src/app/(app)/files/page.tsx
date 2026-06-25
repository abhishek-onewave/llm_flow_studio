"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
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
import { mockFiles as initialMockFiles, mockCollections, type FileStatus, type FileRecord } from "@/lib/mock/files";

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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ACCEPTED_TYPES = ".pdf,.docx,.txt,.md,.csv,.yaml,.yml,.json,.js,.ts,.tsx,.jsx,.py,.go,.rs,.java,.html,.css";

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "PDF", docx: "DOCX", txt: "Text", md: "Markdown",
    csv: "CSV", yaml: "YAML", yml: "YAML", json: "JSON",
    js: "JS", ts: "TS", tsx: "TSX", jsx: "JSX",
    py: "Python", go: "Go", rs: "Rust", java: "Java",
    html: "HTML", css: "CSS",
  };
  return map[ext] ?? ext.toUpperCase();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>(initialMockFiles);
  const [selectedFileId, setSelectedFileId] = useState("f1");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files.find((f) => f.id === selectedFileId) ?? files[0];

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: FileRecord[] = Array.from(fileList).map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      type: getFileType(f.name),
      size: formatSize(f.size),
      status: "processing" as FileStatus,
      usedIn: [],
      uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));
    setFiles((prev) => [...newFiles, ...prev]);
    setSelectedFileId(newFiles[0].id);
    // Simulate processing → indexed after 2s
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          newFiles.some((n) => n.id === f.id) ? { ...f, status: "indexed" as FileStatus } : f,
        ),
      );
    }, 2000);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }, [addFiles]);

  const handleDeleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedFileId((prev) => prev === id ? files[0]?.id ?? "" : prev);
  }, [files]);

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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8 sm:flex-initial sm:justify-start"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            onChange={handleFileInput}
            className="hidden"
            aria-label="Upload files"
          />
        </div>
      </div>

      {/* ---- Two-column layout ---- */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* ==== Left column ==== */}
        <div className="flex flex-col gap-5">
          {/* Upload dropzone card */}
          <div className="rounded-md border border-hairline bg-surface-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mute">Upload</h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
              className={cn(
                "relative mt-3 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
                isDragging ? "border-primary-cta bg-primary-cta/5" : "border-hairline hover:border-mute",
              )}
            >
              {/* Mascot carrying folder */}
              <div className="absolute -top-4 right-3">
                <MascotPlaceholder size="sm" mood="working" />
              </div>

              <Upload className={cn("h-6 w-6", isDragging ? "text-primary-cta" : "text-mute")} />
              <p className="mt-2 text-xs font-medium text-ink">
                {isDragging ? "Drop files to upload" : "Drag files here or click to browse"}
              </p>
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
                  {files.map((file) => (
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
              <span className="rounded bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-mute">{selectedFile.type}</span>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-ink">{selectedFile.name}</h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Size</p>
                <p className="text-xs font-semibold text-ink">{selectedFile.size}</p>
              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Status</p>
                <p className="text-xs font-semibold text-ink"><StatusChip status={selectedFile.status} /></p>
              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Used in</p>
                <p className="text-xs font-semibold text-ink">
                  {selectedFile.usedIn.length > 0 ? selectedFile.usedIn.join(", ") : "None"}
                </p>
              </div>
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <p className="text-[10px] text-mute">Uploaded</p>
                <p className="text-xs font-semibold text-ink">{selectedFile.uploaded}</p>
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
              <button
                onClick={() => handleDeleteFile(selectedFile.id)}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-3 text-[11px] font-semibold text-accent-red transition-colors hover:bg-accent-red-soft"
              >
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
