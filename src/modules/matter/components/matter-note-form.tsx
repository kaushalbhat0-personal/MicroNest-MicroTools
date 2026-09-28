"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createMatterNoteAction } from "../actions/matter-notes";

export function MatterNoteForm({ matterId }: { matterId: string }) {
  const [state, formAction, pending] = useActionState(createMatterNoteAction, null as unknown as { error?: string; ok?: boolean });
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="matterId" value={matterId} />
      <label htmlFor={`note-new-${matterId}`} className="text-sm font-medium">Add note</label>
      <textarea
        id={`note-new-${matterId}`}
        name="content"
        placeholder="Add a note..."
        className="w-full rounded-md border px-3 py-2 text-sm"
        rows={3}
        maxLength={5000}
        aria-describedby={`note-new-${matterId}-error`}
        required
      />
      {(state as { error?: string })?.error && <p id={`note-new-${matterId}-error`} className="text-sm text-red-600" role="alert">{(state as { error?: string }).error}</p>}
      {(state as { ok?: boolean })?.ok && <p className="text-sm text-green-600">Added</p>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Please wait..." : "Add note"}
      </Button>
    </form>
  );
}
