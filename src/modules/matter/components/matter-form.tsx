"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createMatterAction, type CreateMatterState } from "../actions/create-matter";
import { updateMatterAction, type UpdateMatterState } from "../actions/update-matter";
import type { Client } from "@/modules/client/types/client-types";
import type { Matter } from "../types/matter-types";
import { MATTER_TYPES } from "../constants/matter-constants";

type Props = {
  clients: Client[];
  members: { user_id: string; role: string; email?: string }[];
  matter?: Matter | null;
  mode: "create" | "edit";
};

export function MatterForm({ clients, members, matter, mode }: Props) {
  const createState = useActionState(createMatterAction, {} as CreateMatterState);
  const updateState = useActionState(updateMatterAction, {} as UpdateMatterState);
  const isCreate = mode === "create";
  const [state, formAction, pending]: [unknown, (payload: FormData) => void, boolean] = isCreate
    ? (createState as unknown as [unknown, (payload: FormData) => void, boolean])
    : (updateState as unknown as [unknown, (payload: FormData) => void, boolean]);

  const s = state as { error?: string; fieldErrors?: Record<string, string[]> };

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && matter && <input type="hidden" name="id" value={matter.id} />}

      <div>
        <label htmlFor="matter-title" className="text-sm font-medium">Title</label>
        <Input
          id="matter-title"
          name="title"
          defaultValue={matter?.title ?? ""}
          className="mt-1"
          maxLength={200}
          required
          aria-describedby={s?.fieldErrors?.title ? "matter-title-error" : undefined}
        />
        {s?.fieldErrors?.title && <p id="matter-title-error" className="text-sm text-red-600" role="alert">{s.fieldErrors.title[0]}</p>}
      </div>

      {isCreate && (
        <>
          <div>
            <label htmlFor="matter-type" className="text-sm font-medium">Matter Type</label>
            <Select id="matter-type" name="matter_type" defaultValue={matter?.matter_type ?? "civil"} className="mt-1" aria-describedby={s?.fieldErrors?.matter_type ? "matter-type-error" : undefined}>
              {MATTER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            {s?.fieldErrors?.matter_type && <p id="matter-type-error" className="text-sm text-red-600" role="alert">{s.fieldErrors.matter_type[0]}</p>}
          </div>

          <div>
            <label htmlFor="matter-client" className="text-sm font-medium">Client</label>
            <Select id="matter-client" name="client_id" defaultValue={matter?.client_id ?? ""} className="mt-1" required aria-describedby={s?.fieldErrors?.client_id ? "matter-client-error" : undefined}>
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {s?.fieldErrors?.client_id && <p id="matter-client-error" className="text-sm text-red-600" role="alert">{s.fieldErrors.client_id[0]}</p>}
          </div>
        </>
      )}

      <div>
        <label htmlFor="matter-assigned" className="text-sm font-medium">Assigned To</label>
        <Select id="matter-assigned" name="assigned_to" defaultValue={matter?.assigned_to ?? ""} className="mt-1">
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.email ?? m.user_id.slice(0, 8)} ({m.role})
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="matter-next-action" className="text-sm font-medium">Next Action</label>
        <Input
          id="matter-next-action"
          name="next_action"
          defaultValue={matter?.next_action ?? ""}
          className="mt-1"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="matter-next-action-date" className="text-sm font-medium">Next Action Date</label>
          <Input type="date" id="matter-next-action-date" name="next_action_date" defaultValue={matter?.next_action_date ?? ""} className="mt-1" />
        </div>
        <div>
          <label htmlFor="matter-deadline" className="text-sm font-medium">Deadline</label>
          <Input type="date" id="matter-deadline" name="deadline" defaultValue={matter?.deadline ?? ""} className="mt-1" />
        </div>
      </div>

      {s?.error && <p className="text-sm text-red-600" role="alert">{s.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : isCreate ? "Create Matter" : "Update Matter"}
      </Button>
    </form>
  );
}
