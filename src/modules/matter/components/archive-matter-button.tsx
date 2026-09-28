"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { archiveMatterAction } from "../actions/archive-matter";

export function ArchiveMatterButton({ matterId }: { matterId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    if (!confirm("Archive matter? This cannot be undone.")) return;
    setPending(true);
    setError(null);
    const res = await archiveMatterAction(formData);
    if (res && (res as { error?: string }).error) {
      setError((res as { error?: string }).error ?? "Failed");
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <form action={onSubmit}>
        <input type="hidden" name="matterId" value={matterId} />
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Archiving..." : "Archive"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
