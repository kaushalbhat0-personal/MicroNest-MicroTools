import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FirmMember } from "@/modules/firm/types/firm-types";

export function NoticeFilters({
  q,
  status,
  priority,
  authority,
  assigned,
  deadline,
  members,
}: {
  q?: string;
  status?: string;
  priority?: string;
  authority?: string;
  assigned?: string;
  deadline?: string;
  members: FirmMember[];
}) {
  const hasActive = !!(q || status || priority || authority || assigned || deadline);
  return (
    <form method="GET" className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2 md:grid-cols-3">
      <div className="col-span-1 sm:col-span-2 md:col-span-3">
        <label htmlFor="filter-q" className="text-xs">Search (reference / client)</label>
        <Input id="filter-q" name="q" defaultValue={q} placeholder="ABC Pvt Ltd or REF123" />
      </div>
      <div>
        <label htmlFor="filter-status" className="text-xs">Status</label>
        <Select id="filter-status" name="status" defaultValue={status ?? ""}>
          <option value="">All</option>
          <option value="received">received</option>
          <option value="review">review</option>
          <option value="assigned">assigned</option>
          <option value="awaiting_client">awaiting_client</option>
          <option value="drafting">drafting</option>
          <option value="internal_review">internal_review</option>
          <option value="ready_to_submit">ready_to_submit</option>
          <option value="submitted">submitted</option>
          <option value="follow_up">follow_up</option>
          <option value="closed">closed</option>
        </Select>
      </div>
      <div>
        <label htmlFor="filter-priority" className="text-xs">Priority</label>
        <Select id="filter-priority" name="priority" defaultValue={priority ?? ""}>
          <option value="">All</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </Select>
      </div>
      <div>
        <label htmlFor="filter-authority" className="text-xs">Authority</label>
        <Select id="filter-authority" name="authority" defaultValue={authority ?? ""}>
          <option value="">All</option>
          <option value="income_tax">income_tax</option>
          <option value="gst">gst</option>
          <option value="tds">tds</option>
          <option value="other">other</option>
        </Select>
      </div>
      <div>
        <label htmlFor="filter-assigned" className="text-xs">Assigned</label>
        <Select id="filter-assigned" name="assigned" defaultValue={assigned ?? ""}>
          <option value="">All</option>
          <option value="my">My Notices</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.user_id}>
              {m.user_id.slice(0, 8)} — {m.role}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-deadline" className="text-xs">Deadline</label>
        <Select id="filter-deadline" name="deadline" defaultValue={deadline ?? ""}>
          <option value="">All</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="due_7">Due in 7 days</option>
        </Select>
      </div>
      <div className="col-span-1 flex items-end gap-2 sm:col-span-2 md:col-span-3">
        <button type="submit" className="rounded-md border px-4 py-2 text-sm">
          Apply
        </button>
        {hasActive && (
          <Link href="/app/notices" className="rounded-md border px-4 py-2 text-sm">
            Clear filters
          </Link>
        )}
        {!hasActive && (
          <Link href="/app/notices" className="rounded-md border px-4 py-2 text-sm opacity-50">
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
