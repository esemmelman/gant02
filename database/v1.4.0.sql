-- Project date colors and transactional square moves. Applied in bnaimitzvah.
create table public.gant02_20261024_project_cells (
 project_id uuid not null references public.gant02_20261024_projects(id) on delete cascade,
 day date not null, status text check(status in ('assigned','in_progress','done')),
 primary key(project_id,day)
);
alter table public.gant02_20261024_project_cells enable row level security;
create policy gant02_public_access on public.gant02_20261024_project_cells for all to anon,authenticated using(true) with check(true);
grant select,insert,update,delete on public.gant02_20261024_project_cells to anon,authenticated;

create function public.gant02_20261024_move_cell(
 p_source_kind text, p_source_id uuid, p_source_day date,
 p_target_kind text, p_target_id uuid, p_target_day date, p_status text
) returns void language plpgsql security invoker set search_path = '' as $$
declare actual_status text;
begin
 if p_source_kind not in ('task','project') or p_target_kind not in ('task','project')
 or p_status is null or p_status not in ('assigned','in_progress','done')
 or p_source_day is null or p_target_day is null then raise exception 'Invalid square move'; end if;
 -- Consistent parent lock order keeps simultaneous moves from losing updates.
 perform id from public.gant02_20261024_projects where id in (p_source_id,p_target_id) order by id for update;
 perform id from public.gant02_20261024_tasks where id in (p_source_id,p_target_id) order by id for update;
 if p_source_kind='task' then
  select status into actual_status from public.gant02_20261024_cells where task_id=p_source_id and day=p_source_day;
  if not found then
   select status into actual_status from public.gant02_20261024_tasks where id=p_source_id and p_source_day between start_date and end_date;
  end if;
 else
  select status into actual_status from public.gant02_20261024_project_cells where project_id=p_source_id and day=p_source_day;
 end if;
 if actual_status is distinct from p_status then raise exception 'Source color changed. Refresh and try again.'; end if;
 if p_source_kind=p_target_kind and p_source_id=p_target_id and p_source_day=p_target_day then return; end if;
 if p_source_kind='task' then
  insert into public.gant02_20261024_cells(task_id,day,status) values(p_source_id,p_source_day,null)
  on conflict(task_id,day) do update set status=null;
 else
  insert into public.gant02_20261024_project_cells(project_id,day,status) values(p_source_id,p_source_day,null)
  on conflict(project_id,day) do update set status=null;
 end if;
 if p_target_kind='task' then
  insert into public.gant02_20261024_cells(task_id,day,status) values(p_target_id,p_target_day,p_status)
  on conflict(task_id,day) do update set status=excluded.status;
 else
  insert into public.gant02_20261024_project_cells(project_id,day,status) values(p_target_id,p_target_day,p_status)
  on conflict(project_id,day) do update set status=excluded.status;
 end if;
end;
$$;
grant execute on function public.gant02_20261024_move_cell(text,uuid,date,text,uuid,date,text) to anon,authenticated;
