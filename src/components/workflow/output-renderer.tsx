"use client";

import { Download, ExternalLink, FileText, Play as PlayIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Output type detection                                              */
/* ------------------------------------------------------------------ */

type OutputType = "image" | "video" | "document" | "text";

interface ParsedOutput {
  type: OutputType;
  url: string;
  mimeHint?: string;
  fileName?: string;
}

const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)(\?|$)/i;
const VIDEO_EXTS = /\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i;
const DOC_EXTS = /\.(pdf|pptx?|xlsx?|docx?|csv|txt|md)(\?|$)/i;

function parseOutput(raw: string): ParsedOutput | null {
  if (!raw) return null;

  // [image:url] format
  const imageMatch = raw.match(/^\[image:([\s\S]+)\]$/);
  if (imageMatch) return { type: "image", url: imageMatch[1].trim() };

  // [video:url] format
  const videoMatch = raw.match(/^\[video:([\s\S]+)\]$/);
  if (videoMatch) return { type: "video", url: videoMatch[1].trim() };

  // [file:url] or [document:url] format
  const fileMatch = raw.match(/^\[(file|document):([\s\S]+)\]$/);
  if (fileMatch) {
    const url = fileMatch[2].trim();
    return { type: "document", url, fileName: url.split("/").pop()?.split("?")[0] };
  }

  // Auto-detect from URL patterns (data URLs or http URLs)
  const urlStr = raw.trim();
  if (urlStr.startsWith("data:image/") || IMAGE_EXTS.test(urlStr)) {
    return { type: "image", url: urlStr };
  }
  if (urlStr.startsWith("data:video/") || VIDEO_EXTS.test(urlStr)) {
    return { type: "video", url: urlStr };
  }
  if (DOC_EXTS.test(urlStr) && (urlStr.startsWith("http") || urlStr.startsWith("data:"))) {
    return { type: "document", url: urlStr, fileName: urlStr.split("/").pop()?.split("?")[0] };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Renderers                                                          */
/* ------------------------------------------------------------------ */

function ImageOutput({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Generated image"
        className="max-w-full rounded-md border border-hairline"
        loading="lazy"
      />
      <div className="flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-accent-blue hover:underline"
        >
          <ExternalLink size={10} />
          Open full size
        </a>
        <a
          href={url}
          download="generated-image"
          className="inline-flex items-center gap-1 text-[10px] text-accent-blue hover:underline"
        >
          <Download size={10} />
          Download
        </a>
      </div>
    </div>
  );
}

function VideoOutput({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <video
        src={url}
        controls
        className="max-w-full rounded-md border border-hairline"
        preload="metadata"
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
      <div className="flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-accent-blue hover:underline"
        >
          <PlayIcon size={10} />
          Open in new tab
        </a>
        <a
          href={url}
          download
          className="inline-flex items-center gap-1 text-[10px] text-accent-blue hover:underline"
        >
          <Download size={10} />
          Download
        </a>
      </div>
    </div>
  );
}

function DocumentOutput({ url, fileName }: { url: string; fileName?: string }) {
  const name = fileName || "document";
  const ext = name.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="flex items-center gap-3 rounded-md border border-hairline bg-surface-soft px-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent-blue-soft text-accent-blue">
        <FileText size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-ink">{name}</p>
        <p className="text-[10px] text-mute">{ext} document</p>
      </div>
      <a
        href={url}
        download={name}
        className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline bg-surface-card px-2 text-[10px] font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink"
      >
        <Download size={10} />
        Download
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface OutputRendererProps {
  output: string;
  /** Compact mode for run console thumbnails */
  compact?: boolean;
}

export function OutputRenderer({ output, compact = false }: OutputRendererProps) {
  const parsed = parseOutput(output);

  if (!parsed) {
    // Plain text output
    if (compact) return null;
    return (
      <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-on-dark">
        {output || "No output yet. Run this node to see results."}
      </pre>
    );
  }

  if (compact) {
    // Compact mode for run console
    switch (parsed.type) {
      case "image":
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={parsed.url} alt="Generated" className="mt-1 max-h-24 rounded border border-hairline" loading="lazy" />
        );
      case "video":
        return (
          <video src={parsed.url} controls className="mt-1 max-h-24 rounded border border-hairline" preload="metadata">
            <track kind="captions" />
          </video>
        );
      case "document":
        return (
          <a href={parsed.url} download className="mt-1 inline-flex items-center gap-1 text-[10px] text-accent-blue hover:underline">
            <Download size={10} /> Download {parsed.fileName || "file"}
          </a>
        );
    }
  }

  // Full mode for inspector panel
  switch (parsed.type) {
    case "image":
      return <ImageOutput url={parsed.url} />;
    case "video":
      return <VideoOutput url={parsed.url} />;
    case "document":
      return <DocumentOutput url={parsed.url} fileName={parsed.fileName} />;
    default:
      return (
        <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-on-dark">
          {output}
        </pre>
      );
  }
}

/** Check if an output string contains media (image/video/document) */
export function isMediaOutput(output: string): boolean {
  return parseOutput(output) !== null;
}
