'use strict';
const fs=require('node:fs'),path=require('node:path');
async function verify(source){
 const store=new Map(),events={},nodes=new Map(),pending=[],bound=[];
 function el(tag){return {tag,children:[],classList:{add(){},remove(){}},append(...items){this.children.push(...items);for(const x of items)if(x.id)nodes.set(x.id,x)},remove(){nodes.delete(this.id);for(const x of this.children)x.remove?.()},addEventListener(){},contentWindow:{},textContent:""}}
 const body=el("body"),root=el("html"),header=el("header");
 const document={body,documentElement:root,title:"",getElementById:id=>nodes.get(id)||null,createElement:el,querySelector:s=>s===".header-right"?header:null};
 const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const loc={origin:"https://example.test",pathname:"/studio/"};
 const window={addEventListener:(k,fn)=>events[k]=fn,AccountLearning:{detach(){},async open(identity,send){bound.push(send)},resume(){}},resetLearningAccount(){}};
 class Headers {constructor(){}set(k,v){this[k]=v}}
 const fetch=async(url,options)=>{const t=options.headers.Authorization;if(url.endsWith("/session"))return {ok:true,status:200,json:async()=>({authenticated:true,accountId:t.endsWith("A")?"A":"B",email:"test@example.test"})};return new Promise((resolve,reject)=>pending.push({resolve,reject,token:t}))};
 const save=t=>storage.setItem("ai-studio-session-v2",JSON.stringify({token:t,expires:Date.now()+3600000}));save("A");
 new Function("window","document","sessionStorage","location","history","fetch","Headers","AbortSignal",source)(window,document,storage,loc,{replaceState(){}},fetch,Headers,{timeout:()=>null});
 const drain=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};
 function ok(condition,label){if(!condition)throw Error(label)}
 events.DOMContentLoaded();await drain();const a=window.AIStudioAuth;
 ok(a.ready&&a.accountId==="A","A login");
 const observe=p=>p.then(r=>({status:r.status}),e=>({error:e.name}));
 const old401=observe(a.request("/tutor")),old200=observe(a.request("/progress")),oldNetwork=observe(a.request("/tutor"));
 a.logout();save("B");events.message({origin:loc.origin,source:nodes.get("auth-frame").contentWindow,data:{type:"ai-studio-login"}});await drain();
 ok(a.ready&&a.accountId==="B","B login");
 pending[0].resolve({status:401});pending[1].resolve({status:200});pending[2].reject(Error("network"));
 for(const p of [old401,old200,oldNetwork])ok((await p).error==="AbortError","old response blocked");
 ok(a.ready&&a.accountId==="B","B survived stale A requests");
 ok((await observe(bound[0]("/progress"))).error==="AbortError"&&pending.length===3,"old account callback must not send with new token");
 const live=observe(bound[1]("/progress"));ok(pending[3].token==="Bearer B","bound B token");pending[3].resolve({status:200});ok((await live).status===200,"current request success");
 const unauthorized=observe(a.request("/tutor"));pending[4].resolve({status:401});ok((await unauthorized).status===401&&!a.ready&&a.accountId==="","current 401 still logs out");
 save("B");events.message({origin:loc.origin,source:nodes.get("auth-frame").contentWindow,data:{type:"ai-studio-login"}});await drain();
 const same=observe(a.request("/tutor"));a.logout();save("B");events.message({origin:loc.origin,source:nodes.get("auth-frame").contentWindow,data:{type:"ai-studio-login"}});await drain();pending[5].resolve({status:401});ok((await same).error==="AbortError"&&a.ready&&a.accountId==="B","same account new generation protected");
 return "PASS: A/B switch, stale 401/200/network failures, old bound requests, valid session, current 401 and same-account relogin";
}
verify(fs.readFileSync(path.join(__dirname,'..','public-auth.js'),'utf8')).then(console.log).catch(e=>{console.error(e);process.exitCode=1});
