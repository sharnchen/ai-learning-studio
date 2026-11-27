'use strict';
const assert=require('node:assert/strict'),{classifyPython:c}=require('../python-runner.js');
for(const [s,h,kind] of [
 ['print(2+3)','','browser'],['prior = .1\nprint(prior)','','browser'],['import numpy as np\nprint(np.arange(3))','','package'],
 ['from sklearn.metrics import accuracy_score','','package'],['import json\nfrom jsonschema import validate','','package'],
 ['import torch\nprint(torch.ones(2))','','external'],['from transformers import AutoTokenizer','','external'],['!pip install transformers','','external'],
 ['model.load_state_dict(ckpt["model"])','language-python','external'],['import requests','','external'],['open("dataset.csv")','language-python','external'],
 ['flowchart TD\nA-->B','mermaid-source',null],['{"event_id":"x","resolved":false}','','',],['[0.1,0.9]','',null],
 ['Attention Weights:\n[[1,0]]','',null],['const x=1','language-javascript',null]
])assert.equal(c(s,h)?.kind||null,kind||null,s);
console.log('PASS Python classification, external requirements, packages and non-code outputs');

// Exercise the actual srcdoc bootstrap. A fake Worker rejects the original
// blob URL path, reproducing the opaque-origin startup regression without CDN.
const vm=require('node:vm');
const {pythonSandboxDocument}=require('../python-runner.js');
const html=pythonSandboxDocument();
assert.match(html,/worker-src data:/);
assert.doesNotMatch(html,/allow-same-origin/);
const bootstrap=html.match(/<script>([\s\S]*)<\/script>/)[1];
const messages=[],workers=[];let listener;
const parent={postMessage:m=>messages.push(m)};
class Worker {
 constructor(url,options){
  assert.ok(url.startsWith('data:text/javascript;charset=utf-8,'),'opaque sandbox must use a data module worker');
  assert.equal(options.type,'module');
  this.source=decodeURIComponent(url.split(',').slice(1).join(','));
  new vm.Script(this.source); // generated worker must remain valid JavaScript
  workers.push(this);
 }
 postMessage(data){this.input=data}
 terminate(){this.terminated=true}
}
vm.runInNewContext(bootstrap,{parent,Worker,encodeURIComponent,addEventListener:(name,fn)=>{assert.equal(name,'message');listener=fn}});
assert.equal(messages[0].type,'ready');
const run={studioPython:true,type:'run',code:'print(2+3)',input:''};
listener({source:{},data:run});assert.equal(workers.length,0,'ignore messages from other windows');
listener({source:parent,data:run});assert.equal(workers.length,1);
assert.equal(workers[0].input.code,'print(2+3)');
listener({source:parent,data:run});assert.equal(workers.length,1,'ignore duplicate runs');
workers[0].onmessage({data:{type:'stdout',text:'5'}});
assert.equal(messages.at(-1).text,'5');
workers[0].onmessage({data:{type:'unknown',text:'ignored'}});
assert.equal(messages.at(-1).type,'stdout');
workers[0].onerror({message:'load failed'});
assert.equal(messages.at(-1).type,'error');assert.match(messages.at(-1).text,/load failed/);
listener({source:parent,data:{studioPython:true,type:'stop'}});
assert.equal(workers[0].terminated,true);
console.log('PASS opaque sandbox worker bootstrap, message validation, output, errors and stop');
