import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import {
  canCreateMatterNote,
  canDeleteMatterNote,
  canEditMatterNote,
} from "../permissions/matter-permissions";
import { createMatterNoteSchema, updateMatterNoteSchema } from "../schemas/matter-note-schema";
import { getMatterByIdForFirm } from "../repositories/matter-repository";
import { getMatterNoteById } from "../repositories/matter-note-repository";

export async function createMatterNoteForCurrentFirm(raw: unknown) {
  const parsed = createMatterNoteSchema.safeParse(raw);
  if (!parsed.success) return { error: "Fix validation errors" };
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  const supabase = await createServerSupabaseClient();
  const matter = await getMatterByIdForFirm(supabase, parsed.data.matterId, firm.id);
  if (!matter) return { error: "Matter not found in your firm" };
  const role = await getMembershipRole(firm.id);
  if (!canCreateMatterNote(role as never, user.id, matter.assigned_to)) return { error: "Not allowed" };

  const service = createServiceSupabaseClient();
  const { data, error } = await service
    .from("matter_notes")
    .insert({
      firm_id: firm.id,
      matter_id: matter.id,
      author_id: user.id,
      content: parsed.data.content.trim(),
    })
    .select("*")
    .single();
  if (error) return { error: error.message };

  await service.from("matter_activity").insert({
    firm_id: firm.id,
    matter_id: matter.id,
    actor_id: user.id,
    action: "note_added",
    metadata: { note_id: data.id },
  });

  return { note: data };
}

export async function updateMatterNoteForCurrentFirm(raw: unknown) {
  const parsed = updateMatterNoteSchema.safeParse(raw);
  if (!parsed.success) return { error: "Fix validation errors" };
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  const supabase = await createServerSupabaseClient();
  const note = await getMatterNoteById(supabase, parsed.data.noteId);
  if (!note || note.firm_id !== firm.id) return { error: "Note not found in your firm" };
  const matter = await getMatterByIdForFirm(supabase, note.matter_id, firm.id);
  if (!matter) return { error: "Matter not found" };
  const role = await getMembershipRole(firm.id);
  if (!canEditMatterNote(role as never, user.id, matter.assigned_to, note.author_id))
    return { error: "Not allowed" };
  const service = createServiceSupabaseClient();
  const { data, error } = await service
    .from("matter_notes")
    .update({ content: parsed.data.content.trim() })
    .eq("id", note.id)
    .select("*")
    .single();
  if (error) return { error: error.message };
  return { note: data };
}

export async function deleteMatterNoteForCurrentFirm(noteId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  const supabase = await createServerSupabaseClient();
  const note = await getMatterNoteById(supabase, noteId);
  if (!note || note.firm_id !== firm.id) return { error: "Note not found in your firm" };
  const matter = await getMatterByIdForFirm(supabase, note.matter_id, firm.id);
  if (!matter) return { error: "Matter not found" };
  const role = await getMembershipRole(firm.id);
  if (!canDeleteMatterNote(role as never, user.id, matter.assigned_to, note.author_id))
    return { error: "Not allowed" };
  const service = createServiceSupabaseClient();
  const { error } = await service.from("matter_notes").delete().eq("id", note.id);
  if (error) return { error: error.message };
  return { ok: true };
}
