-- Already provisioned in bnaimitzvah on 2026-10-24. Reference only.
create table public.gant02_20261024_projects (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 200),
 notes text not null default '', position double precision not null default 0,
 created_at timestamptz not null default now()
);
create table public.gant02_20261024_tasks (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.gant02_20261024_projects(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 200),
 assignee text not null default '',
 status text not null default 'assigned' check(status in ('assigned','in_progress','done')),
 start_date date, end_date date, notes text not null default '',
 position double precision not null default 0, created_at timestamptz not null default now(),
 check((start_date is null and end_date is null) or
 (start_date is not null and end_date is not null and end_date >= start_date))
);
create index gant02_20261024_tasks_project_idx on public.gant02_20261024_tasks(project_id);
alter table public.gant02_20261024_projects enable row level security;
alter table public.gant02_20261024_tasks enable row level security;
create policy gant02_public_access on public.gant02_20261024_projects for all to anon, authenticated using(true) with check(true);
create policy gant02_public_access on public.gant02_20261024_tasks for all to anon, authenticated using(true) with check(true);
grant select,insert,update,delete on public.gant02_20261024_projects,public.gant02_20261024_tasks to anon,authenticated;
