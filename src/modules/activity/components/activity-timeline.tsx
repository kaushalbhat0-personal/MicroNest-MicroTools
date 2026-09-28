import type { Activity } from "../types/activity-types";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0)
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No activity yet. Workflow changes will appear here chronologically.
      </div>
    );
  return (
    <ol className="space-y-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3 rounded-md border p-3 text-sm">
          <div className="min-w-0 flex-1">
            <p>
              <span className="font-medium">{a.action}</span> — {a.from_status} → {a.to_status}
            </p>
            <p className="text-muted-foreground">by {a.actor_id.slice(0, 8)} • {new Date(a.created_at).toLocaleString()}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
