'use strict';
(()=>{
 const weeks=window.IPASWeeks||[];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=raw=>{
  const r=raw&&typeof raw==='object'?raw:{},records={};
  for(const w of weeks){const a=r.records?.[w.n];if(!a||typeof a!=='object')continue;
   const answers=w.questions.map((_,i)=> (w.n<=3 && a.quizVersion!==2) ? -1 :Number.isInteger(a.answers?.[i])&&a.answers[i]>=0&&a.answers[i]<w.questions[i].choices.length?a.answers[i]:-1);
   records[w.n]={quizVersion:w.n<=3?2:1,slide:Math.max(0,Math.min(w.slides.length-1,Number.isInteger(a.slide)?a.slide:0)),done:a.done===true,answers,submitted:a.submitted===true&&answers.every(x=>x>=0)};
  }
  return {week:Math.max(1,Math.min(16,Number.isInteger(r.week)?r.week:1)),mode:['slides','guide','quiz'].includes(r.mode)?r.mode:'slides',records};
 };
 function get(){if(!state.ipas)state.ipas=clean({});return state.ipas}
 function rec(w){const s=get();return s.records[w.n]||(s.records[w.n]={quizVersion:w.n<=3?2:1,slide:0,done:false,answers:w.questions.map(()=>-1),submitted:false})}
 function current(){return weeks[get().week-1]||weeks[0]}
 function score(w,r){return r.submitted?Math.round(r.answers.filter((a,i)=>a===w.questions[i].correct).length/w.questions.length*100):null}
 function button(label,action,attrs=''){return '<button type="button" data-ipas="'+action+'" '+attrs+'>'+label+'</button>'}
 const links='<a href="https://ipd.nat.gov.tw/ipas/certification/AIAP/exam-info" target="_blank" rel="noopener">官方考試資訊與評鑑範圍 ↗</a>　<a href="https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources" target="_blank" rel="noopener">官方學習資源及公告試題 ↗</a>';
 function weekList(s){return [0,1].map(k=>'<section class="panel ipas-list"><h3>科目'+(k?'二｜生成式 AI 應用與規劃':'一｜人工智慧基礎概論')+'</h3>'+weeks.slice(k*8,k*8+8).map(w=>{const r=s.records[w.n],points=r?score(w,r):null;return '<button type="button" data-ipas="week" data-n="'+w.n+'" aria-current="'+(s.week===w.n?'true':'false')+'"><span class="ipas-num">'+String(w.n).padStart(2,'0')+'</span><span>'+w.title+'<small>'+w.code+' · 120 分鐘'+(points===null?'':' · '+points+' 分')+'</small></span><span class="ipas-check">'+(r?.done?'✓':'')+'</span></button>'}).join('')+'</section>').join('')}
 function jumpOptions(w,r){const groups=new Map();let section=0;w.slides.forEach((x,i)=>{let group,label=x.title;if(i<2)group='章節導入';else if(/解答|解析/.test(label))group='解答與解析';else if(/自編練習|模擬測驗/.test(label))group='測驗';else if(/課間休息/.test(label))group='課間休息';else if(/課堂實作|實作檢核/.test(label))group='實作練習';else if(/本週重點|測驗檢討/.test(label))group='總結與複習';else{group='正式教材';label=w.n+'.'+(++section)+' '+label}if(!groups.has(group))groups.set(group,[]);groups.get(group).push('<option value="'+i+'" '+(r.slide===i?'selected':'')+'>'+esc(label)+'</option>')});return [...groups].map(([g,opts])=>'<optgroup label="'+esc(g)+'">'+opts.join('')+'</optgroup>').join('')}
 function slideView(w,r){
  const slide=w.slides[r.slide];
  return '<section class="panel ipas-stage"><div class="ipas-toolbar"><span>第 '+slide.n+' / '+w.slides.length+' 頁 · '+slide.minutes+' 分鐘</span>'+button('全螢幕','fullscreen')+'</div><progress max="'+w.slides.length+'" value="'+(r.slide+1)+'" aria-label="投影片進度"></progress><div class="ipas-slide"><div class="eyebrow">WEEK '+String(w.n).padStart(2,'0')+' / '+w.code+'</div><h2>'+slide.title+'</h2>'+(slide.answerPage?'<details><summary>完成作答後展開解答</summary>'+slide.html+'</details>':slide.html||'<p>休息 10 分鐘</p>')+'</div><div class="ipas-toolbar ipas-navigation">'+button('← 上一頁','prev',r.slide===0?'disabled':'')+'<label class="ipas-jump-label"><span>跳至</span><select id="ipas-jump" aria-label="跳至章節或小節">'+jumpOptions(w,r)+'</select></label>'+button('下一頁 →','next',r.slide===w.slides.length-1?'disabled':'')+'</div>'+(canDownloadGuide()?'<details class="ipas-notes"><summary>教師講稿及教學指引</summary>'+slide.notes+'</details>':'')+'</section>'
 }
 function canDownloadGuide(){const auth=window.AIStudioAuth;return auth?.ready===true&&['sharnchen@gmail.com','liesharn@gmail.com'].includes(String(auth.email||'').trim().toLowerCase())}
 function guideView(w){if(!canDownloadGuide())return '';return '<section class="panel ipas-guide"><div class="ipas-toolbar"><h3>本週完整教師講稿</h3>'+(canDownloadGuide()?button('下載本週 HTML 講稿','download'):'')+'</div>'+w.slides.map(x=>'<article><div class="eyebrow">SLIDE '+String(x.n).padStart(2,'0')+' · '+x.minutes+' 分鐘</div><h3>'+x.title+'</h3>'+x.html+'<div class="ipas-notes"><b>教師講稿</b>'+x.notes+'</div></article>').join('')+'</section>'}
 function quizView(w,r){const sc=score(w,r),answered=r.answers.filter(a=>a>=0).length;
  return '<section class="panel ipas-quiz"><h3>'+(w.n===8||w.n===16?w.questions.length+' 題模擬測驗':'本週 '+w.questions.length+' 題練習')+'</h3><p class="muted">自編單選題，非官方試題或完整正式考試格式。'+answered+' / '+w.questions.length+' 題已作答。</p>'+(sc===null?'':'<div class="ipas-score"><strong>'+sc+' 分</strong> · 答對 '+r.answers.filter((a,i)=>a===w.questions[i].correct).length+' 題／共 '+w.questions.length+' 題 · 建議目標 80 分</div>')+w.questions.map((q,i)=>'<fieldset><legend>'+(i+1)+'. '+q.q+'</legend>'+q.choices.map((c,j)=>'<label class="'+(r.submitted?(j===q.correct?'ipas-right':(r.answers[i]===j?'ipas-wrong':'')):'')+'"><input type="radio" name="ipas-q-'+i+'" data-ipas-q="'+i+'" value="'+j+'" '+(r.answers[i]===j?'checked ':'')+(r.submitted?'disabled':'')+'>'+String.fromCharCode(65+j)+'. '+c+'</label>').join('')+(r.submitted?'<p class="ipas-explain">'+(r.answers[i]===q.correct?'✓ 答對':'✕ 答錯')+'｜正確答案 '+String.fromCharCode(65+q.correct)+'：'+q.explanation+'</p>':'')+'</fieldset>').join('')+'<div class="ipas-toolbar">'+(r.submitted?button('重新練習','retry'):button('提交並評分','submit',answered!==w.questions.length?'disabled class="primary" id="ipas-submit"':'class="primary" id="ipas-submit"'))+'<a href="#assessment">更多站內題庫 →</a></div></section>'
 }
 function renderPage(){
  if(!weeks.length)return '<p>iPAS 教材載入失敗，請重新整理。</p>';
  const s=get(),w=current(),r=rec(w),done=weeks.filter(x=>s.records[x.n]?.done).length;
  return '<section class="ipas-root"><div class="eyebrow">iPAS CERTIFICATION / 115.06</div><h1>iPAS 考照專欄</h1><p class="muted">AI 應用規劃師（初級）｜16 週、32 小時｜'+weeks.reduce((n,w)=>n+w.slides.length,0)+' 頁教材、'+weeks.reduce((n,w)=>n+w.questions.length,0)+' 道自編練習題</p><div class="panel ipas-overview"><div><b>學習進度 '+done+' / 16 週</b><progress max="16" value="'+done+'" aria-label="已完成週數"></progress></div><div>'+links+'</div><small>依 115.06 版評鑑範圍規劃，進階模型原理屬教學延伸，報名前請核對當年度官方簡章。</small></div><div class="ipas-layout"><div>'+weekList(s)+'</div><div class="ipas-main"><div class="ipas-heading"><div class="eyebrow">第 '+w.n+' 週 · '+w.code+'</div><h2>'+w.title+'</h2><p class="muted">120 分鐘 · '+w.slides.length+' 頁教材</p><div class="ipas-tabs">'+[['slides','逐頁教材'],['guide','教師講稿'],['quiz','線上測驗']].filter(([v])=>v!=='guide'||canDownloadGuide()).map(([v,t])=>button(t,'mode','data-mode="'+v+'" aria-pressed="'+(s.mode===v)+'"')).join('')+'</div></div>'+(s.mode==='guide'&&canDownloadGuide()?guideView(w):s.mode==='quiz'?quizView(w,r):slideView(w,r))+'<div class="panel ipas-footer"><div>'+button(r.done?'✓ 已完成（取消）':'✓ 標記本週完成','done','class="primary"')+' '+(w.n<16?button('下一週 →','nextweek'):'')+'</div><p class="muted">進度及測驗紀錄沿用現有帳號同步與 JSON 匯出。</p><a href="#glossary">AI 詞彙庫</a>　<a href="#lab">互動實驗室</a>　<a href="#tutor">雙向學習問答</a></div></div></div></section>'
 }
 function refresh(){save();render()}
 async function download(w){
 if(!canDownloadGuide())return;
 try{const auth=window.AIStudioAuth;const response=await auth.request('/session',{method:'GET',cache:'no-store'});if(!response.ok)throw Error();const identity=await response.json();if(identity.authenticated!==true||!['sharnchen@gmail.com','liesharn@gmail.com'].includes(String(identity.email||'').trim().toLowerCase())||!canDownloadGuide()||identity.email.toLowerCase()!==auth.email.toLowerCase())throw Error();}catch{alert('講稿下載權限驗證失敗。請確認登入帳號。');return;}
 const body=w.slides.map(x=>'<article><small>SLIDE '+x.n+' · '+x.minutes+' 分鐘</small><h2>'+x.title+'</h2>'+x.html+'<section><b>教師講稿</b>'+x.notes+'</section></article>').join('');
 const html='<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+w.title+'</title><style>body{max-width:900px;margin:auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.8;color:#243047}article{border-bottom:1px solid #bbb;padding:16px 0;break-inside:avoid}section{background:#f0f3f8;padding:12px}small{color:#52677b}</style><script>window.MathJax={tex:{},startup:{typeset:true}};</script><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script><h1>iPAS 第 '+w.n+' 週｜'+w.title+'</h1><p>'+w.code+' · 120 分鐘 · 自編教材</p>'+body+'</html>';
 const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='iPAS_Week_'+String(w.n).padStart(2,'0')+'_Guide.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-ipas]');if(!b||location.hash!=='#ipas')return;
  const s=get(),w=current(),r=rec(w),a=b.dataset.ipas;
  if(a==='fullscreen'){const el=document.querySelector('.ipas-stage');try{if(document.fullscreenElement)await document.exitFullscreen();else if(el?.requestFullscreen)await el.requestFullscreen();else toast('此瀏覽器不支援全螢幕')}catch{toast('無法進入全螢幕')}return}
  if(a==='download'){if(canDownloadGuide())download(w);return}
  if(a==='week'){s.week=Number(b.dataset.n);s.mode='slides'}
  else if(a==='mode'){s.mode=b.dataset.mode==='guide'&&!canDownloadGuide()?'slides':b.dataset.mode}
  else if(a==='prev'){r.slide=Math.max(0,r.slide-1)}
  else if(a==='next'){r.slide=Math.min(w.slides.length-1,r.slide+1)}
  else if(a==='done'){r.done=!r.done}
  else if(a==='nextweek'){s.week=Math.min(16,s.week+1);s.mode='slides'}
  else if(a==='submit'){if(r.answers.some(x=>x<0))return;r.submitted=true}
  else if(a==='retry'){r.answers=w.questions.map(()=>-1);r.submitted=false}
  else return;
  // In fullscreen mode update contents in place instead of replacing the fullscreen element.
  if(document.fullscreenElement?.classList.contains('ipas-stage')&&['prev','next'].includes(a)){save();const tmp=document.createElement('div');tmp.innerHTML=slideView(w,r);document.fullscreenElement.innerHTML=tmp.firstElementChild.innerHTML;return}
  refresh();
  if(['week','nextweek','mode'].includes(a))document.querySelector('.ipas-heading')?.scrollIntoView({block:'start'});
 });
 document.addEventListener('change',e=>{
  if(location.hash!=='#ipas')return;const w=current(),r=rec(w),t=e.target;
  if(t.id==='ipas-jump'){r.slide=Number(t.value);if(document.fullscreenElement?.classList.contains('ipas-stage')){save();const tmp=document.createElement('div');tmp.innerHTML=slideView(w,r);document.fullscreenElement.innerHTML=tmp.firstElementChild.innerHTML}else{refresh();document.querySelector('.ipas-stage')?.scrollIntoView({block:'start'})}}
  else if(t.matches('[data-ipas-q]')&&!r.submitted){r.answers[Number(t.dataset.ipasQ)]=Number(t.value);save();const p=document.querySelector('.ipas-quiz > .muted');if(p)p.textContent='自編單選題，非官方試題或完整正式考試格式。'+r.answers.filter(a=>a>=0).length+' / '+w.questions.length+' 題已作答。';const b=document.getElementById('ipas-submit');if(b)b.disabled=r.answers.some(x=>x<0)}
 });

 function updateStatDemo(root){const input=root.querySelector('[data-stat-slider]');if(!input)return;const salary=Number(input.value),v=[30,32,35,salary],mean=v.reduce((a,b)=>a+b,0)/4,variance=v.reduce((a,b)=>a+(b-mean)**2,0)/4;for(const [k,val] of Object.entries({salary,mean:mean.toFixed(2),variance:variance.toFixed(2),sd:Math.sqrt(variance).toFixed(2)}))root.querySelector('[data-stat="'+k+'"]').textContent=val;v.forEach((n,i)=>{const bar=root.querySelector('[data-stat-bar="'+i+'"]'),label=root.querySelector('[data-stat-label="'+i+'"]');bar.setAttribute('y',180-n*.4);bar.setAttribute('height',n*.4);label.setAttribute('y',173-n*.4);label.textContent=n});const line=root.querySelector('[data-stat-line="mean"]');line.setAttribute('y1',180-mean*.4);line.setAttribute('y2',180-mean*.4)}
 document.addEventListener('input',e=>{if(e.target.matches('[data-stat-slider]'))updateStatDemo(e.target.closest('.ipas-stat-demo'))});

 function updateScaleDemo(root){const x=Number(root.querySelector('[data-scale-input]').value),z=root.querySelector('[data-scale-method]').value==='zscore',v=z?(x-30)/Math.sqrt(200/3):(x-20)/20;root.querySelector('[data-scale-x]').textContent=x;root.querySelector('[data-scale-raw]').setAttribute('cx',25+(x-10)*7.25);root.querySelector('[data-scale-out]').setAttribute('cx',z?25+(v+2.5)*58:25+(v+.5)*145);root.querySelector('[data-scale-axis]').textContent=z?'輸出尺度 −2.5～2.5':'輸出尺度 −0.5～1.5';root.querySelector('[data-scale-result]').textContent=v.toFixed(3);const formula=root.querySelector('[data-scale-formula]');formula.classList.add('ipas-math');formula.textContent='\\['+(z?'\\frac{'+x+'-30}{8.165}\\approx '+v.toFixed(3):'\\frac{'+x+'-20}{40-20}='+v.toFixed(3))+'\\]';renderIPASMath()}
 for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.matches('[data-scale-input],[data-scale-method]'))updateScaleDemo(e.target.closest('.ipas-scale-demo'))});

 document.addEventListener('input',e=>{if(!e.target.matches('[data-matrix-w1],[data-matrix-w2]'))return;const root=e.target.closest('.ipas-matrix-demo'),a=Number(root.querySelector('[data-matrix-w1]').value),b=Number(root.querySelector('[data-matrix-w2]').value);for(const [k,v] of [['v1',a],['v2',b],['svg1',a],['svg2',b]])root.querySelector('[data-matrix-'+k+']').textContent=v;const fmt=n=>Number(n.toFixed(2));root.querySelector('[data-matrix-formula]').textContent=[[20,2],[30,4],[40,6]].map(([x,y],i)=>{const v=fmt(x*a+y*b);root.querySelector('[data-matrix-y="'+i+'"]').textContent=v;return x+'×'+a+'+'+y+'×'+b+'='+v}).join('；')});

 function renderIPASMath(){if(!window.katex)return;for(const n of document.querySelectorAll('.ipas-root .ipas-math')){const t=n.textContent.trim();if(n.querySelector('math')||!t.startsWith('\\[')||!t.endsWith('\\]'))continue;try{n.innerHTML=katex.renderToString(t.slice(2,-2),{output:'mathml',displayMode:true,throwOnError:true,trust:false})}catch(e){n.dataset.mathError='true';console.warn('iPAS formula',e)}}}
 new MutationObserver(renderIPASMath).observe(document.body,{childList:true,subtree:true});window.addEventListener('load',renderIPASMath);
 document.addEventListener('change',e=>{if(!e.target.matches('[data-privacy-field]'))return;const root=e.target.closest('.ipas-privacy-demo'),fields=[...root.querySelectorAll('[data-privacy-field]:checked')],needed=fields.filter(f=>Number(f.dataset.privacyField)>=4).length,extra=fields.length-needed;root.querySelector('[data-privacy-result]').textContent='保留'+needed+'項必要欄位；額外個資欄位'+extra+'項。'+(needed<2?'缺少任務所需資料。':'')+(extra?'請確認額外個資是否必要。':'')+'仍須檢查自由文字。'});
 window.IPASCourse={render:renderPage,sanitize:clean};
})();