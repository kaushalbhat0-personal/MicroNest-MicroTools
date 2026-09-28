import type { MatterActivity } from "../types/matter-activity-types";

export function MatterActivityTimeline({ activities }: { activities: MatterActivity[] }) {
  if (activities.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li key={a.id} className="rounded-md border p-3 text-sm">
          <p>
            <span className="font-medium">{a.action}</span>
            {a.from_status && a.to_status ? ` — ${a.from_status} → ${a.to_status}` : ""} {a.metadata ? `• ${JSON.stringify(a.metadata)}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            by {String(a.actor_id).slice(0, 8)} • {new Date(a.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
