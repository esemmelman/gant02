-- v1.13.0: one level of subtasks; existing dates use the same isolated cells table.
alter table public.gant02_20261024_tasks add column parent_task_id uuid references public.gant02_20261024_tasks(id) on delete cascade;
create index gant02_20261024_tasks_parent_idx on public.gant02_20261024_tasks(parent_task_id);
create function public.gant02_20261024_task_hierarchy() returns trigger language plpgsql security invoker set search_path='' as $$
declare parent_row public.gant02_20261024_tasks;
begin
 if new.parent_task_id is not null then
  if new.id = new.parent_task_id then raise exception 'A task cannot be its own subtask'; end if;
  select * into parent_row from public.gant02_20261024_tasks where id=new.parent_task_id for update;
  if not found or parent_row.parent_task_id is not null then raise exception 'Choose a top-level parent task'; end if;
  if new.project_id<>parent_row.project_id then raise exception 'Subtasks must remain in their parent project'; end if;
  if exists(select 1 from public.gant02_20261024_tasks where parent_task_id=new.id) then raise exception 'A parent task cannot become a subtask'; end if;
 end if;
 return new;
end $$;
create trigger gant02_20261024_task_hierarchy before insert or update of parent_task_id,project_id on public.gant02_20261024_tasks for each row execute function public.gant02_20261024_task_hierarchy();
create function public.gant02_20261024_move_subtasks() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if old.project_id is distinct from new.project_id then
  update public.gant02_20261024_tasks set project_id=new.project_id where parent_task_id=new.id;
 end if;
 return new;
end $$;
create trigger gant02_20261024_move_subtasks after update of project_id on public.gant02_20261024_tasks for each row execute function public.gant02_20261024_move_subtasks();
revoke execute on function public.gant02_20261024_task_hierarchy(),public.gant02_20261024_move_subtasks() from public;
notify pgrst,'reload schema';
