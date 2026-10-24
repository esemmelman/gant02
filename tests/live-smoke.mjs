// Explicit opt-in smoke test. Creates then removes only its own uniquely named records.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const base=source.match(/const API='([^']+)'/)[1],key=source.match(/const KEY='([^']+)'/)[1],prefix=source.match(/const PREFIX='([^']+)'/)[1];
async function request(table,method='GET',body,id){const r=await fetch(base+prefix+table+(id?'?id=eq.'+id:''),{method,headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.ok,true,await r.clone().text());return r.status===204?[]:r.json();}
let project;
try {
 [project]=await request('projects','POST',{name:'Gant02 smoke test '+Date.now()});
 const [task]=await request('tasks','POST',{name:'Temporary persistence check',project_id:project.id});
 const [changed]=await request('tasks','PATCH',{status:'in_progress',start_date:'2026-10-24',end_date:'2026-10-27',notes:'<p><b>Saved</b> rich text</p>'},task.id);
 assert.equal(changed.status,'in_progress');
 const [saved]=await request('tasks','GET',null,task.id);assert.equal(saved.notes,'<p><b>Saved</b> rich text</p>');assert.equal(saved.start_date,'2026-10-24');
 await request('projects','DELETE',null,project.id);project=null;
 assert.equal((await request('tasks','GET',null,task.id)).length,0);
 console.log('Live Supabase public create/read/update/delete and cascade check passed. Temporary records removed.');
} finally {if(project)await request('projects','DELETE',null,project.id);}
