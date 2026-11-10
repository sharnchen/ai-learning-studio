const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const events={};let markup='',lastRun=0;const controls={x:{},y:{},k:{}};
const c=vm.createContext({escapeHtml:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"),console,TextEncoder,Blob,document:{addEventListener(type,fn){(events[type]??=[]).push(fn)},getElementById(){return {set outerHTML(html){markup=html}}},querySelector(s){return controls[s.replace('#lx-','')]||null}},runLab(){lastRun++}});
for(const f of ['lessons.js','scope.js','practice-data.js','math-notation.js','math-formulas.js','calculation-trace.js','practice-ui.js','lab-engines.js','visual-guide.js','knn-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext("const knnEngine=labEngines.find(e=>e.id==='knn');var vv={x:3,y:4,k:3};var rr=knnEngine.compute(vv);",c);
const render=()=>vm.runInContext("renderVisualGuide(knnEngine,vv,rr)",c);
function click(dataset){for(const fn of events.click||[])fn({target:{closest:()=>({dataset})}})}
assert.match(render(),/監督式分類/);assert.match(render(),/第 1 步/);assert.match(render(),/A₁/);
click({knnContext:'lab',knnStep:'1'});assert.match(markup,/msqrt/);assert.match(markup,/xᵢ/);assert.match(markup,/2\.236/);assert.match(markup,/第 2 步/);
click({knnContext:'lab',knnPoint:'A₁'});assert.match(markup,/比較 Q 與 A₁/);assert.match(markup,/<mn>5<\/mn>/);
click({knnContext:'lab',knnStep:'3'});assert.match(markup,/B₁、B₂、B₃/);assert.equal((markup.match(/class="knn-neighbor"/g)||[]).length,3);
click({knnContext:'lab',knnStep:'4'});assert.match(markup,/B 類 3 票/);assert.match(markup,/預測：B 類/);
for(const [k,expected]of [[1,'B'],[3,'B'],[5,'B'],[6,'平票']]){c.k=k;assert.equal(vm.runInContext('knnEngine.compute({x:3,y:4,k}).metrics[2][1]',c),expected)}
vm.runInContext('vv={x:2.5,y:2.5,k:6};rr=knnEngine.compute(vv)',c);assert.match(render(),/平票，暫不分類/);
// Equal-distance ordering agrees with the engine's stable sample order.
assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(knnRows(rr).map(p=>p.id))',c)),['A₂','A₃','A₁','B₁','B₂','B₃']);
click({knnPreset:'lab'});assert.equal(controls.x.value,3);assert.equal(controls.y.value,4);assert.equal(controls.k.value,3);assert.equal(lastRun,1);
for(const x of [-2,0,2.7609495152123,8])for(const y of [-2,3.59297952361053,8]){c.x=x;c.y=y;const html=vm.runInContext('renderKnnLearning(knnEngine,{x,y,k:3},knnEngine.compute({x,y,k:3}),"bounds")',c);assert(!html.includes('undefined'));assert(!html.includes('NaN'))}
console.log('PASS real engine distances, six steps, point selection, votes, tie rules, integer preset and boundary inputs');
