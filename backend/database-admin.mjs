// Authorization uses only the server-verified Google session identity.
const databaseAdmins=new Set(['sharnchen@gmail.com','liesharn@gmail.com']);
export function isDatabaseAdmin(identity){return typeof identity?.email==='string'&&databaseAdmins.has(identity.email.trim().toLowerCase());}
function dateBoundary(value,end=false){
 if(!value)return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('date');
 const calendar=new Date(value+'T00:00:00Z');
 if(!Number.isFinite(calendar.getTime())||calendar.toISOString().slice(0,10)!==value)throw Error('date');
 return Date.parse(value+'T00:00:00+08:00')/1000+(end?86400:0);
}
export async function databaseAdmin(request,env,identity,reply){
 if(!isDatabaseAdmin(identity))return reply({error:'Administrator access required',code:'ADMIN_REQUIRED'},403);
 if(request.method!=='GET')return reply({error:'GET required'},405);
 if(!env.AUTH_DB)return reply({error:'Database unavailable'},503);
 const url=new URL(request.url),path=url.pathname;
 if(!['/public/admin/summary','/public/admin/users','/public/admin/sessions'].includes(path))return reply({error:'Not found'},404);
 try{
  if(path.endsWith('/summary')){
   const row=await env.AUTH_DB.prepare('SELECT (SELECT COUNT(*) FROM users) AS users,(SELECT COUNT(*) FROM login_sessions) AS sessions,(SELECT COUNT(*) FROM login_sessions WHERE ended_at IS NULL AND expires_at>unixepoch()) AS active,(SELECT COUNT(*) FROM login_sessions WHERE login_at>=unixepoch()-86400) AS recent').first();
   return reply({summary:row});
  }
  const email=(url.searchParams.get('email')||'').trim().toLowerCase();
  const limit=Number(url.searchParams.get('limit')||50),offset=Number(url.searchParams.get('offset')||0),status=url.searchParams.get('status')||'all';
  let from,to;try{from=dateBoundary(url.searchParams.get('from'));to=dateBoundary(url.searchParams.get('to'),true);}catch{return reply({error:'Invalid date'},400);}
  if(email.length>120||!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000||from!==null&&to!==null&&from>=to||!['all','active','logout','expired','revoked'].includes(status))return reply({error:'Invalid filter'},400);
  const users=path.endsWith('/users'),where=[],params=[];
  if(email){where.push("LOWER(email) LIKE ? ESCAPE '\\'");params.push('%'+email.replace(/[\\%_]/g,x=>'\\'+x)+'%');}
  const time=users?'last_login_at':'login_at';
  if(from!==null){where.push(time+'>=?');params.push(from);}
  if(to!==null){where.push(time+'<?');params.push(to);}
  if(!users&&status!=='all'){where.push(status==='active'?'end_reason IS NULL':'end_reason=?');if(status!=='active')params.push(status);}
  const filter=where.length?' WHERE '+where.join(' AND '):'',table=users?'users':'login_history';
  const columns=users?'email,display_name,first_login_at,last_login_at':'email,login_at,last_seen_at,expires_at,logout_at,ended_at,end_reason';
  const order=users?'last_login_at DESC,user_id':'login_at DESC,session_id';
  const count=await env.AUTH_DB.prepare('SELECT COUNT(*) AS total FROM '+table+filter).bind(...params).first();
  const result=await env.AUTH_DB.prepare('SELECT '+columns+' FROM '+table+filter+' ORDER BY '+order+' LIMIT ? OFFSET ?').bind(...params,limit,offset).all();
  return reply({rows:result.results||[],total:count?.total||0,limit,offset,timeZone:'Asia/Taipei'});
 }catch{console.error(JSON.stringify({event:'admin_database_read_failed'}));return reply({error:'Database temporarily unavailable'},503);}
}
