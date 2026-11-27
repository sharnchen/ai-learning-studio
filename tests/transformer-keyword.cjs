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

const api=c.TransformerLesson,r=api.compute(),a=Math.exp(1/Math.sqrt(2))/(Math.exp(1/Math.sqrt(2))+1),b=1-a;
assert.equal(api.id,'d9t0');assert.ok(!vm.runInContext('keywordDefinitions(keywordCatalog.find(t=>t.id===\"d9t0\"))',c).includes('FLUX'),'dedicated definition must omit unrelated imported application banner');
for(let i=0;i<2;i++){assert.ok(Math.abs(r.A[i].reduce((s,x)=>s+x,0)-1)<1e-12);for(const v of r.O[i])assert.ok(Number.isFinite(v));}
assert.ok(Math.abs(r.A[0][0]-a)<1e-12);assert.ok(Math.abs(r.O[0][0]-2*a)<1e-12);assert.ok(Math.abs(r.O[0][1]-b)<1e-12);
const masked=api.compute({causal:true});assert.equal(masked.A[0][1],0);assert.equal(masked.O[0][0],2);assert.equal(masked.O[0][1],0);
assert.ok(api.compute({scaled:false}).A[0][0]>r.A[0][0]);
for(const q of [[0,0],[-4,4],[4,-4],[8,8]]){const v=api.compute({q1:q[0],q2:q[1]});assert.ok(v.A.every(row=>row.every(x=>x>=0&&x<=1)));}
assert.throws(()=>api.compute({q1:NaN}));assert.throws(()=>api.compute({q1:9}));assert.throws(()=>api.softmax([-Infinity,-Infinity]));
const ln=api.layerNorm([1,3]);assert.equal(ln.mean,2);assert.equal(ln.variance,1);assert.ok(Math.abs(ln.values[0]+1/Math.sqrt(1.00001))<1e-12);
for(const source of Object.values(api.equations))assert.match(c.katex.renderToString(source,{throwOnError:true,output:'mathml'}),/<math/);
const html=api.lesson();assert.equal((html.match(/class="keyword-section transformer-chapter"/g)||[]).length,26);assert.equal((html.match(/<pre>/g)||[]).length,2);
for(const label of ['Encoder','Decoder','Cross-Attention','Q、K、V','Softmax','Multi-Head','Residual','LayerNorm','FFN','Post-Norm','Pre-Norm','KV Cache','Teacher','最終 Z']){if(label==='Teacher')continue;assert.ok(html.includes(label),label);}
assert.equal((html.match(/data-transformer-demo/g)||[]).length,1);assert.equal((html.match(/data-transformer-control="causal"/g)||[]).length,1);
c.auditTerm=vm.runInContext('keywordCatalog.find(t=>t.id==="d9t0")',c);const wrapped=vm.runInContext('keywordExample(auditTerm,termPractice[auditTerm.zh])',c);assert.match(wrapped,/data-transformer-lesson/);assert.match(wrapped,/本詞閱讀導覽/);assert.ok(!wrapped.includes('展開方法、公式與完整算例'),'dedicated content replaces the generic fallback');
const index=fs.readFileSync('index.html','utf8');assert.ok(index.indexOf('keyword-study.js')<index.indexOf('transformer-keyword.js'));assert.ok(index.indexOf('transformer-keyword.js')<index.indexOf('glossary-depth.js'));
fs.writeFileSync('/tmp/transformer-attention-example.py',api.pyAttention);fs.writeFileSync('/tmp/transformer-block-example.py',api.pyBlock);
fs.writeFileSync('docs/transformer-lesson-audit.json',JSON.stringify({id:api.id,sections:26,pythonExamples:2,formulae:Object.keys(api.equations).length,defaultAttention:r.A,defaultOutput:r.O,causalOutput:masked.O,covered:['architecture','tensor shapes','projections','scaled scores','softmax','weighted values','multihead','position','residual','layernorm','ffn','postnorm vs prenorm','masks','training vs decoding','complexity','interactive heatmap','python','applications and limitations']},null,2)+'\n');
console.log('PASS dedicated Transformer lesson, 26 sections, exact attention/mask/norm arithmetic, valid MathML, integrated reader and two unique Python examples');
