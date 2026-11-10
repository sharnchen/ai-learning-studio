import {loginPage} from './login-page.mjs';
// Google sign-in: public client ID, Google-signed ID token, server-only session key.
const enc=new TextEncoder();
const encode=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
const json=s=>JSON.parse(new TextDecoder().decode(decode(s)));
const cookie=(r,n)=>(r.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(n+'='))?.slice(n.length+1)||'';
const setCookie=(n,v,age)=>`${n}=${v}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const sessionName='__Host-ai_session',nonceName='__Host-ai_nonce';
const pageHeaders={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Cross-Origin-Opener-Policy':'same-origin-allow-popups','Content-Security-Policy':"default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client; frame-src https://accounts.google.com; connect-src 'self' https://accounts.google.com/gsi/; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' data: https://*.googleusercontent.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
async function sessionKey(env){return crypto.subtle.importKey('raw',enc.encode(env.SESSION_SIGNING_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function makeSession(identity,env,now=Math.floor(Date.now()/1000),ttl=28800){
 const payload=encode(enc.encode(JSON.stringify({sub:identity.sub,email:identity.email,iat:now,exp:now+ttl,aud:env.GOOGLE_CLIENT_ID})));
 return payload+'.'+encode(await crypto.subtle.sign('HMAC',await sessionKey(env),enc.encode(payload)));
}
export async function googleSession(request,env){
 try{if(!env.SESSION_SIGNING_KEY)return null;const [payload,signature,extra]=cookie(request,sessionName).split('.');if(!payload||!signature||extra)return null;
 if(!await crypto.subtle.verify('HMAC',await sessionKey(env),decode(signature),enc.encode(payload)))return null;
 const data=json(payload),now=Math.floor(Date.now()/1000);if(data.aud!==env.GOOGLE_CLIENT_ID||!data.sub||!data.email||!Number.isFinite(data.exp)||data.exp<=now||data.iat>now+60)return null;return data;
 }catch{return null}
}
export async function verifyGoogleToken(token,clientId,nonce,transport=fetch){
 if(typeof token!=='string'||token.length>12000||!nonce)throw Error('Invalid credential');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid credential');const head=json(parts[0]),claims=json(parts[1]),now=Math.floor(Date.now()/1000);
 if(head.alg!=='RS256'||typeof head.kid!=='string'||!['accounts.google.com','https://accounts.google.com'].includes(claims.iss)||claims.aud!==clientId||(claims.azp&&claims.azp!==clientId)||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60||claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub||typeof claims.email!=='string'||claims.email_verified!==true)throw Error('Invalid claims');
 const url='https://www.googleapis.com/oauth2/v3/certs';
 const cache=typeof caches!=='undefined'?caches.default:null;
 let response=await cache?.match(url);if(!response){response=await transport(url,{signal:AbortSignal.timeout(10000),redirect:'manual'});if(!response.ok)throw Error('Google keys unavailable');if(cache)try{await cache.put(url,response.clone())}catch{/* Cache outages must not invalidate an otherwise valid login. */}}
 const {keys}=await response.json(),jwk=keys?.find(k=>k.kid===head.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256'));
 if(!jwk)throw Error('Unknown signing key');const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),enc.encode(parts[0]+'.'+parts[1])))throw Error('Invalid signature');
 return {sub:claims.sub,email:claims.email};
}
export const loginClient=`window.onload=()=>{
 const box=document.getElementById('google-login'),status=document.getElementById('status');
 const home='/studio/#home';
 async function confirmedSession(){const r=await fetch('/session',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});return r.ok&&(await r.json()).authenticated===true}
 async function finishLogin(result){status.textContent='正在確認登入…';
 try{const r=await fetch('/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',signal:AbortSignal.timeout(20000),body:JSON.stringify({credential:result.credential})});
 if(!r.ok){if(await confirmedSession()){location.replace(home);return}throw Error(r.status===429?'登入嘗試太頻繁，請稍候一分鐘再試。':'網站未能確認 Google 登入，請重新整理後再試。')}
 if(!await confirmedSession())throw Error('Google 驗證完成，但網站未能保存登入狀態；請允許此網站的 Cookie，再重新登入。');
 status.textContent='登入成功，正在進入學習首頁…';location.replace(home);
 }catch(error){status.textContent=error.name==='TimeoutError'?'登入連線逾時，請檢查網路後再試。':error.message||'登入未完成，請重新整理後再試。';}}
 if(!window.google){status.textContent='Google 登入元件無法載入，請重新整理。';return}
 google.accounts.id.initialize({client_id:box.dataset.client,nonce:box.dataset.nonce,auto_select:false,callback:finishLogin});
 google.accounts.id.renderButton(box,{theme:'outline',size:'large',text:'signin_with',locale:'zh_TW',width:Math.min(360,box.clientWidth)});
};`;
export async function googleAuthRoute(request,env){
 const url=new URL(request.url),path=url.pathname,origin=url.origin;
 const reply=(data,status=200,extra={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
 if(path==='/auth/client.js'&&request.method==='GET')return new Response(loginClient,{headers:{'Content-Type':'application/javascript','Cache-Control':'no-store'}});
 if(path==='/auth/login'&&request.method==='GET'){
 if(!env.GOOGLE_CLIENT_ID||!env.SESSION_SIGNING_KEY)return reply({error:'Login not configured'},503);
 if(await googleSession(request,env))return new Response(null,{status:302,headers:{Location:'/studio/#home','Cache-Control':'no-store'}});
 const existingNonce=cookie(request,nonceName);
 const nonce=/^[A-Za-z0-9_-]{43}$/.test(existingNonce)?existingNonce:encode(crypto.getRandomValues(new Uint8Array(32)));
 return new Response(loginPage(env.GOOGLE_CLIENT_ID.replace(/[^a-zA-Z0-9._-]/g,''),nonce),{headers:{...pageHeaders,'Set-Cookie':setCookie(nonceName,nonce,600)}});
 }
 if(path==='/auth/google'&&request.method==='POST'){
 if(request.headers.get('Origin')!==origin||!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'Origin denied'},403);
 if(!env.SESSION_SIGNING_KEY||!env.GOOGLE_CLIENT_ID)return reply({error:'Login not configured'},503);
 if(env.AUTH_RATE_LIMITER&&!(await env.AUTH_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return reply({error:'Rate limited'},429);
 try{const reader=request.body?.getReader();let text='',size=0;if(!reader)throw Error();for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();throw Error()}text+=new TextDecoder().decode(value)}
 const {credential}=JSON.parse(text),identity=await verifyGoogleToken(credential,env.GOOGLE_CLIENT_ID,cookie(request,nonceName));
 const headers=new Headers({'Cache-Control':'no-store','Content-Type':'application/json'});headers.append('Set-Cookie',setCookie(sessionName,await makeSession(identity,env),28800));headers.append('Set-Cookie',setCookie(nonceName,'',0));return new Response('{"authenticated":true}',{headers});
 }catch(error){const code=error.message==='Invalid credential'?'LOGIN_REFRESH_REQUIRED':error.message==='Google keys unavailable'?'GOOGLE_KEYS_UNAVAILABLE':'GOOGLE_VERIFICATION_FAILED';console.error(JSON.stringify({event:'google_login_failed',code}));return reply({error:'Google login failed; refresh and try again',code},401)}
 }
 if(path==='/auth/logout'&&request.method==='POST'){
 if(request.headers.get('Origin')!==origin)return reply({error:'Origin denied'},403);
 return new Response(null,{status:303,headers:{Location:'/auth/login','Cache-Control':'no-store','Set-Cookie':setCookie(sessionName,'',0)}});
 }
 return reply({error:'Not found'},404);
}
