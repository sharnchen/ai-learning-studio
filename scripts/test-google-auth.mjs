import assert from 'node:assert/strict';
import {verifyGoogleToken,makeSession,googleSession,googleAuthRoute} from '../backend/google-auth.mjs';
import worker from '../backend/tutor-worker.mjs';
const env={TUTOR_AUTH_MODE:'google',GOOGLE_CLIENT_ID:'client.apps.googleusercontent.com',SESSION_SIGNING_KEY:'test-key-only-123456789012345678901234567890'};
const origin='https://ai-learning-studio-api.liesharn.workers.dev';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='test';
const b=x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url');
const now=Math.floor(Date.now()/1000),claims={iss:'https://accounts.google.com',aud:env.GOOGLE_CLIENT_ID,exp:now+3600,iat:now,sub:'any-google-user',email:'other@example.com',email_verified:true,nonce:'nonce'};
async function token(c=claims){const data=b({alg:'RS256',kid:'test'})+'.'+b(c);return data+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(data))).toString('base64url')}
const transport=async(url,options)=>{assert.equal(options.redirect,'manual','Workers only supports manual/follow redirect modes');return Response.json({keys:[jwk]})};
assert.equal((await verifyGoogleToken(await token(),env.GOOGLE_CLIENT_ID,'nonce',transport)).sub,'any-google-user');
for(const change of [{aud:'attacker'},{exp:now-1},{iss:'attacker'},{nonce:'wrong'},{email_verified:false}])await assert.rejects(()=>token({...claims,...change}).then(t=>verifyGoogleToken(t,env.GOOGLE_CLIENT_ID,'nonce',transport)));
const good=await token();await assert.rejects(()=>verifyGoogleToken(good.slice(0,-6)+'aaaaaa',env.GOOGLE_CLIENT_ID,'nonce',transport));
const session=await makeSession({sub:claims.sub,email:claims.email},env);
const req=path=>new Request(origin+path,{headers:{Cookie:'__Host-ai_session='+session}});
assert.equal((await googleSession(req('/session'),env)).sub,claims.sub);
assert.equal(await googleSession(new Request(origin,{headers:{Cookie:'__Host-ai_session='+session.slice(0,-8)+'tampered'}}),env),null);
assert.equal((await worker.fetch(new Request(origin+'/tutor',{method:'POST',headers:{Origin:origin}}),env)).status,401);
assert.equal((await worker.fetch(new Request(origin+'/studio/'),env)).headers.get('Location'),origin+'/auth/login');
assert.equal((await worker.fetch(req('/session'),env)).status,200);
assert.equal((await worker.fetch(new Request(origin+'/tutor',{method:'POST',headers:{Cookie:'__Host-ai_session='+session,Origin:'https://evil.example'}}),env)).status,403);
assert.equal((await googleAuthRoute(new Request(origin+'/auth/google',{method:'POST',headers:{Origin:'https://evil.example'}}),env)).status,403);
const login=await googleAuthRoute(new Request(origin+'/auth/login'),env);assert(login.headers.get('Set-Cookie').includes('HttpOnly'));assert((await login.text()).includes('登入 · AI Learning Studio｜AI 學習所'));
console.log('PASS: real RSA signatures, wrong issuer/audience/expiry/nonce/signature, any Google sub, signed sessions, tampering, CSRF, protected routes and login page');
const revisit=await googleAuthRoute(req('/auth/login'),env);assert.equal(revisit.status,302);assert.equal(revisit.headers.get('Location'),'/studio/#home');
assert.equal((await worker.fetch(req('/'),env)).headers.get('Location'),origin+'/studio/#home');
const {loginClient}=await import('./google-auth.mjs');const {default:vm}=await import('node:vm');
async function browserFlow(sessionOk){let callback,redirect=null;const status={textContent:''};const box={dataset:{client:env.GOOGLE_CLIENT_ID,nonce:'nonce'},clientWidth:360};const sandbox={window:{},document:{getElementById:id=>id==='status'?status:box},google:{accounts:{id:{initialize:x=>callback=x.callback,renderButton:()=>{}}}},AbortSignal,location:{replace:x=>redirect=x},fetch:async path=>Response.json(path==='/session'?{authenticated:sessionOk}:{authenticated:true})};sandbox.window.google=sandbox.google;vm.runInNewContext(loginClient,sandbox);sandbox.window.onload();await callback({credential:'mock'});return {redirect,status:status.textContent};}
assert.equal((await browserFlow(true)).redirect,'/studio/#home');const failedCookie=await browserFlow(false);assert.equal(failedCookie.redirect,null);assert(failedCookie.status.includes('Cookie'));
// Full Google callback, signed cookie issuance, then server-side home redirect.
const originalFetch=globalThis.fetch;globalThis.fetch=transport;
const callbackResponse=await googleAuthRoute(new Request(origin+'/auth/google',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:'__Host-ai_nonce=nonce'},body:JSON.stringify({credential:await token()})}),env);
assert.equal(callbackResponse.status,200);const issued=callbackResponse.headers.getSetCookie().find(x=>x.startsWith('__Host-ai_session='));assert(issued);const signedRequest=new Request(origin+'/auth/login',{headers:{Cookie:issued.split(';')[0]}});assert.equal((await googleAuthRoute(signedRequest,env)).headers.get('Location'),'/studio/#home');globalThis.fetch=originalFetch;
console.log('PASS: full Google callback/session cookie, homepage redirects, browser callback navigation, and blocked-Cookie error');

await assert.rejects(()=>verifyGoogleToken(good,env.GOOGLE_CLIENT_ID,'nonce',async()=>new Response(null,{status:302,headers:{Location:'https://untrusted.example'}})),/Google keys unavailable/);
console.log('PASS: Workers-compatible Google key fetch and redirect rejection');
