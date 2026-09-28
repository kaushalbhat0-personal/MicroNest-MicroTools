import type { MatterActivity } from "../types/matter-activity-types";

function humanize(a: MatterActivity): string {
  switch (a.action) {
    case "matter_created": {
      const title = (a.metadata as { title?: string } | null)?.title;
      return title ? `Matter created — ${title}` : "Matter created";
    }
    case "checklist_issued": {
      const count = (a.metadata as { count?: number } | null)?.count;
      return count ? `Checklist issued — ${count} items` : "Checklist issued";
    }
    case "document_uploaded": {
      const isChecklist = (a.metadata as { checklist_item_id?: string | null } | null)?.checklist_item_id;
      return isChecklist ? "Document uploaded for checklist" : "Document uploaded";
    }
    case "document_verified":
      return "Checklist item verified";
    case "note_added":
      return "Note added";
    case "matter_ready":
      return a.from_status && a.to_status ? `Matter ready — ${a.from_status} → ${a.to_status}` : "Matter ready";
    case "matter_archived":
      return a.from_status && a.to_status ? `Matter archived — ${a.from_status} → ${a.to_status}` : "Matter archived";
    default:
      return (a.action as string).replace(/_/g, " ");
  }
}

export function MatterActivityTimeline({ activities }: { activities: MatterActivity[] }) {
  if (activities.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li key={a.id} className="rounded-md border p-3 text-sm">
          <p>
            <span className="font-medium">{humanize(a)}</span>
            {a.from_status && a.to_status && !["matter_ready", "matter_archived"].includes(a.action) ? ` — ${a.from_status} → ${a.to_status}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            by {String(a.actor_id).slice(0, 8)} • {new Date(a.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
