const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let calls=0,payload;
const c={console,URL,URLSearchParams,AbortController,AbortSignal,setTimeout,clearTimeout,TextEncoder,location:{origin:'https://sharnchen.github.io',pathname:'/ai-learning-studio/',search:'',hash:'#home'},document:{addEventListener(){}},sessionStorage:{removeItem(){}},addEventListener(){},AIStudioAuth:{accountId:'qa',request:async(path,opts)=>{calls++;payload=JSON.parse(opts.body);return {ok:true,json:async()=>(payload.messages.at(-1).content==='推薦餐廳'?{answer:'問題超出學習網範圍。',scope:'out-of-scope'}:{answer:'模型補充說明'})}}}};c.window=c;vm.createContext(c);
for(const f of ['search.js','lessons.js','scope.js','practice-data.js','tutor-scope.js','tutor.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const run=s=>vm.runInContext(s,c);
(async()=>{
run('tutorSessionReady=true');
await run("tutorSend('ROI 是什麼？')");assert.equal(calls,0);assert(run("tutorMessages.at(-1).refs.includes('d7t-roi')"));assert(run("tutorMessages.at(-1).text.includes('詞彙庫教材')"));
assert(run("tutorMatch('請解釋 attenton')[0].en.includes('Attention')"));assert.equal(run("tutorMatch('CNN和RNN差在哪？').length"),2);
assert.equal(run("tutorMatch('請解釋 SuperNovelNetZX 的原理').length"),0);assert.equal(run("tutorMatch('explain qzvnoterm').length"),0);
await run("tutorSend('請解釋 SuperNovelNetZX 的原理')");assert.equal(calls,1);assert(!run("tutorMessages.at(-1).text.includes('超出學習網')"));assert.equal(run('tutorMessages.at(-1).refs.length'),0);assert(!payload.context.includes('梯度上升'));
await run("tutorSend('請依目前主題反問一題','challenge')");assert.equal(calls,2);
run('tutorSessionReady=false');await run("tutorSend('梯度下降是什麼')");assert.equal(calls,2);assert(run("tutorMessages.at(-1).text.includes('詞彙庫教材')"));
await run("tutorSend('SuperNovelNetZX 方法？')");assert.equal(calls,2);assert(run("tutorMessages.at(-1).text.includes('請先登入')"));
run('tutorSessionReady=true');await run("tutorSend('推薦餐廳')");assert.equal(calls,3);assert(run('tutorMessages.at(-1).text===TutorScope.refusal'));
console.log('PASS glossary-first no-call path, fuzzy and acronym lookup, AI fallback notice, no false sources, challenge flow, login handling and AI-only scope');
})().catch(e=>{console.error(e);process.exitCode=1});
