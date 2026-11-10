const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const storage=new Map(),rows=new Map();let opened=null;
 const els=new Map(),element=()=>({style:{},append(){},before(){},setAttribute(){},remove(){},textContent:''});
 const c={console,JSON,AbortSignal,setTimeout:()=>1,clearTimeout(){},confirm:()=>true,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{createElement:element,getElementById:k=>{if(!els.has(k))els.set(k,element());return els.get(k)}},location:{pathname:'/ai-learning-studio/',hash:''},history:{replaceState(a,b,p){c.location.hash='#'+p.split('#')[1]}},lessons:[{},{}],state:{},openLesson:id=>opened=id};
 c.window=c;c.addEventListener=()=>{};c.render=()=>{};c.loadLearningState=v=>{c.state=JSON.parse(JSON.stringify(v))};
 const send=id=>async(path,options)=>{if(!options?.method)return {ok:true,json:async()=>rows.get(id)||{state:null,revision:0}};const body=JSON.parse(options.body),old=rows.get(id)||{revision:0};if(body.revision!==old.revision)return {ok:false,status:409};rows.set(id,{state:body.state,revision:old.revision+1});return {ok:true,json:async()=>({revision:old.revision+1})}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('account-learning.js','utf8'),c);const api=c.AccountLearning;
 storage.set('ai-studio-v1',JSON.stringify({done:[1],known:[],notes:{1:'unassigned'}}));
 await api.open({accountId:'A'},send('A'));assert.deepEqual(c.state.notes,{});c.state.notes[0]='A private';api.save(c.state);api.position({page:'courses',lessonId:1});await api.flush();
 api.detach();await api.open({accountId:'B'},send('B'));assert.deepEqual(c.state.notes,{});c.state.notes[0]='B private';api.save(c.state);await api.flush();
 api.detach();await api.open({accountId:'A'},send('A'));assert.equal(c.state.notes[0],'A private');api.resume();assert.equal(opened,1);assert.equal(c.location.hash,'#courses');
 c.state.notes[0]='offline edit';api.save(c.state);api.detach();rows.set('A',{state:{done:[],known:[],notes:{0:'other device'}},revision:2});await api.open({accountId:'A'},send('A'));await api.flush();assert.equal(rows.get('A').state.notes[0],'other device');assert.equal(c.state.notes[0],'offline edit');
 console.log('PASS independent A/B notes, resume lesson, explicit legacy import and non-overwriting offline conflict');
})().catch(e=>{console.error(e);process.exit(1)});
