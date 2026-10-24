// Opt-in: creates and removes one temporary task; General remains available for real capture.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const base=source.match(/const API='([^']+)'/)[1],key=source.match(/const KEY='([^']+)'/)[1],prefix=source.match(/const PREFIX='([^']+)'/)[1];
const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
async function request(path,method='GET',body){const response=await fetch(base+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});assert.ok(response.ok,await response.clone().text());return response.status===204?[]:response.json();}
const id=crypto.randomUUID(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),payload={p_name:'Temporary quick-capture check '+Date.now(),p_day:day,p_task_id:id};
try{
 const first=await request('rpc/'+prefix+'quick_add','POST',payload);
 assert.equal(first.project.name.trim().toLowerCase(),'general');assert.equal(first.task.id,id);assert.equal(first.task.project_id,first.project.id);assert.equal(first.task.start_date,day);assert.equal(first.task.end_date,day);
 const again=await request('rpc/'+prefix+'quick_add','POST',payload);assert.equal(again.task.id,id);assert.equal(again.project.id,first.project.id);
 assert.equal((await request(prefix+'tasks?id=eq.'+id)).length,1);
 const squares=await request(prefix+'cells?task_id=eq.'+id);assert.deepEqual(squares.map(c=>[c.day,c.status]),[[day,'assigned']]);
 const invalidId=crypto.randomUUID(),invalid=await fetch(base+'rpc/'+prefix+'quick_add',{method:'POST',headers,body:JSON.stringify({...payload,p_task_id:invalidId,p_day:null})});assert.equal(invalid.ok,false);assert.equal((await request(prefix+'tasks?id=eq.'+invalidId)).length,0);
 console.log('Live General capture, today dates, Assigned square, idempotent retry and invalid-input rollback passed.');
}finally{await request(prefix+'tasks?id=eq.'+id,'DELETE');console.log('Temporary capture task removed.');}
