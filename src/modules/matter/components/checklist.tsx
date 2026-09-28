"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChecklistItem } from "../types/checklist-types";
import { verifyChecklistAction, rejectChecklistAction } from "../actions/verify-checklist";
import { uploadMatterDocumentAction } from "../actions/upload-matter-document";

type Props = {
  items: ChecklistItem[];
  canVerify: boolean;
  canUpload?: boolean;
  matterId?: string;
};

function ChecklistRow({ item, canVerify, canUpload, matterId }: { item: ChecklistItem; canVerify: boolean; canUpload: boolean; matterId: string }) {
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyChecklistAction as unknown as (s: unknown, f: FormData) => Promise<unknown>, null as unknown);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectChecklistAction as unknown as (s: unknown, f: FormData) => Promise<unknown>, null as unknown);
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadMatterDocumentAction as unknown as (s: unknown, f: FormData) => Promise<unknown>, null as unknown);
  const v = verifyState as { error?: string; ok?: boolean } | null;
  const r = rejectState as { error?: string; ok?: boolean } | null;
  const u = uploadState as { error?: string; ok?: boolean } | null;
  const pending = verifyPending || rejectPending || uploadPending;

  let statusHint = "";
  if (item.status === "pending") statusHint = "Pending — upload document";
  else if (item.status === "uploaded") statusHint = "Uploaded — awaiting verification";
  else if (item.status === "verified") statusHint = "Verified — complete";
  else if (item.status === "rejected") statusHint = "Rejected — needs replacement";

  return (
    <li className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {item.label} {item.required ? <span className="text-red-500" aria-label="required">*</span> : <span className="text-xs text-muted-foreground">(optional)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{item.document_id ? `Doc: ${item.document_id.slice(0, 8)}` : "No document"} • {statusHint}</p>
        </div>
        <Badge variant="outline" className={item.status === "verified" ? "bg-green-50 text-green-700 border-green-200" : item.status === "rejected" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}>{item.status}</Badge>
      </div>
      {(item.status === "pending" || item.status === "rejected") && canUpload && matterId && (
        <form action={uploadAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="matterId" value={matterId} />
          <input type="hidden" name="checklistItemId" value={item.id} />
          <div className="flex-1">
            <label htmlFor={`file-${item.id}`} className="text-xs text-muted-foreground">Upload for {item.label}</label>
            <Input id={`file-${item.id}`} type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.docx" aria-label={`Upload ${item.label}`} required />
          </div>
          <Button size="sm" type="submit" disabled={pending}>
            {uploadPending ? "Uploading..." : "Upload"}
          </Button>
        </form>
      )}
      {item.status === "uploaded" && canVerify && (
        <div className="flex gap-2">
          <form action={verifyAction}>
            <input type="hidden" name="checklistItemId" value={item.id} />
            <Button size="sm" type="submit" disabled={pending}>
              {verifyPending ? "Verifying..." : "Verify"}
            </Button>
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="checklistItemId" value={item.id} />
            <Button size="sm" variant="outline" type="submit" disabled={pending}>
              {rejectPending ? "Rejecting..." : "Reject"}
            </Button>
          </form>
        </div>
      )}
      {v?.error && <p className="text-sm text-red-600" role="alert">{v.error}</p>}
      {v?.ok && <p className="text-sm text-green-600">Verified</p>}
      {r?.error && <p className="text-sm text-red-600" role="alert">{r.error}</p>}
      {r?.ok && <p className="text-sm text-amber-600">Rejected</p>}
      {u?.error && <p className="text-sm text-red-600" role="alert">{u.error}</p>}
      {u?.ok && <p className="text-sm text-green-600">Uploaded</p>}
    </li>
  );
}

export function Checklist({ items, canVerify, canUpload = false, matterId = "" }: Props) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No checklist items.</p>;
  const requiredCount = items.filter((i) => i.required).length;
  const verifiedCount = items.filter((i) => i.required && i.status === "verified").length;
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Required: {verifiedCount}/{requiredCount} verified {verifiedCount === requiredCount && requiredCount > 0 ? "— Ready when all required verified" : "— Awaiting docs"}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} canVerify={canVerify} canUpload={canUpload} matterId={matterId} />
        ))}
      </ul>
    </div>
  );
}
