const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
function context(traced){const c={document:{addEventListener(){}},console};vm.createContext(c);for(const file of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js'])vm.runInContext(fs.readFileSync(path.join(root,!traced&&['practice-ui.js','lab-engines.js'].includes(file)?'src/'+file:file),'utf8'),c);return c}
const a=context(true),b=context(false),evaluate=(c,s)=>vm.runInContext(s,c),json=x=>JSON.parse(JSON.stringify(x));
const cases=evaluate(a,'labCases.map(t=>({id:t.id,zh:t.zh,engineId:t.engineId}))');
let max=0,total=0;
for(const t of cases){const source=`(()=>{const e=labEngines.find(e=>e.id===${JSON.stringify(t.engineId)});return e.compute(Object.fromEntries(e.controls.map(c=>[c.id,c.value])))})()`;const r=json(evaluate(a,source)),old=json(evaluate(b,source));assert(r.calculation,t.zh);assert(r.calculation.steps.length,t.zh);for(const s of r.calculation.steps){assert(s.formula);assert(s.substitution);assert.equal(typeof s.result,'string')}max=Math.max(max,r.calculation.steps.length);total+=r.calculation.steps.length;delete r.calculation;delete old.calculation;assert.deepEqual(r,old,t.zh)}
const g=evaluate(a,"labEngines.find(e=>e.id==='calc-gradient').compute({w:0,lr:.1})").calculation.steps;
assert(g.some(s=>s.formula==='2*(v.w-3)'&&s.substitution==='(2) × (-3)'&&s.result==='-6'));
assert(g.some(s=>s.formula==='v.w-v.lr*g'&&Number(s.result)>.5999));
assert.equal(evaluate(a,'currentCalculation'),null);
assert.throws(()=>evaluate(a,"withCalculation(()=>{throw Error('bad')},'test',{})"));assert.equal(evaluate(a,'currentCalculation'),null);
assert.equal(evaluate(a,"calcBinary('+',2,3,'sum')"),5);
assert.equal(evaluate(a,"calcUnary('-',2,'negative')"),-2);
// Rendering escapes user input, and all trace pages retain correct sequence.
evaluate(a,"function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')} function labTable(h,r){return '<table>'+r.map(x=>x.map(escapeHtml).join('|')).join('\\n')+'</table>'}");
assert(evaluate(a,"renderCalculation({inputs:{text:'<img src=x>'},steps:[]})").includes('&lt;img'));
assert(evaluate(a,"calculationPage({steps:Array.from({length:121},(_,i)=>({step:i+1,formula:'x',substitution:'1+1',result:'2'}))},1,2)").includes('121'));
console.log(`PASS: 576 cases unchanged, ${total} traced operations, max ${max} per case; formula/substitution/result, exception cleanup, pagination, escaped inputs.`);
