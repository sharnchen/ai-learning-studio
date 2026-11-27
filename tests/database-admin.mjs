import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {isDatabaseAdmin,databaseAdmin} from '../backend/database-admin.mjs';
import {makeSession} from '../backend/google-auth.mjs';
import {recordLogin} from '../backend/auth-records.mjs';
import worker from '../backend/tutor-worker.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const dir=mkdtempSync(join(tmpdir(),'database-admin-')),file=join(dir,'test.sqlite');
const py="import json,sqlite3,sys\np=json.load(sys.stdin)\nc=sqlite3.connect(sys.argv[1]);c.row_factory=sqlite3.Row\nc.execute('PRAGMA foreign_keys=ON')\nout=[]\nwith c:\n if 'script' in p:c.executescript(p['script'])\n else:\n  for q in p['batch']:\n   r=c.execute(q['sql'],q['args']);rows=[dict(x) for x in r.fetchall()] if r.description else []\n   out.append({'success':True,'results':rows})\nprint(json.dumps(out))";
const sql=p=>JSON.parse(execFileSync('python3',['-c',py,file],{input:JSON.stringify(p),encoding:'utf8'}));
const db={prepare(query){return {sql:query,args:[],bind(...args){this.args=args;return this},async first(){return sql({batch:[this]})[0].results[0]||null},async run(){return sql({batch:[this]})[0]},async all(){return sql({batch:[this]})[0]}}},async batch(rows){return sql({batch:rows})}};
const env={AUTH_DB:db,TUTOR_AUTH_MODE:'google',GOOGLE_CLIENT_ID:'test.apps.googleusercontent.com',SESSION_SIGNING_KEY:'database-admin-test-key-123456789012345678901234567890'};
const request=(path,token,method='GET',origin='https://sharnchen.github.io')=>new Request('https://ai-learning-studio-api.liesharn.workers.dev/public'+path,{method,headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{})}});
const reply=(data,status=200)=>Response.json(data,{status});
try{
 sql({script:readFileSync(new URL('../backend/auth-records.sql',import.meta.url),'utf8')});
 for(const email of ['sharnchen@gmail.com','liesharn@gmail.com','SHARNCHEN@GMAIL.COM'])assert.equal(isDatabaseAdmin({email}),true);
 for(const email of ['other@gmail.com','sharnchen@gmail.com.evil','sharnchen+alias@gmail.com','liesharn@gmail.com.evil','',null])assert.equal(isDatabaseAdmin({email}),false);
 let queried=0;const restricted={AUTH_DB:{prepare(){queried++;throw Error()}}};
 for(const path of ['/admin/users','/admin/sessions','/admin/summary','/admin/sql']){
  assert.equal((await databaseAdmin(request(path),restricted,{email:'other@gmail.com'},reply)).status,403);
 }
 assert.equal(queried,0,'permission check must precede database queries');
 assert.equal((await worker.fetch(request('/admin/summary'),env)).status,401,'no session');
 const tokens=[];
 for(const [sub,email]of [['first','sharnchen@gmail.com'],['second','liesharn@gmail.com'],['normal','other@gmail.com']]){const identity={sub,email},token=await makeSession(identity,env);await recordLogin(env,identity,token);tokens.push(token);}
 for(const token of tokens.slice(0,2)){
  const info=await (await worker.fetch(request('/session',token),env)).json();assert.equal(info.canManageDatabase,true);
  const summary=await worker.fetch(request('/admin/summary',token),env);assert.equal(summary.status,200);assert.equal((await summary.json()).summary.users,3);
  const sessions=await worker.fetch(request('/admin/sessions?limit=1&offset=1',token),env);assert.equal(sessions.status,200);const data=await sessions.json();assert.equal(data.rows.length,1);assert.equal(data.total,3);assert.ok(!JSON.stringify(data).includes('session_id'),'do not expose session fingerprints');
  const users=await worker.fetch(request('/admin/users?email=sharn',token),env);assert.equal(users.status,200);assert.equal((await users.json()).rows[0].email,'sharnchen@gmail.com');
 }
 assert.equal((await (await worker.fetch(request('/session',tokens[2]),env)).json()).canManageDatabase,false);
 for(const path of ['/admin/users?email=sharnchen@gmail.com','/admin/sessions?role=admin','/admin/summary'])assert.equal((await worker.fetch(request(path,tokens[2]),env)).status,403,'normal user cannot become admin through query');
 for(const query of ['limit=101','offset=-1','from=2026-02-31','from=2026-12-02&to=2026-12-01','status=bad'])assert.equal((await worker.fetch(request('/admin/sessions?'+query,tokens[0]),env)).status,400,query);
 const injected=await worker.fetch(request('/admin/users?email='+encodeURIComponent("' OR 1=1 --"),tokens[0]),env);assert.equal(injected.status,200);assert.equal((await injected.json()).total,0);
 const wildcard=await worker.fetch(request('/admin/users?email=%25',tokens[0]),env);assert.equal((await wildcard.json()).total,0,'LIKE wildcard escaped');
 assert.equal((await worker.fetch(request('/admin/summary',tokens[0],'POST'),env)).status,405);
 assert.equal((await worker.fetch(request('/admin/summary',tokens[0],'GET','https://evil.invalid'),env)).status,403);
 assert.equal((await worker.fetch(request('/admin/summary',tokens[0].slice(0,-8)+'tampered'),env)).status,401);
 // Taiwan day: local 2026-11-27 includes UTC 2026-11-26 16:00, excludes the next day's midnight.
 const start=Date.parse('2026-11-27T00:00:00+08:00')/1000;
 const uid='date-test';await db.prepare('INSERT INTO users(user_id,email,first_login_at,last_login_at) VALUES(?,?,?,?)').bind(uid,'date@example.invalid',start,start).run();
 for(const [key,time]of [['before',start-1],['inside',start],['after',start+86400]])await db.prepare('INSERT INTO login_sessions(session_id,user_id,login_at,last_seen_at,expires_at) VALUES(?,?,?,?,?)').bind(key,uid,time,time,time+3600).run();
 const day=await worker.fetch(request('/admin/sessions?email=date%40example.invalid&from=2026-11-27&to=2026-11-27',tokens[0]),env);assert.equal(day.status,200);assert.equal((await day.json()).total,1,'Taiwan inclusive date boundaries');
 console.log('PASS: exact two-email server authorization, unsigned/ordinary/forged/cross-origin rejection, both admin accounts, real SQLite filters, pagination, SQL injection prevention and Taiwan dates');
}finally{rmSync(dir,{recursive:true,force:true});}
