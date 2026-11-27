'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ipas-course.js','utf8');
assert.ok(!/\.observe\(document\.body/.test(source),'iPAS must not retain whole-document observers');
assert.equal((source.match(/IPASLifecycle\.register\(/g)||[]).length,6,'math and all five demo initializers registered');
const end="window.addEventListener('pagehide',stop);\n})();";
const lifecycle=source.slice(0,source.indexOf(end)+end.length);
let id=0,scans=0;const frames=new Map(),observers=[],events={};
class Observer{
 constructor(callback){this.callback=callback;this.target=null;observers.push(this)}
 observe(target){this.target=target}
 disconnect(){this.target=null}
}
const c={window:{addEventListener(type,fn){events[type]=fn}},MutationObserver:Observer,requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame(id){frames.delete(id)},console};vm.createContext(c);vm.runInContext(lifecycle,c);
const life=c.window.IPASLifecycle;
life.register(()=>{scans++;for(const o of observers)if(o.target)o.callback()});
function tick(){const batch=[...frames.values()];frames.clear();for(const fn of batch)fn()}
const view={isConnected:true};life.mount(view);assert.equal(frames.size,1);tick();assert.equal(scans,1);assert.equal(frames.size,0,'initialization must not requeue itself');assert.equal(observers.at(-1).target,view);
for(let i=0;i<100;i++)observers.at(-1).callback();assert.equal(frames.size,1,'coalesce mutations');tick();assert.equal(scans,2);
life.refresh();life.unmount();assert.equal(frames.size,0,'cancel pending work on route exit');assert.ok(observers.every(o=>o.target===null));
for(const o of observers)o.callback();assert.equal(frames.size,0,'late callbacks after exit must not initialize');
// Run the real app router through iPAS and every other page.
const routes={home:'home',courses:'courses',curriculumPage:'curriculum',laboratoryPage:'lab',assessmentPageView:'assessment',videoLibraryPageView:'videos',explorerPage:'explore',tutorPage:'tutor',glossary:'glossary',notes:'notes',scenarioPage:'scenarios'};
Object.assign(c,{location:{hash:'#ipas',pathname:'/',search:''},history:{replaceState(){}},nodes:{'#app':{},'#crumb':{}},document:{querySelectorAll:()=>[],querySelector:()=>view,getElementById:()=>null},updateCourses(){},updateLabCatalog(){},updateTerms(){},tutorFitFormulas(){},activeScenarioId:'txt2img'});
c.window.IPASCourse={render:()=> 'ipas'};c.$=s=>c.nodes[s];for(const [fn,page]of Object.entries(routes))c[fn]=()=>page;
vm.runInContext(fs.readFileSync('app.js','utf8').split('\n').find(s=>s.startsWith('function render(){')),c);
for(const page of Object.values(routes)){
 c.location.hash='#ipas';c.render();tick();assert.equal(observers.at(-1).target,view);
 c.location.hash='#'+page;c.render();assert.equal(c.nodes['#app'].innerHTML,page);assert.equal(frames.size,0);assert.ok(observers.every(o=>o.target===null));
 const before=scans;for(const o of observers)o.callback();tick();assert.equal(scans,before,'no iPAS scans on '+page);
}
life.mount(view);events.pagehide();assert.equal(frames.size,0);assert.ok(observers.every(o=>o.target===null));
console.log('PASS: iPAS exit to all 11 other routes, cancelled work, coalesced mutations, no self-trigger loop and pagehide cleanup');
