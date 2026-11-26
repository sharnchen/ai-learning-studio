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
