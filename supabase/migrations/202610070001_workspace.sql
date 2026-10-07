create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 300),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index tasks_user_id_created_at_idx on public.tasks(user_id, created_at desc);
alter table public.tasks enable row level security;
revoke all on public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;
create policy "Own tasks only" on public.tasks for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-files', 'workspace-files', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']);
create policy "Read own workspace files" on storage.objects for select to authenticated
  using (bucket_id = 'workspace-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Upload own workspace files" on storage.objects for insert to authenticated
  with check (bucket_id = 'workspace-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Delete own workspace files" on storage.objects for delete to authenticated
  using (bucket_id = 'workspace-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
