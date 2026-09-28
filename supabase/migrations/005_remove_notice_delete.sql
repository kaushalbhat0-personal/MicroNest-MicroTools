-- 005_remove_notice_delete
-- Correction C: notice DELETE not in Phase 2B

drop policy if exists "notices_owner_admin_delete" on public.notices;
-- No authenticated delete policy remains — notice lifecycle ends at CLOSED
