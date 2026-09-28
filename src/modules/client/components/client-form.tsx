"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; fieldErrors?: Record<string, string[]> };
type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function ClientForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: { id?: string; name?: string; email?: string; phone?: string; address?: { line1?: string; city?: string; state?: string; postalCode?: string } };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <input id="name" name="name" defaultValue={defaultValues?.name} className="w-full rounded-md border px-3 py-2 text-sm" />
        {state?.fieldErrors?.name && <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" defaultValue={defaultValues?.email} className="w-full rounded-md border px-3 py-2 text-sm" />
        {state?.fieldErrors?.email && <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>
      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <input id="phone" name="phone" defaultValue={defaultValues?.phone} className="w-full rounded-md border px-3 py-2 text-sm" />
        {state?.fieldErrors?.phone && <p className="text-sm text-red-600">{state.fieldErrors.phone[0]}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="line1" className="text-sm">
            Line1
          </label>
          <input id="line1" name="address.line1" defaultValue={defaultValues?.address?.line1} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm">
            City
          </label>
          <input id="city" name="city" defaultValue={defaultValues?.address?.city} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="state" className="text-sm">
            State
          </label>
          <input id="state" name="state" defaultValue={defaultValues?.address?.state} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="postalCode" className="text-sm">
            Postal
          </label>
          <input id="postalCode" name="postalCode" defaultValue={defaultValues?.address?.postalCode} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
