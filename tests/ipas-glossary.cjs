'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners={},frames=[];
const element=()=>({style:{},dataset:{},classList:{add(){},remove(){}},append(){},setAttribute(){},querySelector(){return null},querySelectorAll(){return []}});
const c={console,URL,URLSearchParams,TextEncoder,Blob,AbortController,MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame(fn){frames.push(fn)},cancelAnimationFrame(){},location:{href:'https://sharnchen.github.io/ai-learning-studio/#ipas',hash:'#ipas'},history:{replaceState(...args){c.replaced=args[2]}},document:{body:element(),head:element(),createElement:element,getElementById(){return null},querySelector(){return null},querySelectorAll(){return []},addEventListener(n,f){(listeners[n]??=[]).push(f)}},addEventListener(){},state:{termLearning:{}}};c.window=c;vm.createContext(c);
function run(f){vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f})}
for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js','lab-ui.js','visual-guide.js','knn-learning.js','assessment-data.js','assessment-scenarios.js','learning-experience.js','learning-reference.js','learning-plan-guide.js','unit-guidance.js','guided-practice.js','formula-guide.js','method-content.js','learning-handbook.js','lesson-audio.js','diffusion-keywords.js','regularization-keywords.js','flux-qwen-glossary.js','cnn-keywords.js'])run(f);
vm.runInContext(`function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}`,c);
run('keyword-study.js');run('ipas-data.js');run('ipas-resources-data.js');run('ipas-resources.js');
const before=vm.runInContext('keywordCatalog.map(t=>({id:t.id,zh:t.zh}))',c),weeks=JSON.stringify(c.IPASWeeks);
run('ipas-glossary-data.js');run('ipas-glossary.js');
const api=c.IPASGlossary,terms=vm.runInContext('keywordCatalog',c);
assert.equal(api.unresolvedAliases.length,0,'unmapped aliases: '+JSON.stringify(api.unresolvedAliases));
assert.equal(new Set(terms.map(t=>t.id)).size,terms.length,'unique persistent IDs');
assert.equal(JSON.stringify(c.IPASWeeks),weeks,'slide indices, exercises and content preserved');
for(const t of before)assert.ok(terms.some(x=>x.id===t.id&&x.zh===t.zh),'preserve old IDs');
for(const id of api.added){const t=terms.find(t=>t.id===id),row=api.details.get(id);assert.ok(row.principle.length>25&&row.example.length>25&&row.application.length>20);assert.ok(row.steps.length>=3);c.auditTerm=t;
 for(const expression of ['keywordExample(auditTerm,termPractice[auditTerm.zh])','keywordInteract(auditTerm,termPractice[auditTerm.zh],{checks:[]})','keywordPracticeGuide(auditTerm,termPractice[auditTerm.zh],{checks:[]})']){const html=vm.runInContext(expression,c);assert.ok(html.length>300,id);assert.ok(!html.includes('undefined'),id+' undefined');}
}
const match=(s,o)=>Array.from(api.matches(s,o),x=>x.id),term=zh=>terms.find(t=>t.zh===zh).id;
assert.deepEqual(match('API JSON Schema 與 CNN'),[term('應用程式介面'),term('JSON 結構規格'),term('卷積神經網路')]);
assert.deepEqual(match('OpenAI SCNNX myAPI LLMOpsx'),[],'no substring matches inside English words');
assert.deepEqual(match('敏感度',{business:true}),[term('敏感度分析')]);assert.deepEqual(match('敏感度'),[term('召回率／敏感度')]);
assert.deepEqual(match('ROI',{business:true}),[term('投資報酬率')]);assert.deepEqual(match('ROI'),['d7t-roi']);
assert.deepEqual(match('非監督式學習'),[term('非監督學習')]);
assert.deepEqual(match('KNN'),[term('最近鄰演算法')]);
assert.deepEqual(match('TP FP FN TN'),['d6t1','d6t3','d6t4','d6t2']);
// Native modified clicks retain their URL; normal clicks open the existing term reader.
let opened=null,prevented=false;c.openKeyword=id=>{opened=id};const id=term('投資報酬率'),a={dataset:{ipasTerm:id}};
const event={target:{closest:()=>a},button:0,preventDefault(){prevented=true}};
listeners.click.at(-1)({...event,ctrlKey:true});assert.equal(opened,null);
listeners.click.at(-1)(event);assert.equal(opened,id);assert.ok(prevented);assert.equal(c.location.hash,'#ipas');
c.location={href:'https://sharnchen.github.io/ai-learning-studio/?x=1&term='+id+'#glossary',hash:'#glossary'};api.openFromURL();assert.equal(frames.length,1);frames.shift()();assert.equal(opened,id);assert.equal(c.replaced,'/ai-learning-studio/?x=1#glossary');
// Audit every primary slide and all middle-level modules with the same matcher used by the UI.
const audit={date:'2026-11-27',added:api.added.length,reused:api.reused.length,originalTerms:before.length,totalTerms:terms.length,slides:[],modules:[],newTerms:api.added.map(id=>({id,zh:terms.find(t=>t.id===id).zh}))};
for(const w of c.IPASWeeks)for(const s of w.slides){const text=(s.title+' '+s.html+' '+s.notes).replace(/<[^>]+>/g,' ');audit.slides.push({week:w.n,page:s.n,title:s.title,terms:[...new Set(match(text,{business:[14,16].includes(w.n),week:w.n}))]});}
for(const m of c.IPASResources.modules)audit.modules.push({id:m.id,title:m.title,terms:[...new Set(match([m.title,m.principle,m.steps,m.example,m.application].join(' ')))]});
const acronyms=[...new Set(c.IPASWeeks.flatMap(w=>w.slides).map(s=>s.html+' '+s.title).join(' ').replace(/<[^>]*>/g,' ').match(/\b[A-Z][A-Z0-9]{1,9}\b/g))].sort();console.log('Unmatched acronyms:',acronyms.filter(a=>!api.matches(a).length).join(', '));
assert.equal(audit.slides.length,223);assert.equal(audit.modules.length,34);assert.ok(audit.modules.every(x=>x.terms.length),'each resource module links to glossary');
fs.writeFileSync('docs/ipas-glossary-link-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('PASS glossary integration:',JSON.stringify({added:audit.added,reused:audit.reused,totalTerms:audit.totalTerms,slides:audit.slides.length,modules:audit.modules.length,slideReferences:audit.slides.reduce((n,s)=>n+s.terms.length,0)}));
