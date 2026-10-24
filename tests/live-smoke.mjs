// Explicit opt-in smoke test. Creates then removes only its own uniquely named records.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const base=source.match(/const API='([^']+)'/)[1],key=source.match(/const KEY='([^']+)'/)[1],prefix=source.match(/const PREFIX='([^']+)'/)[1];
async function request(table,method='GET',body,id,query=''){const r=await fetch(base+(table.startsWith('rpc/')?'rpc/'+prefix+table.slice(4):prefix+table)+(query||(id?'?id=eq.'+id:'')),{method,headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=representation,resolution=merge-duplicates'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.ok,true,await r.clone().text());return r.status===204?[]:r.json();}
let project;
try {
 [project]=await request('projects','POST',{name:'Gant02 smoke test '+Date.now()});
 const [task]=await request('rpc/create_task','POST',{p_name:'Temporary persistence check',p_project_id:project.id,p_position:1024,p_day:'2026-10-24'});
 const initial=await request('cells','GET',null,null,'?task_id=eq.'+task.id);assert.deepEqual(initial.map(c=>[c.day,c.status]),[['2026-10-24','assigned']]);
 const invalidCreate=await fetch(base+'rpc/'+prefix+'create_task',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_name:'Must not partially create',p_project_id:project.id,p_position:2048,p_day:null})});assert.equal(invalidCreate.ok,false);
 const remainingTasks=await request('tasks','GET',null,null,'?project_id=eq.'+project.id);assert.equal(remainingTasks.length,1);
 const [changed]=await request('tasks','PATCH',{status:'in_progress',start_date:'2026-10-24',end_date:'2026-10-27',notes:'<p><b>Saved</b> rich text</p>'},task.id);
 assert.equal(changed.status,'in_progress');
 const [saved]=await request('tasks','GET',null,task.id);assert.equal(saved.notes,'<p><b>Saved</b> rich text</p>');assert.equal(saved.start_date,'2026-10-24');
 await request('cells','POST',[{task_id:task.id,day:'2026-10-24',status:'assigned'},{task_id:task.id,day:'2026-10-25',status:'in_progress'},{task_id:task.id,day:'2026-10-26',status:'done'}],null,'?on_conflict=task_id,day');
 const colored=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&order=day');assert.deepEqual(colored.map(c=>c.status),['assigned','in_progress','done']);
 await request('cells','POST',[{task_id:task.id,day:'2026-10-25',status:'done'}],null,'?on_conflict=task_id,day');
 const recolored=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&order=day');assert.deepEqual(recolored.map(c=>c.status),['assigned','done','done']);
 await request('cells','POST',[{task_id:task.id,day:'2026-10-25',status:null}],null,'?on_conflict=task_id,day');
 const cleared=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&day=eq.2026-10-25');assert.equal(cleared[0].status,null);
 await request('project_cells','POST',[{project_id:project.id,day:'2026-10-28',status:'done'}],null,'?on_conflict=project_id,day');
 await request('rpc/move_cell','POST',{p_source_kind:'task',p_source_id:task.id,p_source_day:'2026-10-24',p_target_kind:'project',p_target_id:project.id,p_target_day:'2026-10-29',p_status:'assigned'});
 const movedProject=await request('project_cells','GET',null,null,'?project_id=eq.'+project.id+'&order=day');assert.deepEqual(movedProject.map(c=>c.status),['done','assigned']);
 const fromTask=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&day=eq.2026-10-24');assert.equal(fromTask[0].status,null);
 const invalidMove=await fetch(base+'rpc/'+prefix+'move_cell',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_source_kind:'project',p_source_id:project.id,p_source_day:'2026-10-29',p_target_kind:'task',p_target_id:crypto.randomUUID(),p_target_day:'2026-10-30',p_status:'assigned'})});assert.equal(invalidMove.ok,false);
 const retained=await request('project_cells','GET',null,null,'?project_id=eq.'+project.id+'&day=eq.2026-10-29');assert.equal(retained[0].status,'assigned');
 await request('rpc/move_cell','POST',{p_source_kind:'project',p_source_id:project.id,p_source_day:'2026-10-29',p_target_kind:'task',p_target_id:task.id,p_target_day:'2026-10-30',p_status:'assigned'});
 const movedTask=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&day=eq.2026-10-30');assert.equal(movedTask[0].status,'assigned');
 await request('projects','DELETE',null,project.id);project=null;
 assert.equal((await request('project_cells','GET',null,null,'?project_id=eq.'+movedProject[0].project_id)).length,0);
 assert.equal((await request('cells','GET',null,null,'?task_id=eq.'+task.id)).length,0);
 assert.equal((await request('tasks','GET',null,task.id)).length,0);
 console.log('Live Supabase atomic task creation with Assigned date, failed-create rollback, square moves, failed-move rollback and cascade checks passed. Temporary records removed.');
} finally {if(project)await request('projects','DELETE',null,project.id);}
