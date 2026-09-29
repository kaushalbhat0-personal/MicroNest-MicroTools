import { NextResponse } from "next/server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { parseNoticeFilters } from "@/modules/notice/schemas/notice-filter-schema";
import { listNoticesFiltered } from "@/modules/notice/services/list-notices-filtered";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { isSubscribed } from "@/modules/billing/services/entitlements";

function csvEscape(value: string | null | undefined): string {
  const s = value ?? "";
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!(await isSubscribed(firm.id, "noticeflow"))) {
    return NextResponse.json({ error: "Not subscribed to noticeflow" }, { status: 403 });
  }

  const url = new URL(request.url);
  const raw: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "page") continue; // export ignores pagination
    raw[k] = v;
  }
  const filters = parseNoticeFilters(raw);

  const notices = await listNoticesFiltered(filters);

  // Enrich client_name
  const supabase = await createServerSupabaseClient();
  const clientIds = [...new Set(notices.map((n) => n.client_id))];
  let clientMap = new Map<string, string>();
  if (clientIds.length > 0) {
    const { data } = await supabase.from("clients").select("id, name").in("id", clientIds);
    clientMap = new Map((data ?? []).map((c) => [c.id as string, c.name as string]));
  }

  const headers = [
    "reference_number",
    "client_name",
    "authority",
    "notice_type",
    "status",
    "priority",
    "response_deadline",
    "assigned_to",
    "created_at",
  ];

  const rows = notices.map((n) =>
    [
      csvEscape(n.reference_number),
      csvEscape(clientMap.get(n.client_id) ?? ""),
      csvEscape(n.authority),
      csvEscape(n.notice_type),
      csvEscape(n.status),
      csvEscape(n.priority),
      csvEscape(n.response_deadline),
      csvEscape(n.assigned_to ?? ""),
      csvEscape(n.created_at),
    ].join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  const filename = `notices-${firm.slug}-${date}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
