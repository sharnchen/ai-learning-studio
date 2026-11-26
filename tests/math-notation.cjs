const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');const c={document:{addEventListener(){}},console};vm.createContext(c);for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);const run=s=>vm.runInContext(s,c);
for(const [code,tag]of [["mathBinary('/',mathNum(1),mathNum(2))",'mfrac'],["mathBinary('**',mathNum(-3),mathNum(2))",'msup'],["mathFunction('sqrt',[mathNum(2)])",'msqrt'],["mathSource('x-c[0]')",'msub'],["mathNum(1e-9)",'msup'],["mathMatrix([[1,2],[3,4]])",'mtable']])assert(run(code).includes('<'+tag),code);
assert(run("mathBinary('^',mathNum(3),mathNum(2))").includes('XOR (bit)'));assert(!run("mathStep({step:1,formula:'<img src=x>',substitution:'<script>',result:'2'})").includes('<img'));
let steps=0;for(const id of run('labEngines.map(e=>e.id)')){const r=run(`(()=>{const e=labEngines.find(e=>e.id===${JSON.stringify(id)});return e.compute(Object.fromEntries(e.controls.map(c=>[c.id,c.value])))})()`);for(const s of r.calculation.steps){c.item=s;const h=run('mathStep(item)');assert(h.includes('<math '));assert(h.includes('display="block"'));assert(h.includes('math-step-chain'));assert.equal((h.match(/<math /g)||[]).length,s.math?.kind==='value'?2:3);assert.equal((h.match(/<\/math>/g)||[]).length,s.math?.kind==='value'?2:3);assert(!h.includes('<undefined'));steps++}c.result=r;run('renderStandardMath(result)')}
const g=run("labEngines.find(e=>e.id==='calc-standard').compute({x:30,mean:20,std:5})");c.item=g.calculation.steps.find(s=>s.math?.op==='/');assert(run('mathStep(item)').includes('<mfrac>'));
vm.runInContext(fs.readFileSync(path.join(root,'formula-guide.js'),'utf8'),c);
for(const mode of ['sgd','momentum','adam','adamw']){
 const r=run(`labEngines.find(e=>e.id==='optimizer').compute({mode:'${mode}',lr:.1,steps:1,decay:.01})`);
 c.result=r;const h=run('renderStandardMath(result)');assert(h.includes('標準數學式')&&h.includes('公式怎麼讀'),mode);assert(h.includes('符號'),mode);
 if(mode==='momentum')assert(h.includes('<mi>vel</mi>'));
 if(mode==='adam'||mode==='adamw')assert(h.includes('<mover')&&h.includes('<mfrac>')&&h.includes('<msqrt>'));
 if(mode==='adamw')assert(h.includes('λ'));
 const expected=mode==='sgd'||mode==='momentum'?.6:.1;
 assert(Math.abs(r.table.rows[0][1]-expected)<1e-8,mode);
}
const rr=run("labEngines.find(e=>e.id==='regression-metrics').compute({truth:'1,3',pred:'2,1'})");c.result=rr;
const rh=run('renderStandardMath(result)');assert(rh.includes('<msup><mi>R</mi><mn>2</mn></msup>'));assert(rh.includes('ȳ')&&rh.includes('ŷᵢ'));assert.equal(rr.metrics.find(x=>x[0]==='R²')[1],-1.5);
assert.equal(run("labEngines.find(e=>e.id==='regression-metrics').compute({truth:'2,2',pred:'1,3'}).metrics.find(x=>x[0]==='R²')[1]"),'常數目標未定義');
console.log(`PASS: ${steps} operations across ${run('labEngines.length')} engines render as vertical MathML; optimizer modes, R² and undefined constant targets checked.`);
