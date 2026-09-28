"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MatterNote } from "../types/matter-note-types";
import { updateMatterNoteAction, deleteMatterNoteAction } from "../actions/matter-notes";
import { canEditMatterNote, canDeleteMatterNote } from "../permissions/matter-permissions";
import type { FirmRole } from "@/modules/firm/constants/firm-constants";

type Props = {
  notes: MatterNote[];
  currentUserId: string | null;
  currentRole: FirmRole | null | undefined;
  matterAssignedTo: string | null;
};

export function MatterNotesList({ notes, currentUserId, currentRole, matterAssignedTo }: Props) {
  if (notes.length === 0) return <p className="text-sm text-muted-foreground">No notes yet.</p>;
  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <NoteRow key={n.id} note={n} currentUserId={currentUserId} currentRole={currentRole} matterAssignedTo={matterAssignedTo} />
      ))}
    </ul>
  );
}

function NoteRow({
  note,
  currentUserId,
  currentRole,
  matterAssignedTo,
}: {
  note: MatterNote;
  currentUserId: string | null;
  currentRole: FirmRole | null | undefined;
  matterAssignedTo: string | null;
}) {
  const canEdit = canEditMatterNote(currentRole, currentUserId, matterAssignedTo, note.author_id);
  const canDelete = canDeleteMatterNote(currentRole, currentUserId, matterAssignedTo, note.author_id);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const [editState, editAction, editPending] = useActionState(updateMatterNoteAction as unknown as (s: unknown, f: FormData) => Promise<unknown>, null as unknown);
  const [delState, delAction, delPending] = useActionState(deleteMatterNoteAction as unknown as (s: unknown, f: FormData) => Promise<unknown>, null as unknown);
  const es = editState as { error?: string; ok?: boolean } | null;
  const ds = delState as { error?: string; ok?: boolean } | null;

  if (editing && canEdit) {
    return (
      <li className="rounded-md border p-3 space-y-2">
        <form action={editAction} className="space-y-2" onSubmit={() => setTimeout(() => setEditing(false), 500)}>
          <input type="hidden" name="noteId" value={note.id} />
          <label htmlFor={`note-${note.id}`} className="text-sm font-medium">Edit note</label>
          <textarea
            id={`note-${note.id}`}
            name="content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
            maxLength={5000}
            aria-describedby={`note-${note.id}-error`}
            required
          />
          {es?.error && <p id={`note-${note.id}-error`} className="text-sm text-red-600" role="alert">{es.error}</p>}
          {es?.ok && <p className="text-sm text-green-600">Updated</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={editPending}>{editPending ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-md border p-3 space-y-1">
      <p className="text-sm">{note.content}</p>
      <p className="text-xs text-muted-foreground">
        by {note.author_id.slice(0, 8)} • {new Date(note.created_at).toLocaleString()}
      </p>
      <div className="flex gap-2">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        )}
        {canDelete && (
          <form
            action={delAction}
            onSubmit={(e) => {
              if (!confirm("Delete note? This cannot be undone.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="noteId" value={note.id} />
            <Button type="submit" variant="outline" size="sm" disabled={delPending}>
              {delPending ? "Deleting..." : "Delete"}
            </Button>
          </form>
        )}
      </div>
      {ds?.error && <p className="text-sm text-red-600" role="alert">{ds.error}</p>}
    </li>
  );
}
