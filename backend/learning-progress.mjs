// Account selection comes exclusively from the verified Google subject, never the request body.
export async function learningAccountId(subject){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('google:'+subject));return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')}
export const progressSchema='CREATE TABLE IF NOT EXISTS learning_progress (account_id TEXT PRIMARY KEY, state TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)';
async function boundedJSON(request){const reader=request.body?.getReader();if(!reader)throw Error('body');const chunks=[];let length=0;for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>1048576){await reader.cancel();throw Error('large')}chunks.push(value)}const all=new Uint8Array(length);let at=0;for(const c of chunks){all.set(c,at);at+=c.length}return JSON.parse(new TextDecoder().decode(all))}
export async function learningProgress(request,env,identity,reply){
 if(!env.LEARNING_DB)return reply({error:'Progress storage unavailable'},503);
 const accountId=await learningAccountId(identity.sub);
 try{
 if(request.method==='GET'){const row=await env.LEARNING_DB.prepare('SELECT state, revision, updated_at FROM learning_progress WHERE account_id = ?').bind(accountId).first();return reply({accountId,state:row?JSON.parse(row.state):null,revision:row?.revision||0,updatedAt:row?.updated_at||null})}
 if(request.method!=='POST')return reply({error:'GET or POST required'},405);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'JSON required'},415);
 let body;try{body=await boundedJSON(request)}catch(e){return reply({error:e.message==='large'?'Progress too large':'Invalid JSON'},e.message==='large'?413:400)}
 if(!body?.state||typeof body.state!=='object'||Array.isArray(body.state)||!Number.isSafeInteger(body.revision)||body.revision<0)return reply({error:'Invalid progress'},400);
 const allowed=['done','notes','scores','known','termLearning','labRuns','assessment','lastPosition'];const state=Object.fromEntries(allowed.filter(k=>Object.hasOwn(body.state,k)).map(k=>[k,body.state[k]]));
 if(!Array.isArray(state.done)||!Array.isArray(state.known)||!state.notes||typeof state.notes!=='object'||Array.isArray(state.notes))return reply({error:'Invalid progress structure'},400);
 const payload=JSON.stringify(state),updatedAt=new Date().toISOString();
 const row=body.revision===0?await env.LEARNING_DB.prepare('INSERT INTO learning_progress (account_id,state,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(account_id) DO NOTHING RETURNING revision').bind(accountId,payload,updatedAt).first():await env.LEARNING_DB.prepare('UPDATE learning_progress SET state = ?, revision = revision + 1, updated_at = ? WHERE account_id = ? AND revision = ? RETURNING revision').bind(payload,updatedAt,accountId,body.revision).first();
 if(!row)return reply({error:'Progress changed on another device',code:'PROGRESS_CONFLICT'},409);
 return reply({saved:true,revision:row.revision,updatedAt});
 }catch{console.error(JSON.stringify({event:'learning_progress_storage_error'}));return reply({error:'Progress storage temporarily unavailable'},503)}
}
