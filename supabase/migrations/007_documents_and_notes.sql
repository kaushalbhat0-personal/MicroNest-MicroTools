-- 007_documents_and_notes
-- Phase 3: documents + notes + private bucket

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  notice_id uuid not null references public.notices(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique check (char_length(storage_path) between 1 and 500),
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documents_firm on public.documents(firm_id);
create index if not exists idx_documents_notice on public.documents(notice_id);
create index if not exists idx_documents_uploaded on public.documents(uploaded_by);

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();

alter table public.documents enable row level security;

drop policy if exists "documents_member_select" on public.documents;
create policy "documents_member_select" on public.documents for select using (public.is_firm_member(firm_id));

-- No direct authenticated insert/update/delete — via server RPC/service-role path
-- Keep RLS tenant-scoped but service verifies assignment; direct insert is denied to prevent bypass
-- To allow service-role bypass, no additional policies needed (service_role bypasses RLS)

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  notice_id uuid not null references public.notices(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete restrict,
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_firm on public.notes(firm_id);
create index if not exists idx_notes_notice on public.notes(notice_id);
create index if not exists idx_notes_author on public.notes(author_id);

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at before update on public.notes for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

drop policy if exists "notes_member_select" on public.notes;
create policy "notes_member_select" on public.notes for select using (public.is_firm_member(firm_id));

-- No direct authenticated insert/update/delete — via server actions

-- Storage bucket private
insert into storage.buckets (id, name, public)
values ('notice-documents', 'notice-documents', false)
on conflict (id) do nothing;

-- Ensure bucket remains private (no public policy)
