"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { Client } from "@/modules/client/types/client-types";
import type { FirmMember } from "@/modules/firm/types/firm-types";

type Notice = {
  id?: string;
  client_id?: string;
  reference_number?: string | null;
  authority?: string;
  notice_type?: string;
  received_date?: string | null;
  response_deadline?: string | null;
  priority?: string;
  assigned_to?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
};

type FormState = { error?: string; fieldErrors?: Record<string, string[]> };
type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function NoticeForm({
  action,
  clients,
  members,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  clients: Client[];
  members: FirmMember[];
  defaultValues?: Notice;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <div className="space-y-1">
        <label className="text-sm font-medium">Client *</label>
        <select name="client_id" defaultValue={defaultValues?.client_id ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.client_id && <p className="text-sm text-red-600">{state.fieldErrors.client_id[0]}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm">Reference number</label>
        <input name="reference_number" defaultValue={defaultValues?.reference_number ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
        {state?.fieldErrors?.reference_number && <p className="text-sm text-red-600">{state.fieldErrors.reference_number[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Authority *</label>
          <select name="authority" defaultValue={defaultValues?.authority ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select</option>
            <option value="income_tax">Income Tax</option>
            <option value="gst">GST</option>
            <option value="tds">TDS</option>
            <option value="other">Other</option>
          </select>
          {state?.fieldErrors?.authority && <p className="text-sm text-red-600">{state.fieldErrors.authority[0]}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm">Notice type *</label>
          <select name="notice_type" defaultValue={defaultValues?.notice_type ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Select</option>
            <option value="scrutiny">Scrutiny</option>
            <option value="intimation">Intimation</option>
            <option value="demand">Demand</option>
            <option value="show_cause">Show Cause</option>
            <option value="other">Other</option>
          </select>
          {state?.fieldErrors?.notice_type && <p className="text-sm text-red-600">{state.fieldErrors.notice_type[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Received date</label>
          <input type="date" name="received_date" defaultValue={defaultValues?.received_date ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Response deadline *</label>
          <input type="date" name="response_deadline" defaultValue={defaultValues?.response_deadline ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          {state?.fieldErrors?.response_deadline && <p className="text-sm text-red-600">{state.fieldErrors.response_deadline[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Priority</label>
          <select name="priority" defaultValue={defaultValues?.priority ?? "medium"} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Assigned to</label>
          <select name="assigned_to" defaultValue={defaultValues?.assigned_to ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.user_id}>
                {m.user_id.slice(0, 8)} — {m.role}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.assigned_to && <p className="text-sm text-red-600">{state.fieldErrors.assigned_to[0]}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm">Next action</label>
        <input name="next_action" defaultValue={defaultValues?.next_action ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Next action date</label>
        <input type="date" name="next_action_date" defaultValue={defaultValues?.next_action_date ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
