const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c=vm.createContext({console,TextEncoder,Blob,MutationObserver:class{observe(){}},document:{addEventListener(){},body:{},querySelector(){return null}}});
for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js','lab-ui.js','assessment-data.js','learning-experience.js','learning-plan-guide.js','unit-guidance.js','learning-reference.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(`function escapeHtml(s){return String(s).replace(/[&<>\"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[x]))}`,c);

vm.runInContext(fs.readFileSync('formula-guide.js','utf8'),c);
const report=vm.runInContext(`(()=>{const displayed=[],fallback=[];for(const e of labEngines){const r=e.compute(labDefaults(e)),html=renderStandardMath(r),guide=formulaExplanation(r.calculation,r);if(!guide.includes('用途'))throw Error(e.id);if(html){if(!html.includes('公式怎麼讀')&&!html.includes('公式與資料怎麼讀'))throw Error('unexplained '+e.id);displayed.push(e.id)}if(!formulaGuides[e.id.replace(/^calc-/,'')])fallback.push(e.id)}for(const l of lessons){const html=lessonFormulaGuide(l);if(html.includes('undefined'))throw Error('lesson '+l.id)}return {engines:labEngines.length,lessons:lessons.length,displayedFormulaGroups:displayed.length,dedicatedGuides:Object.keys(formulaGuides).length,generalGuides:fallback.length}})()`,c);
const activation=vm.runInContext(`renderStandardMath(labEngines.find(e=>e.id==='calc-activation').compute({x:2,w:.5,b:-1}))`,c);
for(const text of ['Sigmoid','此處 σ 不是標準差','0.5×2−1＝0','ReLU(0)','準確率'])assert(activation.includes(text));
assert(vm.runInContext(`formulaExplanation({name:'standard',inputs:{}}).includes('不是 Sigmoid')`,c));
assert(vm.runInContext(`formulaExplanation({name:'calculus',inputs:{}}).includes('列對應輸出')`,c));
assert.equal(vm.runInContext(`labEngines.find(e=>e.id==='calc-gradient').compute({w:0,lr:.1}).lines[1]`,c),'下一步 w = 0.6');
console.log(JSON.stringify(report));
vm.runInContext('var window={addEventListener(){}}',c);vm.runInContext(fs.readFileSync('lesson-audio.js','utf8'),c);
assert(vm.runInContext(`lessons.some(l=>lessonAudioScript(l).some(p=>p.title.startsWith('公式導讀')&&p.text.includes('Sigmoid')))`,c));
assert(vm.runInContext(`lessons.every(l=>lessonAudioScript(l).every(p=>!p.text.includes('undefined')))`,c));
