import { NextResponse } from "next/server";
import { getMatterDocumentUrlForCurrentFirm } from "@/modules/matter/services/get-matter-document-url";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getMatterDocumentUrlForCurrentFirm(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.redirect(result.url);
}
