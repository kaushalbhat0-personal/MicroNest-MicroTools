import { Button } from "@/components/ui/button";
import type { Document } from "../types/document-types";
import { deleteDocumentAction } from "../actions/delete-document";
import { downloadDocumentAction } from "../actions/download-document";

export function DocumentsList({ documents, noticeId, canDelete }: { documents: Document[]; noticeId: string; canDelete: boolean }) {
  if (documents.length === 0)
    return (
      <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No documents yet. Upload PDF, JPG, PNG, or DOCX (max 10 MB) to support this notice.
      </div>
    );
  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <li key={d.id} className="flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-all font-medium">{d.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {d.mime_type} • {(d.file_size / 1024).toFixed(1)} KB • {new Date(d.created_at).toLocaleString()} • by {d.uploaded_by.slice(0, 8)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <form action={downloadDocumentAction}>
              <input type="hidden" name="documentId" value={d.id} />
              <Button size="sm" variant="outline" type="submit">
                Download
              </Button>
            </form>
            {canDelete && (
              <form action={deleteDocumentAction}>
                <input type="hidden" name="documentId" value={d.id} />
                <input type="hidden" name="noticeId" value={noticeId} />
                <Button size="sm" variant="outline" type="submit">
                  Delete
                </Button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
