import {learningProgress,learningAccountId} from './learning-progress.mjs';
import {verifyGoogleToken,makeSession,googleSession} from './google-auth.mjs';
const PUBLIC_ORIGIN='https://sharnchen.github.io';
const encoder=new TextEncoder();
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const unb64=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function key(env){return crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SIGNING_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function challenge(env){const nonce=b64(crypto.getRandomValues(new Uint8Array(32))),exp=Math.floor(Date.now()/1000)+600;const payload=b64(encoder.encode(JSON.stringify({kind:'google-login-challenge',origin:PUBLIC_ORIGIN,nonce,exp})));return {nonce,challenge:payload+'.'+b64(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(payload))),clientId:env.GOOGLE_CLIENT_ID};}
async function nonceFor(value,env){if(typeof value!=='string'||value.length>2000)throw Error();const [p,s,extra]=value.split('.');if(!p||!s||extra||!await crypto.subtle.verify('HMAC',await key(env),unb64(s),encoder.encode(p)))throw Error();const data=JSON.parse(new TextDecoder().decode(unb64(p)));if(data.kind!=='google-login-challenge'||data.origin!==PUBLIC_ORIGIN||!Number.isFinite(data.exp)||data.exp<=Date.now()/1000||typeof data.nonce!=='string')throw Error();return data.nonce;}
async function textBody(request,max){const reader=request.body?.getReader();if(!reader)throw Error();let size=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error()}chunks.push(value)}const out=new Uint8Array(size);let at=0;for(const c of chunks){out.set(c,at);at+=c.length}return new TextDecoder().decode(out);}
export async function publicApi(request,env,ctx,worker){
 const own=new URL(request.url),origin=request.headers.get('Origin');
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',Vary:'Origin',...(origin===PUBLIC_ORIGIN?{'Access-Control-Allow-Origin':PUBLIC_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'}:{})};
 const reply=(data,status=200)=>Response.json(data,{status,headers});
 if(origin!==PUBLIC_ORIGIN)return reply({error:'Origin denied'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(env.TUTOR_AUTH_MODE!=='google'||!env.SESSION_SIGNING_KEY||!env.GOOGLE_CLIENT_ID)return reply({error:'Login not configured'},503);
 const path=own.pathname;
 if(path==='/public/challenge'&&request.method==='GET')return reply(await challenge(env));
 if(path==='/public/login'&&request.method==='POST'){
 if(!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'JSON required'},415);
 if(env.AUTH_RATE_LIMITER&&!(await env.AUTH_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return reply({error:'Rate limited'},429);
 try{const body=JSON.parse(await textBody(request,16000)),nonce=await nonceFor(body.challenge,env);const identity=await verifyGoogleToken(body.credential,env.GOOGLE_CLIENT_ID,nonce);const token=await makeSession(identity,env,Math.floor(Date.now()/1000),3600);return reply({authenticated:true,token,expiresIn:3600,email:identity.email});}catch{return reply({error:'Google verification failed',code:'GOOGLE_VERIFICATION_FAILED'},401)}
 }
 const bearer=request.headers.get('Authorization')||'';if(!bearer.startsWith('Bearer ')||bearer.length>4096)return reply({error:'Sign in required'},401);
 const token=bearer.slice(7);const internalHeaders=new Headers({'Cookie':'__Host-ai_session='+token});const identity=await googleSession(new Request(own.origin+'/session',{headers:internalHeaders}),env);if(!identity)return reply({error:'Session expired'},401);
 if(path==='/public/session'&&request.method==='GET')return reply({authenticated:true,email:identity.email,accountId:await learningAccountId(identity.sub)});
 if(path==='/public/progress')return learningProgress(request,env,identity,reply);
 if(path!=='/public/tutor')return reply({error:'Not found'},404);
 if(request.method!=='POST')return reply({error:'POST required'},405);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'JSON required'},415);
 let body;try{body=await textBody(request,40000)}catch{return reply({error:'Payload too large or invalid'},413)}
 internalHeaders.set('Origin',own.origin);internalHeaders.set('Content-Type','application/json');
 const result=await worker.fetch(new Request(own.origin+'/tutor',{method:'POST',headers:internalHeaders,body}),env,ctx);
 return new Response(result.body,{status:result.status,headers});
}
