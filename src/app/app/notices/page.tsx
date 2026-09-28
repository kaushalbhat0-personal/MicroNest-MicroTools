import Link from "next/link";
import { NoticesTable } from "@/modules/notice/components/notices-table";
import { NoticeFilters } from "@/modules/notice/components/notice-filters";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { listNoticesFilteredPaginated } from "@/modules/notice/services/list-notices-filtered";
import { parseNoticeFilters } from "@/modules/notice/schemas/notice-filter-schema";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";
import type { Client } from "@/modules/client/types/client-types";

export const dynamic = "force-dynamic";

function buildQuery(filters: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...filters, ...overrides })) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default async function NoticesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseNoticeFilters(params);
  const page = filters.page ?? 1;
  const { notices, total, totalPages } = await listNoticesFilteredPaginated({ ...filters, page });
  const clients = await listClientsForCurrentFirm(true);
  const map = new Map<string, Client>(clients.map((c) => [c.id, c]));
  const { firm } = await getCurrentFirmForSession();
  const supabase = await createServerSupabaseClient();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];

  const baseFilters: Record<string, string | undefined> = {
    q: filters.q,
    status: filters.status,
    priority: filters.priority,
    authority: filters.authority,
    assigned: filters.assigned,
    deadline: filters.deadline,
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notices</h1>
        <Link href="/app/notices/new" className="rounded-md border px-3 py-1 text-sm">
          New notice
        </Link>
      </div>
      <NoticeFilters
        q={filters.q}
        status={filters.status}
        priority={filters.priority}
        authority={filters.authority}
        assigned={filters.assigned}
        deadline={filters.deadline}
        members={members}
      />
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {total} notices • Page {page} of {totalPages}
        </p>
        <a
          href={`/api/notices/export${buildQuery(baseFilters)}`}
          className="rounded-md border px-3 py-1"
          download
        >
          Export CSV
        </a>
      </div>
      <NoticesTable notices={notices} clientsMap={map} />
      <div className="flex items-center justify-between">
        <Link
          href={page > 1 ? `/app/notices${buildQuery(baseFilters, { page: String(page - 1) })}` : "#"}
          aria-disabled={page <= 1}
          className={`rounded-md border px-3 py-1 text-sm ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Link
          href={page < totalPages ? `/app/notices${buildQuery(baseFilters, { page: String(page + 1) })}` : "#"}
          aria-disabled={page >= totalPages}
          className={`rounded-md border px-3 py-1 text-sm ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
    </main>
  );
}
