-- Create the task and its initial Assigned square together, using the browser's local date.
create function public.gant02_20261024_create_task(
 p_project_id uuid, p_name text, p_position double precision, p_day date
) returns setof public.gant02_20261024_tasks
language plpgsql security invoker set search_path = '' as $$
declare new_task public.gant02_20261024_tasks;
begin
 insert into public.gant02_20261024_tasks(project_id,name,position)
 values(p_project_id,p_name,p_position) returning * into new_task;
 insert into public.gant02_20261024_cells(task_id,day,status)
 values(new_task.id,p_day,'assigned');
 return next new_task;
end;
$$;
grant execute on function public.gant02_20261024_create_task(uuid,text,double precision,date) to anon,authenticated;
