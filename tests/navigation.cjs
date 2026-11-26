'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8').split('\n').find(line=>line.startsWith('function render(){'));
assert(source,'render function must be available');
const routes={home:'home',courses:'courses',curriculumPage:'curriculum',laboratoryPage:'lab',assessmentPageView:'assessment',videoLibraryPageView:'videos',explorerPage:'explore',tutorPage:'tutor',glossary:'glossary',notes:'notes',scenarioPage:'scenarios'};
const c={location:{pathname:'/ai-learning-studio/',search:'?test=1',hash:''},history:{replaceState(a,b,p){c.location.hash=p.slice(p.indexOf('#'));c.lastUrl=p}},nodes:{'#app':{},'#crumb':{}},document:{querySelectorAll:()=>[],getElementById:()=>null},updateCourses(){},updateLabCatalog(){},updateTerms(){},tutorFitFormulas(){},IPASCourse:{render:()=> 'ipas'},ScenarioContent:{init(){}},activeScenarioId:'txt2img'};
c.window=c;c.$=s=>c.nodes[s];for(const [fn,page]of Object.entries(routes))c[fn]=()=>page;
vm.createContext(c);vm.runInContext(source,c);
for(const page of [...Object.values(routes),'ipas']){c.location.hash='#'+page;c.render();assert.equal(c.nodes['#app'].innerHTML,page);assert.equal(c.location.hash,'#'+page)}
for(const page of ['constructor','__proto__','toString','valueOf','hasOwnProperty','missing','%zz','lab?x=1','%3Cscript%3E']){c.location.hash='#'+page;c.render();assert.equal(c.nodes['#app'].innerHTML,'home',page);assert.equal(c.location.hash,'#home');assert.equal(c.lastUrl,'/ai-learning-studio/?test=1#home')}
c.location.hash='';c.render();assert.equal(c.nodes['#app'].innerHTML,'home');
console.log('PASS 12 routes, 9 invalid hashes, empty hash and preserved query string');
