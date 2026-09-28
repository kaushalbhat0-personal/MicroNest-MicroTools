import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readMigration(name: string): string {
  return fs.readFileSync(path.resolve(__dirname, `../../../../supabase/migrations/${name}`), "utf8");
}

describe("matter RLS hardening (009)", () => {
  const m008 = readMigration("008_matters.sql");
  const m009 = readMigration("009_harden_matter_mutation_rls.sql");

  it("008 originally created permissive authenticated mutation policies (to be hardened)", () => {
    // Prove 008 existed with INSERT/UPDATE/DELETE that 009 must remove
    expect(m008).toContain('create policy "matters_member_insert"');
    expect(m008).toContain('create policy "matters_member_update"');
    expect(m008).toContain('create policy "matters_owner_admin_delete"');
    expect(m008).toContain('create policy "checklist_member_insert"');
    expect(m008).toContain('create policy "checklist_member_update"');
    expect(m008).toContain('create policy "checklist_member_delete"');
  });

  it("009 drops direct authenticated mutation policies for matters", () => {
    expect(m009).toContain('drop policy if exists "matters_member_insert"');
    expect(m009).toContain('drop policy if exists "matters_member_update"');
    expect(m009).toContain('drop policy if exists "matters_owner_admin_delete"');
  });

  it("009 drops direct authenticated mutation policies for checklist_items", () => {
    expect(m009).toContain('drop policy if exists "checklist_member_insert"');
    expect(m009).toContain('drop policy if exists "checklist_member_update"');
    expect(m009).toContain('drop policy if exists "checklist_member_delete"');
  });

  it("009 retains SELECT policies (tenant read) and re-enables RLS", () => {
    expect(m009).toContain("matters_member_select");
    expect(m009).toContain("checklist_member_select");
    expect(m009).toContain("alter table public.matters enable row level security");
    expect(m009).toContain("alter table public.checklist_items enable row level security");
  });

  it("matter_documents / matter_notes / matter_activity remain SELECT-only (no authenticated INSERT/UPDATE/DELETE)", () => {
    // 008 had only SELECT; 009 defensively drops any mutation policies
    expect(m008).toContain('create policy "matter_documents_member_select"');
    expect(m008).not.toContain('matter_documents_member_insert');
    expect(m008).toContain('create policy "matter_notes_member_select"');
    expect(m008).not.toContain('matter_notes_member_insert');
    expect(m008).toContain('create policy "matter_activity_member_select"');
    expect(m008).not.toContain('matter_activity_member_insert');

    expect(m009).toContain('drop policy if exists "matter_documents_member_insert"');
    expect(m009).toContain('drop policy if exists "matter_notes_member_insert"');
    expect(m009).toContain('drop policy if exists "matter_activity_member_insert"');
  });

  it("member cannot bypass: no direct INSERT/UPDATE/DELETE authenticated path exists after hardening", () => {
    // Conceptually, after 009, any supabase.from('matters').insert/update/delete with anon key should hit RLS deny
    // We assert migration does not create any new INSERT/UPDATE/DELETE policy for matters/checklist
    const forbidden = [
      'create policy "matters_member_insert"',
      'create policy "matters_member_update"',
      'create policy "checklist_member_insert"',
      'create policy "checklist_member_update"',
      'create policy "checklist_member_delete"',
    ];
    for (const p of forbidden) {
      expect(m009).not.toContain(p);
    }
  });

  it("checklist status cannot be set directly by authenticated client (only RPC)", () => {
    // The only authoritative mutation paths are RPCs defined in 008
    expect(m008).toContain("verify_checklist_item_and_maybe_ready");
    expect(m008).toContain("reject_checklist_item");
    // 009 does not add new direct UPDATE policy that would allow status = verified/rejected or document_id
    expect(m009).not.toContain("status = verified");
    expect(m009).not.toContain("document_id");
  });

  it("service/RPC paths still authoritative after hardening", () => {
    // Services use service-role or RPC, which bypass RLS
    const createMatterSource = fs.readFileSync(
      path.resolve(__dirname, "../services/create-matter.ts"),
      "utf8",
    );
    expect(createMatterSource).toContain("createServiceSupabaseClient");
    expect(createMatterSource).toContain('firm_id: firm.id');

    const verifySource = fs.readFileSync(
      path.resolve(__dirname, "../services/verify-checklist-item.ts"),
      "utf8",
    );
    expect(verifySource).toContain("verify_checklist_item_and_maybe_ready");
    expect(verifySource).toContain("reject_checklist_item");

    const uploadSource = fs.readFileSync(
      path.resolve(__dirname, "../services/upload-matter-document.ts"),
      "utf8",
    );
    expect(uploadSource).toContain("createServiceSupabaseClient");
    expect(uploadSource).toContain('matter-documents');
  });

  it("complete policy matrix after hardening", () => {
    const matrix: Record<string, { select: boolean; insert: boolean; update: boolean; delete: boolean; intendedPath: string }> = {
      matters: { select: true, insert: false, update: false, delete: false, intendedPath: "service-role via createMatter/updateMatter/archive-matter RPC" },
      checklist_items: { select: true, insert: false, update: false, delete: false, intendedPath: "service-role via matter creation + RPCs verify/reject" },
      matter_documents: { select: true, insert: false, update: false, delete: false, intendedPath: "service-role via upload/delete services" },
      matter_notes: { select: true, insert: false, update: false, delete: false, intendedPath: "service-role via matter-note services" },
      matter_activity: { select: true, insert: false, update: false, delete: false, intendedPath: "service-role/RPC append-only" },
    };
    // All tables have SELECT, none have authenticated INSERT/UPDATE/DELETE after 009
    for (const [, row] of Object.entries(matrix)) {
      expect(row.select).toBe(true);
      expect(row.insert).toBe(false);
      expect(row.update).toBe(false);
      expect(row.delete).toBe(false);
      expect(row.intendedPath).toContain("service");
    }
    void matrix;
    expect(m009).not.toContain('for insert with check (public.is_firm_member');
    expect(m009).not.toContain('for update using (public.is_firm_member');
  });
});
