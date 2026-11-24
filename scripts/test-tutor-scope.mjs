import assert from 'node:assert/strict';import {timingSafeEqual} from 'node:crypto';
import '../tutor-scope.js';import worker from '../backend/tutor-worker.mjs';
crypto.subtle.timingSafeEqual=(a,b)=>timingSafeEqual(Buffer.from(a),Buffer.from(b));
const env={ALLOWED_ORIGIN:'https://sharnchen.github.io',AI_PROVIDER:'gemini',AI_MODEL:'gemini-2.5-flash-lite',AI_API_KEY:'fake-key',TUTOR_ACCESS_TOKEN:'fake-access'};
const req=q=>new Request('https://worker.example/tutor',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json',Authorization:'Bearer fake-access'},body:JSON.stringify({context:'詞彙庫未命中',messages:[{role:'user',content:q}]})});
const budgets=[];let calls=0;globalThis.fetch=async(url,opts)=>{calls++;const b=JSON.parse(opts.body),p=b.systemInstruction.parts[0].text;assert(p.includes('不限制問題主題'));assert(!p.includes('OUT_OF_SCOPE'));assert(p.includes('約80至120字'));budgets.push(b.generationConfig.maxOutputTokens);assert.equal(b.generationConfig.thinkingConfig.thinkingBudget,128);return Response.json({candidates:[{content:{parts:[{text:'簡短回答'}]}}]})};
for(const q of ['如何整理旅遊行程？','介紹餐廳選擇方式','解釋一個數學觀念']){const r=await worker.fetch(req(q),env);assert.equal((await r.json()).answer,'簡短回答')}
await worker.fetch(req('請詳細說明一個例子'),env);assert.deepEqual(budgets,[768,768,768,1536]);assert.equal(calls,4);
console.log('PASS unrestricted topic requests reach provider, concise policy, lower default/detail budgets and reduced thinking budget');
