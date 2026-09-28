"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { uploadDocumentAction, type UploadState } from "../actions/upload-document";

export function UploadForm({ noticeId }: { noticeId: string }) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, {} as UploadState);
  return (
    <form action={formAction} className="space-y-2" encType="multipart/form-data">
      <input type="hidden" name="noticeId" value={noticeId} />
      <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.docx" className="w-full text-sm" />
      <p className="text-xs text-muted-foreground">Maximum 10 MB — PDF, JPG, PNG, DOCX</p>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Uploaded</p>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
