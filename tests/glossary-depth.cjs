'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners={},frames=[];
const element=()=>({style:{},dataset:{},classList:{add(){},remove(){}},append(){},setAttribute(){},querySelector(){return null},querySelectorAll(){return []}});
const c={console,URL,URLSearchParams,TextEncoder,Blob,AbortController,MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame(fn){frames.push(fn)},cancelAnimationFrame(){},location:{href:'https://sharnchen.github.io/ai-learning-studio/#ipas',hash:'#ipas'},history:{replaceState(...args){c.replaced=args[2]}},document:{body:element(),head:element(),createElement:element,getElementById(){return null},querySelector(){return null},querySelectorAll(){return []},addEventListener(n,f){(listeners[n]??=[]).push(f)}},addEventListener(){},state:{termLearning:{}}};c.window=c;vm.createContext(c);
function run(f){vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f})}
for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js','lab-ui.js','visual-guide.js','knn-learning.js','assessment-data.js','assessment-scenarios.js','learning-experience.js','learning-reference.js','learning-plan-guide.js','unit-guidance.js','guided-practice.js','formula-guide.js','method-content.js','learning-handbook.js','lesson-audio.js','diffusion-keywords.js','regularization-keywords.js','flux-qwen-glossary.js','cnn-keywords.js'])run(f);
run('keyword-study.js');run('ipas-data.js');run('ipas-resources-data.js');run('ipas-resources.js');
const before=vm.runInContext('keywordCatalog.map(t=>({id:t.id,zh:t.zh}))',c),weeks=JSON.stringify(c.IPASWeeks);
run('ipas-glossary-data.js');run('ipas-glossary.js');
vm.runInContext(`function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}`,c);

const initial=vm.runInContext('keywordCatalog.map(t=>({id:t.id,zh:t.zh,lessonId:t.lessonId}))',c);
const original=new Map(vm.runInContext('keywordCatalog.map(t=>[t.id,keywordExample(t,termPractice[t.zh])])',c));
// Simulate standards mode for KaTeX; compile using the same vendored renderer as the site.
c.document.compatMode='CSS1Compat';
for(const f of ['vendor/katex-0.16.25.min.js','glossary-deep-data.js','glossary-formula-data.js','glossary-concept-fields.js','transformer-keyword.js','glossary-depth.js'])run(f);
const terms=vm.runInContext('keywordCatalog',c),api=c.GlossaryDepth;
assert.equal(terms.length,683);assert.equal(JSON.stringify(initial),JSON.stringify(terms.map(t=>({id:t.id,zh:t.zh,lessonId:t.lessonId}))),'preserve catalogue identities');
assert.equal(api.deep.size,32);assert.equal(c.IPASGlossary.details.size,75);
for(const row of api.deep.values()){
 for(const field of ['why','principle','example','limit','question','answer'])assert.ok(row[field].length>8,row.id+' '+field);
 assert.ok(row.steps.length>=3&&row.symbols.length>=2);for(const pair of row.symbols)assert.equal(pair.length,2,row.id+' malformed symbols');
 for(const name of row.related)assert.ok(terms.some(t=>t.zh===name),row.id+' invalid related '+name);
}
for(const [id,row]of Object.entries(api.formulae)){
 assert.ok(terms.some(t=>t.id===id),id+' missing term');assert.equal(row.length,4);
 assert.ok(!row[0].includes('aprime')&&!row[0].includes('sprime'),'prime must remain a mathematical symbol');
 const html=c.katex.renderToString(row[0],{output:'mathml',displayMode:true,throwOnError:true,trust:false});assert.match(html,/<math/);assert.ok(!html.includes('katex-error'));
 for(const pair of row[2].split(';').map(x=>{const i=x.lastIndexOf('|');return [x.slice(0,i),x.slice(i+1)]}))assert.equal(pair.length,2,id+' formula symbols');
}
const report={date:'2026-11-27',scope:'All rendered glossary entries mechanically checked; targeted authored expansion of 32 imported lessons and 75 iPAS concepts. Structural checks do not constitute independent expert proof of every original claim.',total:terms.length,dedicatedExpansions:api.deep.size,ipasExpansions:c.IPASGlossary.details.size,formulaCards:Object.keys(api.formulae).length,retainedLiveWidgets:0,entries:[]};
for(const t of terms){c.auditTerm=t;const html=vm.runInContext('keywordExample(auditTerm,termPractice[auditTerm.zh])',c);
 assert.match(html,/data-glossary-depth=/);assert.match(html,/本詞閱讀導覽/);assert.match(html,/閱讀起點與先備概念/);
 const sections=[...html.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];assert.ok(sections.length>=8,t.id+' insufficient sections');assert.equal(new Set(sections.map(m=>m[1])).size,sections.length,t.id+' duplicate anchors');
 for(const [,id]of [...html.matchAll(/data-glossary-section="([^"]+)"/g)])assert.ok(sections.some(s=>s[1]===id),t.id+' broken contents link');
 for(const [,id]of [...html.matchAll(/data-learn-keyword="([^"]+)"/g)])assert.ok(terms.some(t=>t.id===id),t.id+' invalid prerequisite');
 const local=c.IPASGlossary.details.get(t.id);if(local){assert.ok(api.formulae[t.id]||c.GlossaryConceptFields[t.id],t.id+' missing fields');assert.ok(html.includes(vm.runInContext('escapeHtml',c)(local.example)),t.id+' lost worked example');}
 const old=original.get(t.id);if(old.includes('data-flux-study="'+t.id+'"')){assert.ok(html.includes('data-flux-study="'+t.id+'"'),t.id+' lost live widget');report.retainedLiveWidgets++;}
 if(['d3t10','d8t13'].includes(t.id)){
  const oldHeadings=[...old.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>m[1]);for(const title of oldHeadings)assert.ok(html.includes(title),t.id+' lost dedicated section');
  assert.equal((html.match(/<pre/g)||[]).length,(old.match(/<pre/g)||[]).length,t.id+' duplicated or removed code');
 }
 report.entries.push({id:t.id,zh:t.zh,sections:sections.length,formulaCard:!!api.formulae[t.id],fieldsTable:!!c.GlossaryConceptFields[t.id],dedicated:api.deep.has(t.id),ipas:!!local});
}
assert.equal(report.retainedLiveWidgets,8);
assert.equal(Math.round((.25*200+.75*100)),125);assert.equal((120-80)/80*100,50);assert.equal((1+1/2+0)/3,.5);assert.equal(60000/(15000-12000),20);
assert.ok(!fs.readFileSync('glossary-depth.js','utf8').includes('new MutationObserver'),'do not reintroduce document observer');
const index=fs.readFileSync('index.html','utf8');assert.ok(index.indexOf('ipas-glossary.js')<index.indexOf('glossary-depth.js'));assert.ok(index.indexOf('glossary-depth.js')<index.lastIndexOf('src="app.js'));
fs.writeFileSync('docs/glossary-depth-audit-20261127.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS all glossary sections, mathematical syntax and variable legends, real term links, preserved RNN/SVM chapters/code and 8 live experiments:',JSON.stringify({total:report.total,dedicated:report.dedicatedExpansions,ipas:report.ipasExpansions,formulaCards:report.formulaCards,liveWidgets:report.retainedLiveWidgets}));
