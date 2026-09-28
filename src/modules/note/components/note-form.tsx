"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createNoteAction, type CreateNoteState } from "../actions/create-note";

export function NoteForm({ noticeId }: { noticeId: string }) {
  const [state, formAction, pending] = useActionState(createNoteAction, {} as CreateNoteState);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="noticeId" value={noticeId} />
      <textarea name="content" placeholder="Add a note..." className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
      {state?.fieldErrors?.content && <p className="text-sm text-red-600">{state.fieldErrors.content[0]}</p>}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Added</p>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Please wait..." : "Add note"}
      </Button>
    </form>
  );
}
