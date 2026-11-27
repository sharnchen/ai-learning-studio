'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({labEngines:[],document:{addEventListener(){}},console});
for(const f of ['method-content.js','learning-handbook.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
const report=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 let methods=0,branched=0,looped=0;const ids=new Set();
 for(const [id,p]of Object.entries(methodLessons)){
  const html=methodFlowchart(p.steps,{id,title:id});
  if(!html.includes('<svg')||!html.includes('role="img"'))throw Error(id+' missing accessible diagram');
  if(/undefined|NaN|Infinity/.test(html))throw Error(id+' invalid geometry');
  for(const step of p.steps)if(!html.includes(step.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))))throw Error(id+' lost step '+step);
  for(const match of html.matchAll(/id="([^"]+)"/g)){if(ids.has(match[1]))throw Error('Duplicate SVG id '+match[1]);ids.add(match[1])}
  const rule=methodFlowchartRules[id];
  if(rule){if(!html.includes('method-flow-decision'))throw Error(id+' lacks diamond');if(!html.includes('>是</text>')||!html.includes('>否</text>'))throw Error(id+' missing branch labels');if(rule.loopAt!==undefined)looped++;else branched++;}
  methods++;
 }
 const escaped=methodFlowchart(['<script>alert("x")</script>','測試 & 比較']);if(escaped.includes('<script>'))throw Error('Unsafe labels');
 if(methodFlowchart([])!=='')throw Error('Empty diagram');
 return {methods,branched,looped,uniqueSvgIds:ids.size};
})())`,c));
assert.equal(report.methods,108);assert.equal(report.branched,10);assert.equal(report.looped,10);
const handbook=fs.readFileSync('learning-handbook.js','utf8'),keyword=fs.readFileSync('keyword-study.js','utf8');
assert.ok(handbook.includes("methodFlowchart(p.steps,{id:e.id"));assert.ok(keyword.includes("flow(p.steps,e.id)"));assert.ok(keyword.includes("return methodFlowchart(steps"));
assert.ok(!handbook.includes('<ol class="method-breakdown">'));
console.log('PASS all algorithm diagrams, preserved steps, real branches/loops, safe labels and unique SVG references:',JSON.stringify(report));
