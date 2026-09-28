"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Note } from "../types/note-types";
import { deleteNoteAction } from "../actions/delete-note";
import { updateNoteAction } from "../actions/update-note";
import { canDeleteNote, canEditNote } from "../permissions/note-permissions";
import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export function NotesList({
  notes,
  currentUserId,
  currentRole,
  noticeAssignedTo,
}: {
  notes: Note[];
  currentUserId: string | null;
  currentRole: FirmRole | null | undefined;
  noticeAssignedTo: string | null;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (notes.length === 0) return <p className="text-sm text-muted-foreground">No notes yet.</p>;

  return (
    <ul className="space-y-3">
      {notes.map((n) => {
        const canEdit = canEditNote(currentRole as never, currentUserId, noticeAssignedTo, n.author_id);
        const canDelete = canDeleteNote(currentRole as never, currentUserId, noticeAssignedTo, n.author_id);
        const isEditing = editingId === n.id;

        return (
          <li key={n.id} className="rounded-md border p-3 text-sm">
            {!isEditing ? (
              <>
                <p className="whitespace-pre-wrap">{n.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  by {n.author_id.slice(0, 8)} • {new Date(n.created_at).toLocaleString()}
                </p>
                <div className="mt-2 flex gap-2">
                  {canEdit && (
                    <Button size="sm" variant="outline" onClick={() => setEditingId(n.id)}>
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="noticeId" value={n.notice_id} />
                      <Button size="sm" variant="outline" type="submit">
                        Delete
                      </Button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <form action={updateNoteAction} className="space-y-2" onSubmit={() => setEditingId(null)}>
                <input type="hidden" name="id" value={n.id} />
                <textarea name="content" defaultValue={n.content} className="w-full rounded-md border px-3 py-2 text-sm" rows={3} maxLength={5000} />
                <div className="flex gap-2">
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
