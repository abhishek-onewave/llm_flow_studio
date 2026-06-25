import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "workspace-files";

/* ------------------------------------------------------------------ */
/*  GET /api/files?workspaceId=...                                     */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ files: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/files  (multipart form data)                             */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = formData.get("workspaceId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload to Storage
    const storagePath = `${workspaceId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Insert metadata row
    const { data: row, error: dbError } = await supabase
      .from("files")
      .insert({
        workspace_id: workspaceId,
        filename: file.name,
        storage_path: storagePath,
        size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ file: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/files?id=...&workspaceId=...                           */
/* ------------------------------------------------------------------ */

export async function DELETE(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("id");
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");

  if (!fileId || !workspaceId) {
    return NextResponse.json({ error: "id and workspaceId are required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Get the storage path first
    const { data: row, error: fetchErr } = await supabase
      .from("files")
      .select("storage_path")
      .eq("id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (fetchErr) throw fetchErr;

    // Delete from storage
    if (row?.storage_path) {
      await supabase.storage.from(BUCKET).remove([row.storage_path]);
    }

    // Delete metadata row
    const { error: delErr } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId)
      .eq("workspace_id", workspaceId);

    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
