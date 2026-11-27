'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={document:{compatMode:'CSS1Compat',addEventListener(){},querySelectorAll(){return []}},keywordCatalog:[{id:'d9t0',zh:'Transformer 架構'},{id:'d9t1',zh:'注意力機制'},{id:'d9t2',zh:'自注意力'},{id:'other',zh:'其他'}],plainKeywordDefinitions:{},keywordDefinitions:t=>'previous '+t.id,keywordExample:t=>'previous '+t.id,renderKeyword(){},console};context.window=context;vm.createContext(context);
for(const path of ['vendor/katex-0.16.25.min.js','transformer-keyword.js','self-attention-keyword.js'])vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
const api=context.SelfAttentionLesson;
for(const id of ['d9t1','d9t2']){
 const t=context.keywordCatalog.find(t=>t.id===id);const html=context.keywordExample(t,{});
 assert.ok(html.includes('data-self-attention-lesson="'+id+'"'));
 assert.equal((html.match(/class="keyword-section transformer-chapter"/g)||[]).length,18);
 assert.equal((html.match(/data-transformer-demo/g)||[]).length,1);
 assert.equal((html.match(/<pre>/g)||[]).length,1);
 for(const text of ['Cross-Attention','Softmax','1.33952','0.33024','因果遮罩','Multi-Head','位置資訊','CPU Python'])assert.ok(html.includes(text),id+' '+text);
 assert.ok(!html.includes('katex-error'));assert.ok(!html.includes('undefined'));
 assert.ok((html.match(/<math/g)||[]).length>=4,'formulas rendered as MathML');
 assert.ok(!context.keywordDefinitions(t).includes('FLUX'));
}
assert.equal(context.keywordExample({id:'other'}),'previous other');
assert.ok(context.keywordExample(context.keywordCatalog[0]).includes('data-transformer-lesson'),'Transformer dedicated content preserved');
const r=context.TransformerLesson.compute({causal:true});assert.equal(r.A[0][1],0);assert.equal(r.O[0][0],2);
const index=fs.readFileSync('index.html','utf8');assert.ok(index.indexOf('transformer-keyword.js')<index.indexOf('self-attention-keyword.js'));assert.ok(index.indexOf('self-attention-keyword.js')<index.indexOf('glossary-depth.js'));
assert.equal(context.keywordCatalog.length,4,'existing entries extended, no duplicates created');
console.log('PASS attention and self-attention existing IDs, 18-section explanations, MathML, shared live experiment, Python example and unrelated term preservation');
