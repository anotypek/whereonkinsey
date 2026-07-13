create table if not exists public.encrypted_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  salt text not null,
  algorithm text not null check (algorithm = 'AES-256-GCM'),
  kdf text not null check (kdf = 'PBKDF2-SHA-256'),
  kdf_iterations integer not null check (kdf_iterations >= 100000),
  encryption_version smallint not null default 1,
  created_at timestamptz not null default now()
);

alter table public.encrypted_assessments enable row level security;

revoke all on table public.encrypted_assessments from anon;
grant select, insert, update, delete on table public.encrypted_assessments to authenticated;

drop policy if exists "Users can read their own encrypted assessments" on public.encrypted_assessments;
create policy "Users can read their own encrypted assessments"
  on public.encrypted_assessments for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own encrypted assessments" on public.encrypted_assessments;
create policy "Users can insert their own encrypted assessments"
  on public.encrypted_assessments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own encrypted assessments" on public.encrypted_assessments;
create policy "Users can update their own encrypted assessments"
  on public.encrypted_assessments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own encrypted assessments" on public.encrypted_assessments;
create policy "Users can delete their own encrypted assessments"
  on public.encrypted_assessments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists encrypted_assessments_user_created_idx
  on public.encrypted_assessments (user_id, created_at desc);
