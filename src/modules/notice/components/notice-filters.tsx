import Link from "next/link";
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
  return (
    <form method="GET" className="grid grid-cols-2 gap-3 rounded-md border p-3 md:grid-cols-3">
      <div className="col-span-2 md:col-span-3">
        <label className="text-xs">Search (reference / client)</label>
        <input name="q" defaultValue={q} placeholder="ABC Pvt Ltd or REF123" className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs">Status</label>
        <select name="status" defaultValue={status ?? ""} className="w-full rounded-md border px-2 py-2 text-sm">
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
        </select>
      </div>
      <div>
        <label className="text-xs">Priority</label>
        <select name="priority" defaultValue={priority ?? ""} className="w-full rounded-md border px-2 py-2 text-sm">
          <option value="">All</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
      </div>
      <div>
        <label className="text-xs">Authority</label>
        <select name="authority" defaultValue={authority ?? ""} className="w-full rounded-md border px-2 py-2 text-sm">
          <option value="">All</option>
          <option value="income_tax">income_tax</option>
          <option value="gst">gst</option>
          <option value="tds">tds</option>
          <option value="other">other</option>
        </select>
      </div>
      <div>
        <label className="text-xs">Assigned</label>
        <select name="assigned" defaultValue={assigned ?? ""} className="w-full rounded-md border px-2 py-2 text-sm">
          <option value="">All</option>
          <option value="my">My Notices</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.user_id}>
              {m.user_id.slice(0, 8)} — {m.role}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs">Deadline</label>
        <select name="deadline" defaultValue={deadline ?? ""} className="w-full rounded-md border px-2 py-2 text-sm">
          <option value="">All</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="due_7">Due in 7 days</option>
        </select>
      </div>
      <div className="col-span-2 flex items-end gap-2 md:col-span-3">
        <button type="submit" className="rounded-md border px-4 py-2 text-sm">
          Apply
        </button>
        <Link href="/app/notices" className="rounded-md border px-4 py-2 text-sm">
          Clear
        </Link>
      </div>
    </form>
  );
}
