// Administrator-only setup. Never serve this file or run it in the browser.
// Credentials arrive through stdin, not command arguments, files or logs.
import {pathToFileURL} from 'node:url';
export const accountId='5de077c19779b9cef84dd7de8ee05821';
export const appId='d740096a-441f-4281-acd2-5126fe326a3c';
export function planGoogleLogin(app,providers,providerId){
 const google=providers.find(p=>p.id===providerId&&p.type==='google');
 if(!google)throw Error('Select a configured Google identity provider.');
 if(app.id!==appId||app.type!=='self_hosted'||!app.policies?.length)throw Error('Unexpected app or missing access policies.');
 const body={};
 for(const key of ['type','name','destinations','domain','self_hosted_domains','app_launcher_visible','tags','session_duration','enable_binding_cookie','http_only_cookie_attribute','same_site_cookie_attribute','options_preflight_bypass','eager_redirect_cookie_setting'])
  if(app[key]!==undefined)body[key]=app[key];
 // Existing policy IDs and rules are retained; never create or widen a policy.
 body.policies=app.policies.map(p=>Object.fromEntries(['id','name','decision','include','exclude','require','precedence','session_duration'].filter(k=>p[k]!==undefined).map(k=>[k,p[k]])));
 body.allowed_idps=[...new Set([google.id,...(app.allowed_idps||[])])];
 body.auto_redirect_to_identity=false; // Show Google and existing fallback options.
 return body;
}
export async function run(input,apply=false,transport=fetch){
 if(!input.cloudflare_api_token)throw Error('Cloudflare API token is required through stdin.');
 const base='https://api.cloudflare.com/client/v4/accounts/'+accountId;
 async function api(method,path,body){
  const r=await transport(base+path,{method,redirect:'error',headers:{Authorization:'Bearer '+input.cloudflare_api_token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await r.json();
  // Do not echo upstream bodies: they could contain credential material.
  if(!r.ok||!data.success)throw Error('Cloudflare request failed: '+method+' '+path+' ('+r.status+')');
  return data.result;
 }
 const app=await api('GET','/access/apps/'+appId);
 let providers=await api('GET','/access/identity_providers');
 let id=input.google_provider_id;
 if(!id){
  if(!/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(input.google_client_id||'')||!input.google_client_secret)throw Error('Google OAuth client ID and secret are required.');
  if(!apply)return {status:'ready-to-create',changes:'Create Google provider; attach to existing app; retain Email fallback and access policies.'};
  const created=await api('POST','/access/identity_providers',{name:'Google',type:'google',config:{client_id:input.google_client_id,client_secret:input.google_client_secret}});
  id=created.id;providers=[...providers,{id,type:'google'}];
 }
 const body=planGoogleLogin(app,providers,id);
 if(!apply)return {status:'ready-to-attach',google_provider_id:id,allowed_idps:body.allowed_idps,policy_count:body.policies.length};
 await api('PUT','/access/apps/'+appId,body);
 const verified=await api('GET','/access/apps/'+appId);
 const policyRules=x=>JSON.stringify(x.map(p=>({id:p.id,decision:p.decision,include:p.include,exclude:p.exclude,require:p.require})).sort((a,b)=>a.id.localeCompare(b.id)));
 if(!verified.allowed_idps?.includes(id)||verified.aud!==app.aud||policyRules(verified.policies)!==policyRules(app.policies))throw Error('Post-update verification failed; review Access application immediately.');
 return {status:'configured-login-test-required',google_provider_id:id,policy_count:verified.policies.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  let text='';for await(const chunk of process.stdin){text+=chunk;if(text.length>32768)throw Error('Input too large.');}
  console.log(JSON.stringify(await run(JSON.parse(text),process.argv.includes('--apply'))));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
