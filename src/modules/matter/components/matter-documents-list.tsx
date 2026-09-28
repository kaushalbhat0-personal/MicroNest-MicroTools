"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { MatterDocument } from "../types/matter-document-types";
import { deleteMatterDocumentAction } from "../actions/delete-matter-document";
import type { FirmRole } from "@/modules/firm/constants/firm-constants";

type Props = {
  documents: MatterDocument[];
  matterId: string;
  canDelete: boolean;
  currentUserId: string | null;
  currentRole: FirmRole | null | undefined;
  matterAssignedTo: string | null;
};

function DocumentRow({
  doc,
  matterId,
  canDelete,
  currentUserId,
  currentRole,
}: {
  doc: MatterDocument;
  matterId: string;
  canDelete: boolean;
  currentUserId: string | null;
  currentRole: FirmRole | null | undefined;
}) {
  const [state, formAction, pending] = useActionState(deleteMatterDocumentAction, null as unknown as { error?: string; ok?: boolean });
  const s = state as { error?: string } | null;
  // Fine-grained per-doc check for member: only own uploads
  const showDelete = canDelete && (currentRole !== "member" || doc.uploaded_by === currentUserId);
  return (
    <li className="flex flex-col gap-1 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{doc.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {doc.mime_type} • {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/matter-documents/${doc.id}`} className="rounded-md border px-3 py-1 text-sm" download>
            Download
          </a>
          {showDelete && (
            <form
              action={formAction}
              onSubmit={(e) => {
                if (!confirm("Delete document? This will also reset linked checklist item to pending.")) e.preventDefault();
              }}
            >
              <input type="hidden" name="documentId" value={doc.id} />
              <input type="hidden" name="matterId" value={matterId} />
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                {pending ? "Deleting..." : "Delete"}
              </Button>
            </form>
          )}
        </div>
      </div>
      {s?.error && <p className="text-sm text-red-600" role="alert">{s.error}</p>}
    </li>
  );
}

export function MatterDocumentsList({ documents, matterId, canDelete, currentUserId, currentRole, matterAssignedTo }: Props) {
  if (documents.length === 0) return <p className="text-sm text-muted-foreground">No documents yet.</p>;
  void matterAssignedTo;
  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <DocumentRow key={d.id} doc={d} matterId={matterId} canDelete={canDelete} currentUserId={currentUserId} currentRole={currentRole} />
      ))}
    </ul>
  );
}

// Keep canDelete prop for future fine-grained gating; currently delete is allowed when canDelete (owner/admin or uploader on assigned) per service.
// The component shows Delete only when canDelete is true at page level (passed from server), so unauthorized users never see it.
