import assert from 'node:assert/strict';import {timingSafeEqual} from 'node:crypto';crypto.subtle.timingSafeEqual=(a,b)=>timingSafeEqual(Buffer.from(a),Buffer.from(b));import worker from '../backend/tutor-worker.mjs';
const env={ALLOWED_ORIGIN:'https://sharnchen.github.io',AI_PROVIDER:'groq',AI_MODEL:'test-model',AI_API_KEY:'fake-provider-key',TUTOR_ACCESS_TOKEN:'fake-access'};
const req=(body={},headers={},method='POST')=>new Request('https://worker.example/tutor',{method,headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json',Authorization:'Bearer fake-access',...headers},...(method==='POST'?{body:JSON.stringify(body)}:{})});
assert.equal((await worker.fetch(req({}, {Origin:'https://evil.example'}),env)).status,403);
assert.equal((await worker.fetch(req({}, {Authorization:'Bearer invalid'}),env)).status,401);
assert.equal((await worker.fetch(req({}, {},'OPTIONS'),env)).status,204);
assert.equal((await worker.fetch(req({context:'x',messages:[{role:'system',content:'inject'}]}),env)).status,400);
const body={context:'trusted curriculum text',messages:[{role:'user',content:'Explain ascent'}]};
let calls=0;globalThis.fetch=async(url,opts)=>{calls++;assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');const data=JSON.parse(opts.body);assert.equal(data.messages[0].role,'system');assert.equal(data.model,'test-model');assert.equal(opts.headers.Authorization,'Bearer fake-provider-key');return Response.json({choices:[{message:{content:'Mock answer'}}]})};
const ok=await worker.fetch(req(body),env);assert.equal(ok.status,200);assert.equal((await ok.json()).answer,'Mock answer');assert.equal(calls,1);
assert.equal((await worker.fetch(req(body),{...env,TUTOR_RATE_LIMITER:{limit:async()=>({success:false})}})).status,429);assert.equal(calls,1);
globalThis.fetch=async()=>new Response('',{status:429});assert.equal((await worker.fetch(req(body),env)).status,429);
console.log('Worker CORS, auth, validation, mock provider request, rate binding and quota handling passed');

const health=await worker.fetch(new Request('https://worker.example/health'),{...env,AI_API_KEY:''});assert.equal(health.status,200);assert.deepEqual((await health.json()).missing,['AI_API_KEY']);
assert.equal((await worker.fetch(req(body,{Authorization:'Bearer invalid'}),{...env,AI_API_KEY:''})).status,401);

const geminiEnv={...env,AI_PROVIDER:'gemini',AI_MODEL:'gemini-3.1-flash-lite'};
globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent');assert.equal(opts.headers['x-goog-api-key'],'fake-provider-key');const b=JSON.parse(opts.body);assert.equal(b.contents[0].role,'user');assert.equal(b.generationConfig.thinkingConfig.thinkingLevel,'low');assert(b.systemInstruction.parts[0].text);return Response.json({candidates:[{content:{parts:[{thought:true,text:'private reasoning'},{text:'Native Gemini answer'}]}}]})};
assert.equal((await (await worker.fetch(req(body),geminiEnv)).json()).answer,'Native Gemini answer');
console.log('Gemini native request and visible-text-only response parsing passed');
let limits=[];globalThis.fetch=async(url,opts)=>{const b=JSON.parse(opts.body);limits.push(b.generationConfig.maxOutputTokens);assert(b.systemInstruction.parts[0].text.length<1500);return Response.json({candidates:[{content:{parts:[{text:'short'}]}}]})};await worker.fetch(req(body),geminiEnv);await worker.fetch(req({...body,messages:[{role:'user',content:'請詳細說明'}]}),geminiEnv);assert.deepEqual(limits,[2048,4096]);console.log('Default and detailed output budgets passed');
// Floating aliases must not inherit an incompatible model family's optional fields.
for(const [model,expected] of [['gemini-flash-lite-latest',undefined],['gemini-2.5-flash-lite',{thinkingBudget:512}],['gemini-3.1-flash-lite',{thinkingLevel:'low'}],['gemini-3.1-flash-lite-image',undefined]]){
 globalThis.fetch=async(url,opts)=>{const b=JSON.parse(opts.body);assert.deepEqual(b.generationConfig.thinkingConfig,expected);return Response.json({candidates:[{content:{parts:[{text:'connected'}]}}]})};
 const response=await worker.fetch(req(body),{...geminiEnv,AI_MODEL:model});const data=await response.json();assert.equal(response.status,200);assert.equal(data.model,model);assert.equal(data.answer,'connected');
}
console.log('Explicit thinking families and floating-alias compatibility passed');
// Access mode requires a platform-authenticated identity with the configured app audience.
const accessEnv={...geminiEnv,TUTOR_AUTH_MODE:'access',ACCESS_AUD:'test-audience'};
const accessCtx={access:{aud:'test-audience',getIdentity:async()=>({email:'student@example.com'})}};
const accessReq=(path='/tutor',method='POST',value=body,origin='https://worker.example')=>new Request('https://worker.example'+path,{method,headers:{...(origin?{Origin:origin}:{}),'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(value)}:{})});
assert.equal((await worker.fetch(accessReq(),accessEnv)).status,401);
assert.equal((await worker.fetch(accessReq(),accessEnv,{access:{aud:'other-app',getIdentity:accessCtx.access.getIdentity}})).status,401);
assert.equal((await worker.fetch(accessReq('/tutor','POST',body,'https://evil.example'),accessEnv,accessCtx)).status,403);
const session=await worker.fetch(accessReq('/session','GET'),accessEnv,accessCtx);assert.equal((await session.json()).email,'student@example.com');
let userKeys=[];globalThis.fetch=async(url,opts)=>Response.json({candidates:[{content:{parts:[{text:'Authenticated Gemini answer'}]}}]});
const accessAnswer=await worker.fetch(accessReq(),{...accessEnv,TUTOR_RATE_LIMITER:{limit:async({key})=>{userKeys.push(key);return {success:true}}}},accessCtx);assert.equal(accessAnswer.status,200);assert.equal((await accessAnswer.json()).answer,'Authenticated Gemini answer');assert(userKeys[0].includes('student@example.com'));
// Public assets are fetched from a fixed trusted origin without browser cookies or auth headers.
globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://sharnchen.github.io/ai-learning-studio/tutor.js?v=access1');assert(!opts.headers.Cookie&&!opts.headers.Authorization);return new Response('public-code',{headers:{'Content-Type':'text/javascript'}})};
const asset=await worker.fetch(accessReq('/studio/tutor.js?v=access1','GET'),accessEnv,accessCtx);assert.equal(await asset.text(),'public-code');assert(asset.headers.get('Content-Security-Policy').includes("connect-src 'self'"));assert.equal((await worker.fetch(accessReq('/studio/private.json','GET'),accessEnv,accessCtx)).status,404);
console.log('Access identity/audience, CSRF origin, per-user limits, secure session and credential-free static proxy passed');
