import {learningAccountId} from './learning-progress.mjs';
export const AUTH_STORAGE_ERROR='AUTH_STORAGE_UNAVAILABLE';
function storageError(){const e=Error(AUTH_STORAGE_ERROR);e.code=AUTH_STORAGE_ERROR;return e;}
export async function sessionFingerprint(token){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');}
export async function recordLogin(env,identity,token,now=Math.floor(Date.now()/1000)){
 if(!env.AUTH_DB)return;
 try{
  const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(token.split('.')[0].replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));
  const issued=Number.isSafeInteger(data.iat)?data.iat:now,expires=data.exp;
  if(!Number.isSafeInteger(expires)||expires<=issued)throw Error('invalid session');
  const user=await learningAccountId(identity.sub),session=await sessionFingerprint(token);
  const results=await env.AUTH_DB.batch([
   env.AUTH_DB.prepare('INSERT INTO users (user_id,google_sub,email,display_name,first_login_at,last_login_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,first_login_at=MIN(users.first_login_at,excluded.first_login_at),last_login_at=MAX(users.last_login_at,excluded.last_login_at)').bind(user,identity.sub,identity.email,identity.name||null,issued,issued),
   env.AUTH_DB.prepare("UPDATE login_sessions SET ended_at=expires_at,end_reason='expired' WHERE user_id=? AND ended_at IS NULL AND expires_at<=?").bind(user,now),
   env.AUTH_DB.prepare('INSERT INTO login_sessions (session_id,user_id,login_at,last_seen_at,expires_at) VALUES (?,?,?,?,?) ON CONFLICT(session_id) DO NOTHING').bind(session,user,issued,Math.max(issued,now),expires)
  ]);
  if(results.some(r=>r.success===false))throw Error('write failed');
 }catch{throw storageError();}
}
export async function recordedSessionActive(env,identity,token,now=Math.floor(Date.now()/1000)){
 if(!env.AUTH_DB)return true;
 try{
  const session=await sessionFingerprint(token);
  let row=await env.AUTH_DB.prepare('SELECT user_id,ended_at,last_seen_at,expires_at FROM login_sessions WHERE session_id=?').bind(session).first();
  // Migrate still-valid sessions issued before logging was enabled, using their signed iat.
  if(!row){await recordLogin(env,identity,token,now);row=await env.AUTH_DB.prepare('SELECT user_id,ended_at,last_seen_at,expires_at FROM login_sessions WHERE session_id=?').bind(session).first();}
  if(!row||row.user_id!==await learningAccountId(identity.sub)||row.ended_at!==null||row.expires_at<=now)return false;
  if(now-row.last_seen_at>=300)await env.AUTH_DB.prepare('UPDATE login_sessions SET last_seen_at=MAX(last_seen_at,?) WHERE session_id=? AND ended_at IS NULL').bind(now,session).run();
  return true;
 }catch{throw storageError();}
}
export async function recordExpiredSession(env,token,now=Math.floor(Date.now()/1000)){
 if(!env.AUTH_DB)return;
 try{const r=await env.AUTH_DB.prepare("UPDATE login_sessions SET ended_at=expires_at,end_reason='expired' WHERE session_id=? AND ended_at IS NULL AND expires_at<=?").bind(await sessionFingerprint(token),now).run();if(r.success===false)throw Error();}catch{throw storageError();}
}
export async function recordLogout(env,identity,token,now=Math.floor(Date.now()/1000)){
 if(!env.AUTH_DB)return;
 try{
  await env.AUTH_DB.prepare("UPDATE login_sessions SET logout_at=?,ended_at=?,end_reason='logout',last_seen_at=MAX(last_seen_at,?) WHERE session_id=? AND user_id=? AND ended_at IS NULL AND expires_at>?").bind(now,now,now,await sessionFingerprint(token),await learningAccountId(identity.sub),now).run();
 }catch{throw storageError();}
}
