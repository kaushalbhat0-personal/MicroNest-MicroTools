import { NextResponse } from "next/server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { isSubscribed } from "@/modules/billing/services/entitlements";
import { getMatterDocumentUrlForCurrentFirm } from "@/modules/matter/services/get-matter-document-url";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!(await isSubscribed(firm.id, "mattervault"))) {
    return NextResponse.json({ error: "Not subscribed to mattervault" }, { status: 403 });
  }
  const { id } = await params;
  const result = await getMatterDocumentUrlForCurrentFirm(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.redirect(result.url);
}
