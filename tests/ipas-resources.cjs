'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={};const c=vm.createContext({window:{addEventListener(){}},MutationObserver:class{observe(){}},document:{addEventListener(n,f){(handlers[n]??=[]).push(f)},querySelector(){return null},querySelectorAll(){return []}},requestAnimationFrame(){},location:{hash:'#ipas'},state:{},save(){},render(){},toast(){},ipasVideoPanel(){return ''}});
function run(f){vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f})}
run('ipas-data.js');const before=JSON.stringify(c.window.IPASWeeks.map(w=>({n:w.n,slides:w.slides.map(s=>s.n),questions:w.questions})));
run('ipas-resources-data.js');run('ipas-resources.js');run('ipas-course.js');
const data=c.window.IPASResources;assert.equal(data.modules.length,34);assert.equal(data.guides.length,5);assert.equal(data.errata.length,2);assert.equal(data.exams.length,16);assert.equal(new Set(data.exams.map(x=>x.url)).size,16);assert.equal(data.external.length,2);
const expected=[['3.1','3.2','3.3','3.4','4.1','4.2','4.3','5.1','5.2'],['3.1','3.2','3.3','4.1','4.2','4.3','5.1','5.2','5.3','6.1','6.2','6.3','6.4'],['3.1','3.2','3.3','4.1','4.2','4.3','5.1','5.2','5.3','5.4','6.1','6.2']];
for(let i=0;i<3;i++)assert.equal(JSON.stringify(data.modules.filter(m=>m.subject===i+2).map(m=>m.section)),JSON.stringify(expected[i]));
for(const m of data.modules){for(const k of ['principle','steps','example','application','question','answer'])assert.ok(m[k]?.length>10,m.id+' '+k);for(const [week,page] of m.existing)assert.ok(c.window.IPASWeeks.find(w=>w.n===week)?.slides.some(s=>s.n===page),m.id)}
assert.equal(before,JSON.stringify(c.window.IPASWeeks.map(w=>({n:w.n,slides:w.slides.map(s=>s.n),questions:w.questions}))),'preserve saved slide indices and quizzes');
assert.match(c.window.IPASWeeks[3].slides[2].html,/假設檢定與型一/);
const html=c.window.IPASResourcePanel.render();assert.equal((html.match(/data-ipas-module /g)||[]).length,34);assert.match(html,/官方歷屆試題（16/);assert.match(c.window.IPASCourse.render(),/官方資源對照與補充學習/);
const idx=fs.readFileSync('index.html','utf8');assert.ok(idx.indexOf('ipas-data.js')<idx.indexOf('ipas-resources-data.js'));assert.ok(idx.indexOf('ipas-resources.js')<idx.indexOf('ipas-course.js'));
// Exercise a study jump, p-value boundary/invalid input and hyperparameter search cost.
let jumped; c.window.IPASCourse.openVideoTarget=(...a)=>jumped=a;
for(const f of handlers.click)f({target:{closest:s=>s==='[data-ipas-resource-week]'?{dataset:{ipasResourceWeek:'4',ipasResourcePage:'3'}}:null}});assert.deepEqual(jumped,[4,3]);
function input(selector,value,root){const e={target:{matches:s=>s.split(',').includes(selector),valueAsNumber:value,closest:()=>root}};for(const f of handlers.input)f(e)}
const output={textContent:''},root={querySelector:()=>output};input('[data-ipas-pvalue]',0.05,root);assert.match(output.textContent,/拒絕 H₀/);input('[data-ipas-pvalue]',0.06,root);assert.match(output.textContent,/未拒絕/);input('[data-ipas-pvalue]',NaN,root);assert.match(output.textContent,/請輸入/);
input('[data-ipas-combinations]',6,{querySelector:s=>s==='[data-ipas-combinations]'?{valueAsNumber:6}:s==='[data-ipas-folds]'?{valueAsNumber:5}:output});assert.match(output.textContent,/30 次擬合/);
const original=html;run('ipas-resources.js');assert.equal(c.window.IPASResourcePanel.render(),original,'repeat render is stable');
console.log('PASS: 5 subjects, 34 mapped sections, 16 exams, intact progress/quiz identities, navigation and interactive calculations');
