// Explicit opt-in smoke test. Creates then removes only its own uniquely named records.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const base=source.match(/const API='([^']+)'/)[1],key=source.match(/const KEY='([^']+)'/)[1],prefix=source.match(/const PREFIX='([^']+)'/)[1];
async function request(table,method='GET',body,id,query=''){const r=await fetch(base+prefix+table+(query||(id?'?id=eq.'+id:'')),{method,headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=representation,resolution=merge-duplicates'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.ok,true,await r.clone().text());return r.status===204?[]:r.json();}
let project;
try {
 [project]=await request('projects','POST',{name:'Gant02 smoke test '+Date.now()});
 const [task]=await request('tasks','POST',{name:'Temporary persistence check',project_id:project.id});
 const [changed]=await request('tasks','PATCH',{status:'in_progress',start_date:'2026-10-24',end_date:'2026-10-27',notes:'<p><b>Saved</b> rich text</p>'},task.id);
 assert.equal(changed.status,'in_progress');
 const [saved]=await request('tasks','GET',null,task.id);assert.equal(saved.notes,'<p><b>Saved</b> rich text</p>');assert.equal(saved.start_date,'2026-10-24');
 await request('cells','POST',[{task_id:task.id,day:'2026-10-24',status:'assigned'},{task_id:task.id,day:'2026-10-25',status:'in_progress'},{task_id:task.id,day:'2026-10-26',status:'done'}],null,'?on_conflict=task_id,day');
 const colored=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&order=day');assert.deepEqual(colored.map(c=>c.status),['assigned','in_progress','done']);
 await request('cells','POST',[{task_id:task.id,day:'2026-10-25',status:'done'}],null,'?on_conflict=task_id,day');
 const recolored=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&order=day');assert.deepEqual(recolored.map(c=>c.status),['assigned','done','done']);
 await request('cells','POST',[{task_id:task.id,day:'2026-10-25',status:null}],null,'?on_conflict=task_id,day');
 const cleared=await request('cells','GET',null,null,'?task_id=eq.'+task.id+'&day=eq.2026-10-25');assert.equal(cleared[0].status,null);
 await request('projects','DELETE',null,project.id);project=null;
 assert.equal((await request('cells','GET',null,null,'?task_id=eq.'+task.id)).length,0);
 assert.equal((await request('tasks','GET',null,task.id)).length,0);
 console.log('Live Supabase public CRUD, three independent date colors, recoloring, clearing and cascade checks passed. Temporary records removed.');
} finally {if(project)await request('projects','DELETE',null,project.id);}
