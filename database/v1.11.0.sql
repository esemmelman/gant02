-- Android quick capture: reuse/create General and add today's task + square atomically.
create function public.gant02_20261024_quick_add(p_name text,p_day date,p_task_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare target_project public.gant02_20261024_projects;
declare new_task public.gant02_20261024_tasks;
begin
 if p_day is null or p_task_id is null or p_name is null or length(trim(p_name)) not between 1 and 200 then
  raise exception 'Enter a task name and valid date';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('gant02_20261024_general_capture',0));
 select * into new_task from public.gant02_20261024_tasks where id=p_task_id;
 if found then
  if new_task.name<>trim(p_name) then raise exception 'This capture request has different text'; end if;
  select * into target_project from public.gant02_20261024_projects where id=new_task.project_id;
  return pg_catalog.jsonb_build_object('project',pg_catalog.to_jsonb(target_project),'task',pg_catalog.to_jsonb(new_task));
 end if;
 select * into target_project from public.gant02_20261024_projects
 where lower(trim(name))='general' order by (name='General') desc,position,created_at,id limit 1;
 if not found then
  insert into public.gant02_20261024_projects(name,position)
  select 'General',coalesce(max(position),0)+1024 from public.gant02_20261024_projects returning * into target_project;
 end if;
 insert into public.gant02_20261024_tasks(id,project_id,name,position,start_date,end_date)
 select p_task_id,target_project.id,trim(p_name),coalesce(max(position),0)+1024,p_day,p_day
 from public.gant02_20261024_tasks returning * into new_task;
 insert into public.gant02_20261024_cells(task_id,day,status) values(new_task.id,p_day,'assigned');
 return pg_catalog.jsonb_build_object('project',pg_catalog.to_jsonb(target_project),'task',pg_catalog.to_jsonb(new_task));
end;
$$;
grant execute on function public.gant02_20261024_quick_add(text,date,uuid) to anon,authenticated;
