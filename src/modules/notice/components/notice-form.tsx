"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
        <label htmlFor="notice-client" className="text-sm font-medium">Client *</label>
        <Select id="notice-client" name="client_id" defaultValue={defaultValues?.client_id ?? ""} aria-describedby={state?.fieldErrors?.client_id ? "notice-client-error" : undefined}>
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {state?.fieldErrors?.client_id && <p id="notice-client-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.client_id[0]}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="notice-reference" className="text-sm">Reference number</label>
        <Input id="notice-reference" name="reference_number" defaultValue={defaultValues?.reference_number ?? ""} aria-describedby={state?.fieldErrors?.reference_number ? "notice-reference-error" : undefined} />
        {state?.fieldErrors?.reference_number && <p id="notice-reference-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.reference_number[0]}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="notice-authority" className="text-sm">Authority *</label>
          <Select id="notice-authority" name="authority" defaultValue={defaultValues?.authority ?? ""} aria-describedby={state?.fieldErrors?.authority ? "notice-authority-error" : undefined}>
            <option value="">Select</option>
            <option value="income_tax">Income Tax</option>
            <option value="gst">GST</option>
            <option value="tds">TDS</option>
            <option value="other">Other</option>
          </Select>
          {state?.fieldErrors?.authority && <p id="notice-authority-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.authority[0]}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="notice-type" className="text-sm">Notice type *</label>
          <Select id="notice-type" name="notice_type" defaultValue={defaultValues?.notice_type ?? ""} aria-describedby={state?.fieldErrors?.notice_type ? "notice-type-error" : undefined}>
            <option value="">Select</option>
            <option value="scrutiny">Scrutiny</option>
            <option value="intimation">Intimation</option>
            <option value="demand">Demand</option>
            <option value="show_cause">Show Cause</option>
            <option value="other">Other</option>
          </Select>
          {state?.fieldErrors?.notice_type && <p id="notice-type-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.notice_type[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="notice-received" className="text-sm">Received date</label>
          <Input type="date" id="notice-received" name="received_date" defaultValue={defaultValues?.received_date ?? ""} />
        </div>
        <div className="space-y-1">
          <label htmlFor="notice-deadline" className="text-sm">Response deadline *</label>
          <Input type="date" id="notice-deadline" name="response_deadline" defaultValue={defaultValues?.response_deadline ?? ""} aria-describedby={state?.fieldErrors?.response_deadline ? "notice-deadline-error" : undefined} />
          {state?.fieldErrors?.response_deadline && <p id="notice-deadline-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.response_deadline[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="notice-priority" className="text-sm">Priority</label>
          <Select id="notice-priority" name="priority" defaultValue={defaultValues?.priority ?? "medium"}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="notice-assigned" className="text-sm">Assigned to</label>
          <Select id="notice-assigned" name="assigned_to" defaultValue={defaultValues?.assigned_to ?? ""} aria-describedby={state?.fieldErrors?.assigned_to ? "notice-assigned-error" : undefined}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.user_id}>
                {m.user_id.slice(0, 8)} — {m.role}
              </option>
            ))}
          </Select>
          {state?.fieldErrors?.assigned_to && <p id="notice-assigned-error" role="alert" className="text-sm text-red-600">{state.fieldErrors.assigned_to[0]}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="notice-next-action" className="text-sm">Next action</label>
        <Input id="notice-next-action" name="next_action" defaultValue={defaultValues?.next_action ?? ""} />
      </div>
      <div className="space-y-1">
        <label htmlFor="notice-next-action-date" className="text-sm">Next action date</label>
        <Input type="date" id="notice-next-action-date" name="next_action_date" defaultValue={defaultValues?.next_action_date ?? ""} />
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
