-- Separate comment entries; existing rich-text notes remain unchanged.
create table public.gant02_20261024_comments (
 id uuid primary key default gen_random_uuid(),
 project_id uuid references public.gant02_20261024_projects(id) on delete cascade,
 task_id uuid references public.gant02_20261024_tasks(id) on delete cascade,
 body text not null check(length(trim(body)) > 0),
 created_at timestamptz not null default now(),
 check(num_nonnulls(project_id,task_id)=1)
);
create index gant02_20261024_comments_project_idx on public.gant02_20261024_comments(project_id,created_at);
create index gant02_20261024_comments_task_idx on public.gant02_20261024_comments(task_id,created_at);
alter table public.gant02_20261024_comments enable row level security;
create policy gant02_public_access on public.gant02_20261024_comments for all to anon,authenticated using(true) with check(true);
grant select,insert,update,delete on public.gant02_20261024_comments to anon,authenticated;
