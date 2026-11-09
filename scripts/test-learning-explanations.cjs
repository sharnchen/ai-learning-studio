const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c=vm.createContext({console,TextEncoder,Blob,MutationObserver:class{observe(){}},document:{addEventListener(){},body:{},querySelector(){return null}}});
for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js','lab-ui.js','assessment-data.js','learning-experience.js','learning-plan-guide.js','unit-guidance.js','learning-reference.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(`function escapeHtml(s){return String(s).replace(/[&<>\"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[x]))}`,c);
for(const threshold of [1,2,3]){
 const html=vm.runInContext(`mailRuleResult(${threshold})`,c);
 for(const name of ['True Positive','False Positive','False Negative','True Negative','總數核對','固定連結數'])assert(html.includes(name));
 assert(html.includes(threshold===1?'60%':'80%'));
}
const mail=vm.runInContext('mailRuleResult(3)',c);assert(mail.includes('TP＝1；FP＝0；FN＝1；TN＝3'));assert(mail.includes('A、B、C'));assert(mail.includes('沒有符合資料＝0'));
const coverage=vm.runInContext(`(()=>{let controls=0;for(const e of labEngines){const v=labDefaults(e),r=e.compute(v),html=labDataGuide(e,v,r);if(!html.includes('數據從哪裡來')||!html.includes('本例假設'))throw Error(e.id);for(const control of e.controls){controls++;if(!html.includes(escapeHtml(control.label)))throw Error(e.id+':'+control.id)}if(html.includes('undefined'))throw Error('undefined '+e.id)}for(const l of lessons)learningReference([l.title,l.body,l.example,l.exercise,l.pitfall].join(' '));for(const t of keywordCatalog){const p=termPractice[t.zh];if(!keywordExample(t,p).includes('具體實例'))throw Error(t.id)}return {lessons:lessons.length,terms:keywordCatalog.length,engines:labEngines.length,controls}})()`,c);
assert(vm.runInContext(`classificationDataGuide(labEngines.find(e=>e.id==='threshold'),{threshold:.5}).includes('S1、S3、S4')`,c));
assert(vm.runInContext(`classificationDataGuide(labEngines.find(e=>e.id==='threshold'),{threshold:1}).includes('沒有符合資料＝0')`,c));
assert(vm.runInContext(`classificationDataGuide(labEngines.find(e=>e.id==='calc-metrics'),{tp:1,fp:2,fn:3,tn:4}).includes('＝1＋2＋3＋4＝10')`,c));
assert(vm.runInContext(`classificationDataGuide(labEngines.find(e=>e.id==='fairness'),{tpA:8,fpA:2,tpB:5,fpB:5}).includes('10－8＝2')`,c));
assert(vm.runInContext(`learningReference('LoRA MSE TP minPts').includes('Minimum Points')`,c));
assert(!vm.runInContext(`learningReference('<script>alert(1)</script>')`,c).includes('<script>'));
console.log(JSON.stringify({coverage,mailThresholds:3,classificationSources:true}));
