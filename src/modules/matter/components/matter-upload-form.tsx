"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { uploadMatterDocumentAction } from "../actions/upload-matter-document";
import type { ChecklistItem } from "../types/checklist-types";

export function MatterUploadForm({ matterId, checklistItems }: { matterId: string; checklistItems: ChecklistItem[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => uploadMatterDocumentAction(fd),
    null as unknown as { error?: string; ok?: boolean },
  );
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="matterId" value={matterId} />
      <div className="flex flex-col gap-2">
        <label htmlFor={`checklist-select-${matterId}`} className="text-sm font-medium">Checklist item</label>
        <Select id={`checklist-select-${matterId}`} name="checklistItemId">
          <option value="">General document (no checklist)</option>
          {checklistItems.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} — {c.status}
            </option>
          ))}
        </Select>
        <label htmlFor={`file-${matterId}`} className="text-sm font-medium">File</label>
        <Input id={`file-${matterId}`} type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.docx" aria-label="Upload document" required />
        <p className="text-xs text-muted-foreground">Maximum 10 MB — PDF, JPG, PNG, DOCX</p>
        {(state as { error?: string })?.error && <p className="text-sm text-red-600" role="alert">{(state as { error?: string }).error}</p>}
        {(state as { ok?: boolean })?.ok && <p className="text-sm text-green-600">Uploaded</p>}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
