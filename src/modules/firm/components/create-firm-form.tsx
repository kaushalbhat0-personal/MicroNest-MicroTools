"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; fieldErrors?: Record<string, string[]> };

export function CreateFirmForm({ action }: { action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Firm name
        </label>
        <input id="name" name="name" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Acme CA Associates" />
        {state?.fieldErrors?.name && <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "Creating..." : "Create firm"}
      </Button>
    </form>
  );
}
