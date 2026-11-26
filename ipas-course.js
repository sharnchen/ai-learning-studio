'use strict';
(()=>{
 const weeks=window.IPASWeeks||[];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=raw=>{
  const r=raw&&typeof raw==='object'?raw:{},records={};
  for(const w of weeks){const a=r.records?.[w.n];if(!a||typeof a!=='object')continue;
   const answers=w.questions.map((_,i)=> (w.n<=7 && a.quizVersion!==2) ? -1 :Number.isInteger(a.answers?.[i])&&a.answers[i]>=0&&a.answers[i]<w.questions[i].choices.length?a.answers[i]:-1);
   records[w.n]={quizVersion:w.n<=7?2:1,slide:Math.max(0,Math.min(w.slides.length-1,Number.isInteger(a.slide)?a.slide:0)),done:a.done===true,answers,submitted:a.submitted===true&&answers.every(x=>x>=0)};
  }
  return {week:Math.max(1,Math.min(16,Number.isInteger(r.week)?r.week:1)),mode:['slides','guide','quiz'].includes(r.mode)?r.mode:'slides',records};
 };
 function get(){if(!state.ipas)state.ipas=clean({});return state.ipas}
 function rec(w){const s=get();return s.records[w.n]||(s.records[w.n]={quizVersion:w.n<=7?2:1,slide:0,done:false,answers:w.questions.map(()=>-1),submitted:false})}
 function current(){return weeks[get().week-1]||weeks[0]}
 function score(w,r){return r.submitted?Math.round(r.answers.filter((a,i)=>a===w.questions[i].correct).length/w.questions.length*100):null}
 function button(label,action,attrs=''){return '<button type="button" data-ipas="'+action+'" '+attrs+'>'+label+'</button>'}
 const links='<a href="https://ipd.nat.gov.tw/ipas/certification/AIAP/exam-info" target="_blank" rel="noopener">官方考試資訊與評鑑範圍 ↗</a>　<a href="https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources" target="_blank" rel="noopener">官方學習資源及公告試題 ↗</a>';
 function weekList(s){return [0,1].map(k=>'<section class="panel ipas-list"><h3>科目'+(k?'二｜生成式 AI 應用與規劃':'一｜人工智慧基礎概論')+'</h3>'+weeks.slice(k*8,k*8+8).map(w=>{const r=s.records[w.n],points=r?score(w,r):null;return '<button type="button" data-ipas="week" data-n="'+w.n+'" aria-current="'+(s.week===w.n?'true':'false')+'"><span class="ipas-num">'+String(w.n).padStart(2,'0')+'</span><span>'+w.title+'<small>'+w.code+' · 120 分鐘'+(points===null?'':' · '+points+' 分')+'</small></span><span class="ipas-check">'+(r?.done?'✓':'')+'</span></button>'}).join('')+'</section>').join('')}
 function jumpOptions(w,r){const groups=new Map();let section=0;w.slides.forEach((x,i)=>{let group,label=x.title;if(i<2)group='章節導入';else if(/解答|解析/.test(label))group='解答與解析';else if(/自編練習|模擬測驗/.test(label))group='測驗';else if(/課間休息/.test(label))group='課間休息';else if(/課堂實作|實作檢核/.test(label))group='實作練習';else if(/本週重點|測驗檢討/.test(label))group='總結與複習';else{group='正式教材';label=w.n+'.'+(++section)+' '+label}if(!groups.has(group))groups.set(group,[]);groups.get(group).push('<option value="'+i+'" '+(r.slide===i?'selected':'')+'>'+esc(label)+'</option>')});return [...groups].map(([g,opts])=>'<optgroup label="'+esc(g)+'">'+opts.join('')+'</optgroup>').join('')}
 function slideView(w,r){
  const slide=w.slides[r.slide];
  return '<section class="panel ipas-stage"><div class="ipas-toolbar"><span>第 '+slide.n+' / '+w.slides.length+' 頁 · '+slide.minutes+' 分鐘</span>'+button('全螢幕','fullscreen')+'</div><progress max="'+w.slides.length+'" value="'+(r.slide+1)+'" aria-label="投影片進度"></progress><div class="ipas-slide"><div class="eyebrow">WEEK '+String(w.n).padStart(2,'0')+' / '+w.code+'</div><h2>'+slide.title+'</h2>'+(slide.answerPage?'<details><summary>完成作答後展開解答</summary>'+slide.html+'</details>':slide.html||'<p>休息 10 分鐘</p>')+'</div>'+ipasVideoPanel(w,slide)+'<div class="ipas-toolbar ipas-navigation">'+button('← 上一頁','prev',r.slide===0?'disabled':'')+'<label class="ipas-jump-label"><span>跳至</span><select id="ipas-jump" aria-label="跳至章節或小節">'+jumpOptions(w,r)+'</select></label>'+button('下一頁 →','next',r.slide===w.slides.length-1?'disabled':'')+'</div>'+(canDownloadGuide()?'<details class="ipas-notes"><summary>教師講稿及教學指引</summary>'+slide.notes+'</details>':'')+'</section>'
 }
 function canDownloadGuide(){const auth=window.AIStudioAuth;return auth?.ready===true&&['sharnchen@gmail.com','liesharn@gmail.com'].includes(String(auth.email||'').trim().toLowerCase())}
 function guideView(w){if(!canDownloadGuide())return '';return '<section class="panel ipas-guide"><div class="ipas-toolbar"><h3>本週完整教師講稿</h3>'+(canDownloadGuide()?button('下載本週 HTML 講稿','download'):'')+'</div>'+w.slides.map(x=>'<article><div class="eyebrow">SLIDE '+String(x.n).padStart(2,'0')+' · '+x.minutes+' 分鐘</div><h3>'+x.title+'</h3>'+x.html+'<div class="ipas-notes"><b>教師講稿</b>'+x.notes+'</div></article>').join('')+'</section>'}
 function quizView(w,r){const sc=score(w,r),answered=r.answers.filter(a=>a>=0).length;
  return '<section class="panel ipas-quiz"><h3>'+(w.n===8||w.n===16?w.questions.length+' 題模擬測驗':'本週 '+w.questions.length+' 題練習')+'</h3><p class="muted">自編單選題，非官方試題或完整正式考試格式。'+answered+' / '+w.questions.length+' 題已作答。</p>'+(sc===null?'':'<div class="ipas-score"><strong>'+sc+' 分</strong> · 答對 '+r.answers.filter((a,i)=>a===w.questions[i].correct).length+' 題／共 '+w.questions.length+' 題 · 建議目標 80 分</div>')+w.questions.map((q,i)=>'<fieldset><legend>'+(i+1)+'. '+q.q+'</legend>'+q.choices.map((c,j)=>'<label class="'+(r.submitted?(j===q.correct?'ipas-right':(r.answers[i]===j?'ipas-wrong':'')):'')+'"><input type="radio" name="ipas-q-'+i+'" data-ipas-q="'+i+'" value="'+j+'" '+(r.answers[i]===j?'checked ':'')+(r.submitted?'disabled':'')+'>'+String.fromCharCode(65+j)+'. '+c+'</label>').join('')+(r.submitted?'<p class="ipas-explain">'+(r.answers[i]===q.correct?'✓ 答對':'✕ 答錯')+'｜正確答案 '+String.fromCharCode(65+q.correct)+'：'+q.explanation+'</p>':'')+'</fieldset>').join('')+'<div class="ipas-toolbar">'+(r.submitted?button('重新練習','retry'):button('提交並評分','submit',answered!==w.questions.length?'disabled class="primary" id="ipas-submit"':'class="primary" id="ipas-submit"'))+'<a href="#assessment">更多站內題庫 →</a></div></section>'
 }
 // Keep the selected chapter visible after the app replaces its DOM.
 function alignChapterMenu(){
  const menu=document.querySelector('.ipas-chapter-menu');
  const active=menu?.querySelector('button[data-ipas="week"][aria-current="true"]');
  if(!active||!menu.clientHeight)return;
  const item=active.getBoundingClientRect(),box=menu.getBoundingClientRect();
  const target=menu.scrollTop+item.top-box.top-menu.clientTop-(menu.clientHeight-item.height)/2;
  menu.scrollTop=Math.max(0,Math.min(menu.scrollHeight-menu.clientHeight,target));
 }
 function renderPage(){
  if(!weeks.length)return '<p>iPAS 教材載入失敗，請重新整理。</p>';
  const s=get(),w=current(),r=rec(w),done=weeks.filter(x=>s.records[x.n]?.done).length;
  requestAnimationFrame(alignChapterMenu);
  return '<section class="ipas-root"><div class="eyebrow">iPAS CERTIFICATION / 115.06</div><h1>iPAS 考照專欄</h1><p class="muted">AI 應用規劃師（初級）｜16 週、32 小時｜'+weeks.reduce((n,w)=>n+w.slides.length,0)+' 頁教材、'+weeks.reduce((n,w)=>n+w.questions.length,0)+' 道自編練習題</p><div class="panel ipas-overview"><div><b>學習進度 '+done+' / 16 週</b><progress max="16" value="'+done+'" aria-label="已完成週數"></progress></div><div>'+links+'</div><small>依 115.06 版評鑑範圍規劃，進階模型原理屬教學延伸，報名前請核對當年度官方簡章。</small></div><div class="ipas-layout"><div class="ipas-chapter-menu" role="region" aria-label="章節選單" tabindex="0">'+weekList(s)+'</div><div class="ipas-main"><div class="ipas-heading"><div class="eyebrow">第 '+w.n+' 週 · '+w.code+'</div><h2>'+w.title+'</h2><p class="muted">120 分鐘 · '+w.slides.length+' 頁教材</p><div class="ipas-tabs">'+[['slides','逐頁教材'],['guide','教師講稿'],['quiz','線上測驗']].filter(([v])=>v!=='guide'||canDownloadGuide()).map(([v,t])=>button(t,'mode','data-mode="'+v+'" aria-pressed="'+(s.mode===v)+'"')).join('')+'</div></div>'+(s.mode==='guide'&&canDownloadGuide()?guideView(w):s.mode==='quiz'?quizView(w,r):slideView(w,r))+'<div class="panel ipas-footer"><div>'+button(r.done?'✓ 已完成（取消）':'✓ 標記本週完成','done','class="primary"')+' '+(w.n<16?button('下一週 →','nextweek'):'')+'</div><p class="muted">進度及測驗紀錄沿用現有帳號同步與 JSON 匯出。</p><a href="#glossary">AI 詞彙庫</a>　<a href="#lab">互動實驗室</a>　<a href="#tutor">雙向學習問答</a></div></div></div></section>'
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
  if(a==='week'||a==='nextweek'){
   alignChapterMenu();
   const menu=document.querySelector('.ipas-chapter-menu');
   if(a==='week'&&e.detail===0)menu?.querySelector('button[aria-current="true"]')?.focus({preventScroll:true});
   menu?.scrollIntoView({block:a==='nextweek'?'start':'nearest',inline:'nearest'});
  }else if(a==='mode')document.querySelector('.ipas-heading')?.scrollIntoView({block:'start'});
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
 document.addEventListener('input',e=>{if(!e.target.matches('[data-cia-down]'))return;const root=e.target.closest('.ipas-cia-demo'),d=Number(e.target.value),a=((720-d)/720*100).toFixed(2);root.querySelector('[data-cia-hours]').textContent=d.toFixed(1);root.querySelector('[data-cia-result]').textContent=a+'%';root.querySelector('[data-cia-formula]').textContent='\\[\\frac{720-'+d.toFixed(1)+'}{720}\\times100\\%='+a+'\\%\\]';renderIPASMath()});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-sup-w],[data-sup-b]'))return;const r=e.target.closest('.ipas-supervised-demo'),w=Number(r.querySelector('[data-sup-w]').value),b=Number(r.querySelector('[data-sup-b]').value),v=[1,2,3].map(x=>(w*x+b-2*x)**2),m=v.reduce((a,b)=>a+b,0)/3,l=r.querySelector('[data-sup-line]');l.setAttribute('y1',135-10*b);l.setAttribute('y2',135-10*(4*w+b));r.querySelector('[data-sup-output]').textContent='w='+w.toFixed(1)+'，b='+b.toFixed(1)+'；MSE='+m.toFixed(3);r.querySelector('[data-sup-formula]').textContent='\\[MSE=\\frac{'+v.map(x=>x.toFixed(2)).join('+')+'}{3}\\approx'+m.toFixed(3)+'\\]';renderIPASMath()});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-pseudo-threshold]'))return;const r=e.target.closest('.ipas-pseudo-demo'),v=Number(e.target.value);r.querySelector('[data-pseudo-value]').textContent=v;for(const n of r.querySelectorAll('[data-pseudo-confidence]'))n.textContent=Number(n.dataset.pseudoConfidence)>=v?'採用':'暫不採用'});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-rl-alpha],[data-rl-gamma]'))return;const r=e.target.closest('.ipas-rl-demo'),a=Number(r.querySelector('[data-rl-alpha]').value),g=Number(r.querySelector('[data-rl-gamma]').value),q=(2+a*(1+g*4-2)).toFixed(2);r.querySelector('[data-rl-output]').textContent='α='+a.toFixed(1)+'，γ='+g.toFixed(1)+'，新 Q='+q;r.querySelector('[data-rl-formula]').textContent='\\[Q_{new}=2+'+a.toFixed(1)+'(1+'+g.toFixed(1)+'\\times4-2)='+q+'\\]';renderIPASMath()});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-knn-k]'))return;const r=e.target.closest('.ipas-knn-demo'),k=Number(e.target.value),a=['A','B','B','A','A'].slice(0,k).filter(x=>x==='A').length;for(const n of r.querySelectorAll('[data-knn-rank]'))n.textContent=Number(n.dataset.knnRank)<=k?'是':'否';r.querySelector('[data-knn-result]').textContent='K='+k+'；A='+a+'，B='+(k-a)+'；預測 '+(a>k-a?'A':'B')});
 document.addEventListener('click',e=>{const t=e.target.closest('[data-km-next],[data-km-reset]');if(!t)return;const r=t.closest('.ipas-kmeans-demo'),n=t.matches('[data-km-reset]')?0:Math.min(2,Number(r.dataset.step)+1);r.dataset.step=n;r.querySelector('[data-km-a]').setAttribute('transform',n?'translate(30 0)':'');r.querySelector('[data-km-b]').setAttribute('transform',n?'translate(30 0)':'');r.querySelector('[data-km-result]').textContent=n===0?'初始中心：1、8；群組：{1,2,3}、{8,9,10}':n===1?'更新中心：2、9；群組不變':'中心不變：2、9；已收斂';r.querySelector('[data-km-next]').disabled=n===2});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-fit-level]'))return;const r=e.target.closest('.ipas-fit-demo'),n=Number(e.target.value),t=[0.42,0.28,0.16,0.09,0.05,0.025,0.01],v=[0.45,0.31,0.2,0.15,0.19,0.29,0.43],m=r.querySelector('[data-fit-marker]');m.setAttribute('x1',40+(n-1)*45);m.setAttribute('x2',40+(n-1)*45);r.querySelector('[data-fit-output]').textContent='複雜度 '+n+'；訓練 '+t[n-1]+'；驗證 '+v[n-1]+'；'+(n<3?'欠擬合':n>4?'過度擬合傾向':'適當擬合區域')});
 function updatePracticeKNN(e){if(!e.target.matches('[data-pr-x],[data-pr-y],[data-pr-k]'))return;const r=e.target.closest('.ipas-practice-knn'),x=Number(r.querySelector('[data-pr-x]').value),y=Number(r.querySelector('[data-pr-y]').value),k=Number(r.querySelector('[data-pr-k]').value),p=[[1,1],[2,1],[4,4],[5,4]].map((v,i)=>({i,d:Math.hypot(v[0]-x,v[1]-y)})).sort((a,b)=>a.d-b.d||a.i-b.i),n=p.slice(0,k).filter(v=>v.i<2).length,q=r.querySelector('[data-pr-query]');q.setAttribute('cx',30+40*x);q.setAttribute('cy',250-40*y);r.querySelector('[data-pr-result]').textContent='查詢 ('+x+','+y+')；排序 '+p.map(v=>'ABCD'[v.i]+' ('+v.d.toFixed(3)+')').join('、')+'；正常 '+n+' 票，異常 '+(k-n)+' 票；'+(n>k/2?'正常':'異常')};document.addEventListener('input',updatePracticeKNN);document.addEventListener('change',updatePracticeKNN);
 function gdUpdate(e){const t=e.target.closest('[data-gd-step],[data-gd-reset],[data-gd-rate]');if(!t)return;const r=t.closest('.ipas-gd-demo'),a=Number(r.querySelector('[data-gd-rate]').value);let w=Number(r.dataset.w),n=Number(r.dataset.iter);if(t.matches('[data-gd-reset]')){w=1;n=0}else if(t.matches('[data-gd-step]')){w-=a*2*(w-3);n++}r.dataset.w=w;r.dataset.iter=n;const p=r.querySelector('[data-gd-point]');p.setAttribute('cx',30+(w+1)*35);p.setAttribute('cy',170-(w-3)**2*9);p.style.visibility=w>=-1&&w<=7?'visible':'hidden';r.querySelector('[data-gd-output]').textContent='迭代 '+n+'；w='+w.toFixed(4)+'；Loss='+((w-3)**2).toFixed(4)+'；梯度='+(2*(w-3)).toFixed(4)+'；η='+a+(w<-1||w>7?'（超出圖示範圍）':'');r.querySelector('[data-gd-step]').disabled=!Number.isFinite(w)||Math.abs(w)>1e9}document.addEventListener('click',e=>{if(e.target.closest('[data-gd-step],[data-gd-reset]'))gdUpdate(e)});document.addEventListener('input',e=>{if(e.target.matches('[data-gd-rate]'))gdUpdate(e)});
 function batchDemo(r){const n=Number(r.querySelector('[data-batch-n]').value),b=Number(r.querySelector('[data-batch-b]').value),e=Number(r.querySelector('[data-batch-e]').value),k=Math.ceil(n/b),last=n-(k-1)*b;r.querySelector('[data-batch-out]').textContent=n+' 筆；Batch Size '+b+'；'+e+' Epoch；每輪 '+k+' 批；尾批 '+last+' 筆；共 '+(k*e)+' 次更新';const bars=r.querySelector('[data-batch-bars]');bars.replaceChildren();for(let i=0;i<k;i++){const v=document.createElement('span');v.style.cssText='display:inline-block;background:#6478c8;color:white;border-radius:4px;padding:3px 6px;font-size:12px';v.textContent=i===k-1?last:b;bars.append(v)}}document.addEventListener('input',e=>{if(e.target.matches('[data-batch-n],[data-batch-b],[data-batch-e]'))batchDemo(e.target.closest('.ipas-batch-demo'))});document.addEventListener('change',e=>{if(e.target.matches('[data-batch-b]'))batchDemo(e.target.closest('.ipas-batch-demo'))});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-fit63-epoch]'))return;const r=e.target.closest('.ipas-fit63'),i=Number(e.target.value)-1,t=.1+1.3*Math.exp(-i/6),v=.2+1.2*Math.exp(-i/5)+.004*Math.max(0,i-10)**2,l=r.querySelector('[data-fit63-line]'),x=35+i*280/29;l.setAttribute('x1',x);l.setAttribute('x2',x);r.querySelector('[data-fit63-out]').textContent='Epoch '+(i+1)+'；Training Loss '+t.toFixed(3)+'；Validation Loss '+v.toFixed(3)});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-early-epoch]'))return;const r=e.target.closest('.ipas-early-demo'),n=Number(e.target.value),tr=[0.9,0.65,0.48,0.34,0.25,0.19,0.14,0.1,0.07,0.05],va=[0.95,0.72,0.55,0.42,0.35,0.38,0.44,0.51,0.59,0.68],best=va.indexOf(Math.min(...va.slice(0,n)))+1,m=r.querySelector('[data-early-marker]');m.setAttribute('x1',35+(n-1)*30);m.setAttribute('x2',35+(n-1)*30);r.querySelector('[data-early-output]').textContent='第'+n+'輪：訓練 '+tr[n-1].toFixed(2)+'；驗證 '+va[n-1].toFixed(2)+'；目前最佳第'+best+'輪'});
 document.addEventListener('change',e=>{if(!e.target.matches('[data-cm-pred]'))return;const r=e.target.closest('.ipas-cm-demo'),counts={TN:0,FP:0,FN:0,TP:0};r.querySelectorAll('[data-cm-actual]').forEach(row=>{const a=Number(row.dataset.cmActual),p=Number(row.querySelector('[data-cm-pred]').value),k=a?(p?'TP':'FN'):(p?'FP':'TN');counts[k]++;row.querySelector('[data-cm-type]').textContent=k});Object.keys(counts).forEach(k=>r.querySelector('[data-cm-count="'+k+'"]').textContent=counts[k])});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-metric-threshold]'))return;const t=Number(e.target.value),p=[.95,.85,.7,.55,.4].filter(v=>v>=t-1e-9).length,f=[.8,.6,.45,.3,.1].filter(v=>v>=t-1e-9).length,n=5-p,z=5-f,fmt=(a,b)=>b?(100*a/b).toFixed(1)+'%':'未定義';e.target.closest('.ipas-threshold-demo').querySelector('[data-metric-output]').textContent='閾值'+t.toFixed(2)+'；TP='+p+'，FP='+f+'，FN='+n+'，TN='+z+'；Accuracy='+fmt(p+z,10)+'；Precision='+fmt(p,p+f)+'；Recall='+fmt(p,5)+'；F1='+fmt(2*p,2*p+f+n)+'；FPR='+fmt(f,5)});
 function updateCostDemo(e){if(!e.target.matches('[data-cost-threshold],[data-cost-fn],[data-cost-fp]'))return;const r=e.target.closest('.ipas-cost-demo'),i=Number(r.querySelector('[data-cost-threshold]').value),a=Number(r.querySelector('[data-cost-fn]').value),b=Number(r.querySelector('[data-cost-fp]').value),rows=[[19,55,25,1],[18,68,12,2],[15,76,4,5]],costs=rows.map(v=>v[3]*a+v[2]*b),v=rows[i],best=Math.min(...costs);r.querySelector('[data-cost-output]').textContent='TP='+v[0]+'，TN='+v[1]+'，FP='+v[2]+'，FN='+v[3]+'；漏報單價='+a+'；誤報單價='+b+'；成本='+costs[i]+'元';r.querySelector('[data-cost-best]').textContent='最低成本閾值 '+[0.3,0.5,0.7].filter((t,k)=>costs[k]===best).join('、')+'，成本 '+best+'元'} document.addEventListener('input',updateCostDemo);document.addEventListener('change',updateCostDemo);
 function updateReview62(e){if(e.target.matches('[data-accum-a],[data-accum-drop]')){const r=e.target.closest('.ipas-accum-demo'),a=Number(r.querySelector('[data-accum-a]').value),d=r.querySelector('[data-accum-drop]').checked,i=d?Math.floor(1000/128):Math.ceil(1000/128),u=Math.ceil(i/a);r.querySelector('[data-accum-out]').textContent='1000筆、B=128、10輪；累積'+a+'批；每輪'+i+'次 iteration、'+u+'次更新；總'+10*u+'次更新。'}if(e.target.matches('[data-fold62]')){const r=e.target.closest('.ipas-fold-demo'),n=Number(e.target.value);r.querySelectorAll('[data-fold62-cell]').forEach(c=>{const k=Number(c.dataset.fold62Cell);c.textContent='Fold '+k+' '+(k===n?'驗證':'訓練');c.style.background=k===n?'#168b7825':'#6478c820'})}}document.addEventListener('input',updateReview62);document.addEventListener('change',updateReview62);
 function act71(e){if(!e.target.matches('[data-act71-f],[data-act71-z]'))return;const r=e.target.closest('.ipas-act71'),f=r.querySelector('[data-act71-f]').value,z=Number(r.querySelector('[data-act71-z]').value),v=f==='ReLU'?Math.max(0,z):f==='Sigmoid'?1/(1+Math.exp(-z)):Math.tanh(z);r.querySelector('[data-act71-out]').textContent='z='+z.toFixed(1)+'；a='+v.toFixed(4)}document.addEventListener('input',act71);document.addEventListener('change',act71);
 function demo72(e){if(e.target.matches('[data-conv72-h],[data-conv72-k],[data-conv72-s],[data-conv72-p]')){const r=e.target.closest('.ipas-conv72'),v=k=>Number(r.querySelector('[data-conv72-'+k+']').value),h=v('h'),o=Math.floor((h+2*v('p')-v('k'))/v('s'))+1;r.querySelector('[data-conv72-out]').textContent=h+'×'+h+' → '+o+'×'+o}if(e.target.matches('[data-att72]')){const r=e.target.closest('.ipas-att72'),v=[Number(e.target.value),1,0],a=v.map(x=>Math.exp(x-Math.max(...v))),s=a.reduce((x,y)=>x+y,0);r.querySelector('[data-att72-out]').textContent='權重：'+a.map(x=>(100*x/s).toFixed(2)+'%').join('、')}}document.addEventListener('input',demo72);document.addEventListener('change',demo72);
 function bayes73(r){const v=k=>Number(r.querySelector('[data-bayes73="'+k+'"]').value);for(const k of ['prior','rec','fpr'])r.querySelector('[data-bayes73-label="'+k+'"]').textContent=v(k)+'%';const tp=1000*v('prior')*v('rec')/10000,fp=1000*(100-v('prior'))*v('fpr')/10000,total=tp+fp,p=total>0?100*tp/total:null,display=p===null?'未定義（無告警）':p.toFixed(2)+'%';r.querySelector('[data-bayes73-count]').textContent='真陽性 TP：'+tp.toFixed(1)+' 件；偽陽性 FP：'+fp.toFixed(1)+' 件';r.querySelector('[data-bayes73-tpbar]').style.width=(p??0)+'%';r.querySelector('[data-bayes73-fpbar]').style.width=(p===null?0:100-p)+'%';r.querySelector('[data-bayes73-calc]').textContent=tp.toFixed(1)+' ÷ ('+tp.toFixed(1)+' + '+fp.toFixed(1)+') = '+display;r.querySelector('[data-bayes73-result]').textContent=display}document.addEventListener('input',e=>{if(e.target.matches('[data-bayes73]'))bayes73(e.target.closest('.ipas-bayes73'))});document.addEventListener('click',e=>{const b=e.target.closest('[data-bayes73-reset]');if(!b)return;const r=b.closest('.ipas-bayes73');for(const [k,v] of Object.entries({prior:10,rec:90,fpr:5}))r.querySelector('[data-bayes73="'+k+'"]').value=v;bayes73(r)});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-diff74]'))return;const r=e.target.closest('.ipas-diff74'),a=Number(e.target.value)/100,s=Math.sqrt(a),n=Math.sqrt(1-a);r.querySelector('[data-diff74-out]').textContent='ᾱ='+a.toFixed(2)+'；訊號係數='+s.toFixed(4)+'；雜訊係數='+n.toFixed(4);r.querySelectorAll('[data-diff74-pixels] rect').forEach((p,i)=>{const v=Math.round(255*Math.max(0,Math.min(1,s*(i%12>=4&&i%12<=7?.8:.15)+n*Math.sin(i*17)*.5)));p.setAttribute('fill','rgb('+v+','+v+','+v+')')})});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-deploy75]'))return;const r=e.target.closest('.ipas-deploy75');let t=0;r.querySelectorAll('[data-deploy75]').forEach(v=>{t+=Number(v.value);r.querySelector('[data-deploy75-label="'+v.dataset.deploy75+'"]').textContent=v.value});r.querySelector('[data-deploy75-out]').textContent='總延遲：'+t+' ms；'+(t<=1500?'符合':'超出')+' 1500 ms 預算';const b=r.querySelector('[data-deploy75-bar]');b.style.width=Math.min(100,t/15)+'%';b.style.background=t<=1500?'#168b78':'#c65353'});
 function digit76(e){if(!e.target.matches('[data-digit76]'))return;const r=e.target.closest('.ipas-digit76'),v=k=>Number(r.querySelector('[data-digit76="'+k+'"]').value),z=v('logit'),t=v('threshold'),d=z>0?7:0,p=100*Math.exp(Math.max(0,z))/(9+Math.exp(z)),report=v('report');r.querySelector('[data-digit76-out]').textContent='Logit 7='+z.toFixed(1)+'；預測'+d+'；信心'+p.toFixed(2)+'%；門檻'+t+'%；報告'+report+'；'+(p>=t&&report===d?'通過':'人工覆核：'+[p<t?'信心不足':'',report!==d?'報告不一致':''].filter(Boolean).join('、'))}document.addEventListener('input',digit76);document.addEventListener('change',digit76);
 document.addEventListener('change',function(e){if(!e.target.matches('[data-choice91]'))return;const r=e.target.closest('.ipas-choice91');const h=r.querySelector('[data-choice91="hard"]').checked,c=r.querySelector('[data-choice91="custom"]').checked;r.querySelector('[data-choice91-out]').textContent=h?'優先評估傳統開發或混合架構，驗證硬性限制。':c?'優先評估支援自訂程式的 Low Code。':'建議先評估 No Code 原型。'});
 function openVideoTarget(week,page){const w=weeks.find(x=>x.n===week),i=w?.slides.findIndex(x=>x.n===page);if(!w||i<0)return;const s=get();s.week=week;s.mode='slides';rec(w).slide=i;save();if(location.hash==='#ipas')render();else location.hash='ipas';}
 window.IPASCourse={render:renderPage,sanitize:clean,openVideoTarget};
})();

 // 9.4 TCO 互動試算：使用與教材一致的教學假設。
 document.addEventListener('input',e=>{
  if(!e.target.matches('[data-tco94-years]'))return;
  const r=e.target.closest('.ipas-tco94'),n=Number(e.target.value);
  if(!r||!Number.isInteger(n)||n<1||n>15)return;
  const plans=[['No Code',2,5],['Low Code',8,4],['傳統開發',20,3]],costs=plans.map(p=>p[1]+n*p[2]),max=Math.max(...costs),min=Math.min(...costs);
  r.querySelector('[data-tco94-year]').textContent=n;
  plans.forEach((p,k)=>{
   r.querySelector('[data-tco94-total="'+k+'"]').textContent=costs[k];
   r.querySelector('[data-tco94-calc="'+k+'"]').textContent=p[1]+' + '+n+' × '+p[2]+' = '+costs[k]+' 萬元';
   r.querySelector('[data-tco94-bar="'+k+'"]').style.width=(100*costs[k]/max)+'%';
  });
  r.querySelector('[data-tco94-best]').textContent='最低成本：'+plans.filter((p,k)=>costs[k]===min).map(p=>p[0]).join(' 與 ')+'，'+min+' 萬元';
  const x=36+18*n;
  r.querySelector('[data-tco94-marker]').setAttribute('d','M'+x+' 30V210');
 });


 // 9.5 workflow test pass rate demo.
 function ipasTest95(e){
  if(!e.target.matches('[data-test95-total],[data-test95-passed],[data-test95-critical]'))return;
  const r=e.target.closest('.ipas-test95');if(!r)return;
  const t=r.querySelector('[data-test95-total]'),p=r.querySelector('[data-test95-passed]'),n=Number(t.value);
  p.max=String(n);
  const pass=Math.max(0,Math.min(n,Number(p.value)));p.value=String(pass);
  const rate=(100*pass/n).toFixed(2);
  r.querySelector('[data-test95-n]').textContent=n;
  r.querySelector('[data-test95-p]').textContent=pass;
  r.querySelector('[data-test95-result]').textContent='通過率：'+rate+'%；失敗：'+(n-pass)+' 件';
  r.querySelector('[data-test95-bar]').style.width=rate+'%';
  r.querySelector('[data-test95-calc]').textContent=pass+' ÷ '+n+' × 100% = '+rate+'%';
  r.querySelector('[data-test95-gate]').textContent=r.querySelector('[data-test95-critical]').checked?'存在重大安全缺陷：不得直接上線，須修正並重新驗證。':'仍須確認驗收門檻及其他上線條件。';
 }
 document.addEventListener('input',ipasTest95);
 document.addEventListener('change',ipasTest95);


 // 10.1 BPE teaching simulation: weighted pair frequencies, two deterministic merges.
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-bpe101-step],[data-bpe101-reset]');if(!b)return;
  const r=b.closest('.ipas-bpe101');if(!r)return;
  const step=b.matches('[data-bpe101-reset]')?0:Math.min(2,Number(r.dataset.step)+1);r.dataset.step=String(step);
  const rows=[{word:'low',count:5,tokens:['l','o','w']},{word:'lower',count:2,tokens:['l','o','w','e','r']},{word:'new',count:3,tokens:['n','e','w']}];
  for(const [a,z] of [['l','o'],['lo','w']].slice(0,step))for(const row of rows){
   const next=[];for(let k=0;k<row.tokens.length;k++){if(row.tokens[k]===a&&row.tokens[k+1]===z){next.push(a+z);k++}else next.push(row.tokens[k])}row.tokens=next;
  }
  const f=new Map();
  for(const row of rows){
   const el=r.querySelector('[data-bpe101-word="'+row.word+'"]');el.replaceChildren();
   for(const t of row.tokens){const span=document.createElement('span');span.textContent=t;span.style.cssText='display:inline-block;padding:4px 9px;border:1px solid #b9c9e2;border-radius:6px;background:#e8eef8;color:#203452;margin:2px;white-space:pre';if(t.length>1)span.style.background='#d8eee6';el.append(span)}
   for(let k=0;k<row.tokens.length-1;k++){const key=row.tokens[k]+' + '+row.tokens[k+1];f.set(key,(f.get(key)||0)+row.count)}
  }
  r.querySelector('[data-bpe101-freq]').textContent='相鄰組合次數：'+[...f].sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+'：'+v).join('；');
  r.querySelector('[data-bpe101-out]').textContent=['步驟 0／2：l + o 和 o + w 均為 7 次，本例同分時先選 l + o。','步驟 1／2：已新增 lo；lo + w 共 7 次，下一步合併。','步驟 2／2：已新增 low，完成兩次合併。真實 BPE 可繼續訓練。'][step];
  r.querySelector('[data-bpe101-step]').disabled=step===2;
 });


 // 10.2 Attention: stable softmax and causal mask teaching demo.
 function updateAtt102(r){
  const inputs=[...r.querySelectorAll('[data-att102-score]')],scores=inputs.map(x=>Number(x.value));
  if(scores.some(x=>!Number.isFinite(x)))return;
  const soft=(a,b)=>{const m=Math.max(a,b),x=Math.exp(a-m),y=Math.exp(b-m);return [x/(x+y),y/(x+y)]};
  const row1=r.querySelector('[data-att102-mask]').checked?[1,0]:soft(1/Math.sqrt(2),0),row2=soft(...scores);
  inputs.forEach((x,k)=>r.querySelector('[data-att102-label="'+k+'"]').textContent=scores[k].toFixed(4));
  [...row1,...row2].forEach((p,k)=>{
   r.querySelector('[data-att102-cell="'+k+'"]').setAttribute('fill-opacity',.12+.78*p);
   const t=r.querySelector('[data-att102-text="'+k+'"]');t.textContent=(100*p).toFixed(2)+'%';t.setAttribute('fill',p>.6?'#fff':'#203452');
  });
  r.querySelector('[data-att102-result]').textContent='第二個 Token 的輸出 O₂ ≈ ['+(2*row2[0]).toFixed(4)+', '+(4*row2[1]).toFixed(4)+']；每列權重合計 100%。';
 }
 document.addEventListener('input',e=>{if(e.target.matches('[data-att102-score]'))updateAtt102(e.target.closest('.ipas-att102'))});
 document.addEventListener('change',e=>{if(e.target.matches('[data-att102-mask]'))updateAtt102(e.target.closest('.ipas-att102'))});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-att102-reset]');if(!b)return;const r=b.closest('.ipas-att102');r.querySelector('[data-att102-score="0"]').value='0';r.querySelector('[data-att102-score="1"]').value='0.7071';r.querySelector('[data-att102-mask]').checked=true;updateAtt102(r)});


 // 10.3 autoregressive generation and context-budget teaching demos.
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-gen103-step],[data-gen103-reset]');if(!b)return;
  const r=b.closest('.ipas-gen103');if(!r)return;
  const stages=[{"tokens":["今天"],"names":["天氣","早上","EOS"],"probs":[60,30,10]},{"tokens":["今天","天氣"],"names":["很好","不錯","EOS"],"probs":[70,20,10]},{"tokens":["今天","天氣","很好"],"names":["EOS","。"],"probs":[80,20]},{"tokens":["今天","天氣","很好","EOS"],"names":[],"probs":[]}];
  const step=b.matches('[data-gen103-reset]')?0:Math.min(3,Number(r.dataset.step)+1);r.dataset.step=String(step);
  const s=stages[step],tokens=r.querySelector('[data-gen103-tokens]'),probs=r.querySelector('[data-gen103-probs]');tokens.replaceChildren();probs.replaceChildren();
  s.tokens.forEach((t,k)=>{const el=document.createElement('span');el.textContent=t;el.style.cssText='display:inline-block;padding:5px 10px;border-radius:6px;margin:2px;border:1px solid #b9c9e2;color:#203452';el.style.background=k===0?'#e8eef8':t==='EOS'?'#e5e7eb':'#c8e9de';tokens.append(el)});
  s.names.forEach((n,k)=>{const row=document.createElement('div'),label=document.createElement('b'),track=document.createElement('div'),bar=document.createElement('div');row.style.margin='8px 0';label.textContent=n+'：'+s.probs[k]+'%';track.style.cssText='height:12px;background:#e8eef8;border-radius:6px';bar.style.cssText='height:12px;background:#168b78;border-radius:6px;width:'+s.probs[k]+'%';track.append(bar);row.append(label,track);probs.append(row)});
  r.querySelector('[data-gen103-count]').textContent='Step '+step+' / 3';
  r.querySelector('[data-gen103-out]').textContent=step===3?'生成完成：新增文字「天氣很好」；含 Prompt 為「今天天氣很好」；停止原因 EOS。':'下一個 Token：'+s.names[0]+'（'+s.probs[0]+'%）';
  r.querySelector('[data-gen103-step]').disabled=step===3;
 });
 function updateCtx103(r){
  const C=Number(r.querySelector('[data-ctx103-cap]').value),vs=[...r.querySelectorAll('[data-ctx103-value]')].map(x=>Number(x.value));
  if(!(C>0)||vs.length!==4||vs.some(x=>!Number.isFinite(x)||x<0))return;
  const input=vs[0]+vs[1]+vs[2],reserved=vs[3],used=input+reserved,remaining=C-input,spare=C-used;
  vs.forEach((v,k)=>{r.querySelector('[data-ctx103-label="'+k+'"]').textContent=v;r.querySelector('[data-ctx103-bar="'+k+'"]').style.width=(100*v/Math.max(C,used))+'%'});
  r.querySelector('[data-ctx103-used]').textContent='輸入 '+input+'＋預留輸出 '+reserved+'＝'+used+' / '+C+' Tokens（'+(100*used/C).toFixed(2)+'%）';
  r.querySelector('[data-ctx103-left]').textContent=remaining<0?'輸入已超出容量 '+(-remaining)+' Tokens。':'理論剩餘生成容量：'+remaining+' Tokens；'+(spare<0?'預留後超出 '+(-spare)+' Tokens。':'預留後尚餘 '+spare+' Tokens。');
  const status=r.querySelector('[data-ctx103-status]');status.textContent=used>C?'超出共同上下文上限：請減少輸入或預留輸出。':'符合共同上下文上限，仍須確認服務的獨立輸出限制。';status.style.color=used>C?'#b04444':'';
 }
 document.addEventListener('input',e=>{if(e.target.matches('[data-ctx103-value]'))updateCtx103(e.target.closest('.ipas-ctx103'))});
 document.addEventListener('change',e=>{if(e.target.matches('[data-ctx103-cap]'))updateCtx103(e.target.closest('.ipas-ctx103'))});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-ctx103-reset]');if(!b)return;const r=b.closest('.ipas-ctx103');r.querySelector('[data-ctx103-cap]').value='8192';r.querySelectorAll('[data-ctx103-value]').forEach((x,k)=>x.value=[512,2048,1024,2048][k]);updateCtx103(r)});


 // 10.4 sampling parameters: temperature, top-k, top-p, renormalization.
 function sample104(r,draw=false){
  const get=k=>Number(r.querySelector('[data-sample104="'+k+'"]').value);
  const t=get('t'),k=get('k'),p=get('p');if(!(t>0&&k>=1&&k<=5&&p>0&&p<=1))return;
  const e=[3,2,1,0,-1].map(z=>Math.exp((z-3)/t)),sum=e.reduce((a,b)=>a+b,0),raw=e.map(v=>v/sum);
  const ks=e.slice(0,k).reduce((a,b)=>a+b,0),kp=e.map((v,j)=>j<k?v/ks:0);
  let cum=0,m=0;do{cum+=kp[m++]}while(m<k&&cum<p-1e-12);
  const final=kp.map((v,j)=>j<m?v/cum:0),pct=x=>(100*x).toFixed(2)+'%';
  for(const [n,v] of [['t',t.toFixed(1)],['k',k],['p',p.toFixed(2)]])r.querySelector('[data-sample104-label="'+n+'"]').textContent=v;
  for(let j=0;j<5;j++){
   for(const [n,v] of [['raw',raw[j]],['final',final[j]]]){
    const bar=r.querySelector('[data-sample104-'+n+'bar="'+j+'"]');bar.setAttribute('y',175-v*150);bar.setAttribute('height',v*150);
    r.querySelector('[data-sample104-'+n+'="'+j+'"]').textContent=pct(v);
   }
  }
  r.querySelector('[data-sample104-summary]').textContent='保留 '+m+' / 5 個候選；最高機率 '+pct(final[0])+'。';
  let result='尚未取樣。';if(draw){const u=Math.random();let c=0,j=0;for(;j<m-1;j++){c+=final[j];if(u<c)break}result='本次取樣：Token '+'ABCDE'[j]+'，機率 '+pct(final[j])+'。'}
  r.querySelector('[data-sample104-draw]').textContent=result;
 }
 document.addEventListener('input',e=>{if(e.target.matches('[data-sample104]'))sample104(e.target.closest('.ipas-sample104'))});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-sample104-draw-btn],[data-sample104-reset]');if(!b)return;const r=b.closest('.ipas-sample104');if(b.matches('[data-sample104-reset]')){for(const [k,v] of [['t',1],['k',5],['p',.9]])r.querySelector('[data-sample104="'+k+'"]').value=v;sample104(r)}else sample104(r,true)});


 // 10.5 model selection: cost budget and hard-constraint weighted ranking.
 function updateCost105(r){
  const get=k=>{const v=Number(r.querySelector('[data-cost105="'+k+'"]').value);return Number.isFinite(v)?Math.max(0,v):0};
  const n=get('in'),o=get('out'),ip=get('ip'),op=get('op'),parts=[n*ip,o*op],total=parts[0]+parts[1];
  const money=v=>'NT$ '+v.toFixed(2);
  r.querySelector('[data-cost105-label="in"]').textContent=n.toFixed(1);
  r.querySelector('[data-cost105-label="out"]').textContent=o.toFixed(1);
  r.querySelector('[data-cost105-total]').textContent='預估成本：'+money(total);
  parts.forEach((v,k)=>{r.querySelector('[data-cost105-part="'+k+'"]').textContent=money(v);r.querySelector('[data-cost105-bar="'+k+'"]').style.width=(total>0?100*v/total:0)+'%'});
  r.querySelector('[data-cost105-calc]').textContent=n+' × '+ip+' + '+o+' × '+op+' = '+money(total);
 }
 function updateScore105(r){
  const k=Number(r.querySelector('[data-score105-cost]').value),offline=r.querySelector('[data-score105-offline]').checked;
  if(!Number.isFinite(k)||k<0||k>65)return;
  const weights=[65-k,20,k,15],models=[{"name":"A｜雲端 API","r":[4,3,5,4],"offline":false},{"name":"B｜本地部署","r":[5,4,3,3],"offline":true},{"name":"C｜私有雲","r":[4,4,2,5],"offline":false}];
  r.querySelector('[data-score105-cost-label]').textContent=k+'%';
  weights.forEach((v,j)=>{r.querySelector('[data-score105-weight="'+j+'"]').textContent=v+'%';r.querySelector('[data-score105-wbar="'+j+'"]').style.width=v+'%'});
  const results=models.map(m=>({...m,eligible:!offline||m.offline,score:m.r.reduce((a,v,j)=>a+v*weights[j]/100,0)}));
  results.forEach((m,j)=>{r.querySelector('[data-score105-result="'+j+'"]').textContent=m.eligible?m.score.toFixed(2)+' / 5':'不符合硬性要求';r.querySelector('[data-score105-bar="'+j+'"]').style.width=(m.eligible?20*m.score:0)+'%'});
  const eligible=results.filter(m=>m.eligible),max=Math.max(...eligible.map(m=>m.score)),best=eligible.filter(m=>Math.abs(m.score-max)<1e-9);
  r.querySelector('[data-score105-best]').textContent=best.length?'目前評分最高的合格方案：'+best.map(m=>m.name).join('、')+'（'+max.toFixed(2)+' / 5）':'無合格方案，請重新評估。';
 }
 document.addEventListener('input',e=>{if(e.target.matches('[data-cost105]'))updateCost105(e.target.closest('.ipas-cost105'));if(e.target.matches('[data-score105-cost]'))updateScore105(e.target.closest('.ipas-score105'))});
 document.addEventListener('change',e=>{if(e.target.matches('[data-score105-offline]'))updateScore105(e.target.closest('.ipas-score105'))});
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-cost105-reset],[data-score105-reset]');if(!b)return;
  if(b.matches('[data-cost105-reset]')){const r=b.closest('.ipas-cost105');for(const [k,v] of [['in',2],['out',.5],['ip',30],['op',120]])r.querySelector('[data-cost105="'+k+'"]').value=v;updateCost105(r)}
  else{const r=b.closest('.ipas-score105');r.querySelector('[data-score105-cost]').value=25;r.querySelector('[data-score105-offline]').checked=false;updateScore105(r)}
 });


// Chapter 11: self-contained teaching simulations. No network or storage writes.
(()=>{
function validate11(raw){let o;try{o=JSON.parse(raw)}catch{return "JSON 語法錯誤。"}if(!o||typeof o!=="object"||Array.isArray(o))return "必須為 JSON 物件。";const keys=["phenomenon","cause","action"];if(keys.some(k=>!Object.prototype.hasOwnProperty.call(o,k)))return "缺少必要欄位。";if(Object.keys(o).some(k=>!keys.includes(k)))return "包含額外欄位。";if(keys.some(k=>typeof o[k]!=="string"))return "欄位型別必須為字串。";return "結構通過；仍需查核事實內容。"}
function messages11(n,sys,q){const examples=[["背光電路元件燒毀。","硬體問題"],["程式發生記憶體存取錯誤。","軟體問題"],["設備停止，尚未完成分析。","待確認"]];return [...(sys?[{role:"system",content:"你是品質工程師。依證據分類為硬體問題、軟體問題或待確認，不得推測根因。"}]:[]),...examples.slice(0,n).flatMap(([question,answer])=>[{role:"user",content:question},{role:"assistant",content:answer}]),{role:"user",content:q}]}
function rates11(a,b){return [a*10,b*10,(b-a)*10]}
function ground11(values){const n=values.length,s=values.filter(x=>x==="supported").length,u=values.filter(x=>x==="unknown").length,c=values.filter(x=>x==="contradicted").length;return {n,s,u,c,rate:n?100*s/n:null}}
 const parts=["你是品質工程師。","整理工程異常摘要。","HUD 偶發無畫面，根因待確認。","只依證據，不補造根因。","輸出異常現象、原因、後續措施三欄。","畫面異常｜待確認｜蒐集日誌。"];
 const routes=[["文字","LLM","文字","摘要、分類、問答"],["影像＋文字","VLM","文字","影像理解"],["文字","Diffusion 等","影像","文字生成圖片"],["影像＋條件","Diffusion 等","影像","依參考圖編輯"],["語音","語音辨識模型","文字","語音轉文字"],["文字","語音合成模型","語音","文字轉語音"],["文字","影片生成模型","影片","文字生成影片"],["影像＋條件","影片生成模型","影片","靜態圖轉影片"]];
 const initialJson=JSON.stringify({phenomenon:"HUD 無畫面",cause:"待確認",action:"蒐集日誌"},null,2);
 function update(r){
  const q=s=>r.querySelector(s), all=s=>[...r.querySelectorAll(s)],val=k=>q('[data-ch11="'+k+'"]').value,out=q('[data-ch11-out]'),status=q('[data-ch11-status]');
  const demo=r.dataset.ch11Demo;
  if(demo==="prompt"){const list=all('[data-ch11="part"]').filter(x=>x.checked);out.textContent=list.map(x=>parts[Number(x.dataset.index)]).join("\n")||"尚未選擇提示欄位。";status.textContent="已指定 "+list.length+" / 6 欄位；欄位數不代表回答正確率。"+(list.some(x=>x.dataset.index==="3")?"":" 尚未設定限制。")}
  else if(demo==="shot"){const n=Number(val("shot")),m=messages11(n,q('[data-ch11="system"]').checked,val("question"));out.textContent=JSON.stringify(m,null,2);status.textContent="範例 "+n+" 個；訊息 "+m.length+" 則。";}
  else if(demo==="json"){out.textContent=validate11(val("json"))}
  else if(demo==="ab"){const a=Number(val("a")),b=Number(val("b")),[pa,pb,d]=rates11(a,b);for(const [k,v,p] of [["a",a,pa],["b",b,pb]]){q('[data-ch11-label="'+k+'"]').textContent=v;q('[data-ch11-'+k+']').textContent=p+"%";q('[data-ch11-bar="'+k+'"]').style.width=p+"%"}out.textContent="差異："+(d>0?"+":"")+d+" 個百分點。"}
  else if(demo==="modality"){const x=routes[Number(val("task"))];if(x)out.textContent=x.slice(0,3).join(" → ")+"；"+x[3]}
  else if(demo==="ground"){const {n,s,u,c,rate}=ground11(all('[data-ch11="claim"]').map(x=>x.value));out.textContent="支持 "+s+"／"+n+"＝"+(rate===null?"未定義":rate.toFixed(0)+"%")+"；不足 "+u+"；矛盾 "+c+"。";for(const [k,v] of [["supported",s],["unknown",u],["contradicted",c]])q('[data-ch11-bar="'+k+'"]').style.width=(n?100*v/n:0)+"%";}
 }
 document.addEventListener("input",e=>{const r=e.target.closest("[data-ch11-demo]");if(r&&e.target.matches("[data-ch11]")&&r.dataset.ch11Demo!=="json")update(r)});
 document.addEventListener("change",e=>{const r=e.target.closest("[data-ch11-demo]");if(r&&e.target.matches("[data-ch11]")&&r.dataset.ch11Demo!=="json")update(r)});
 document.addEventListener("click",e=>{const b=e.target.closest("[data-ch11-action]");if(!b)return;const r=b.closest("[data-ch11-demo]");if(!r)return;const action=b.dataset.ch11Action;if(r.dataset.ch11Demo==="prompt"&&(action==="all"||action==="reset"))r.querySelectorAll('[data-ch11="part"]').forEach((x,i)=>x.checked=action==="all"||i===1||i===2);if(r.dataset.ch11Demo==="json"&&action==="reset"){r.querySelector('[data-ch11="json"]').value=initialJson;r.querySelector('[data-ch11-out]').textContent="等待驗證。";return}update(r)});
 function init(){document.querySelectorAll('[data-ch11-demo="shot"]:not([data-ch11-ready])').forEach(r=>{r.dataset.ch11Ready="1";update(r)})}
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();


// Chapter 12 RAG: local simulations, no external calls or account writes.
(()=>{
function chunks12(l,c,o){if(!Number.isInteger(l)||!Number.isInteger(c)||!Number.isInteger(o)||l<0||c<=0||o<0||o>=c)return null;const list=[];for(let i=0;i<l;i+=c-o){const e=Math.min(i+c,l);list.push([i,e]);if(e===l)break}return list}
function cosine12(a,b){if(a.length!==b.length||!a.length)return null;const den=Math.hypot(...a)*Math.hypot(...b);return den?Math.max(-1,Math.min(1,a.reduce((sum,v,i)=>sum+v*b[i],0)/den)):null}
function rank12(q,k){return [[1,1],[0,1],[-1,0]].map((v,i)=>({id:"ABC"[i],score:cosine12(q,v)})).filter(x=>x.score!==null).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,k)}
function metrics12(ranked,gold,k){const top=ranked.slice(0,k),g=new Set(gold),h=top.filter(x=>g.has(x)).length,first=top.findIndex(x=>g.has(x));return {hits:h,precision:k>0?h/k:null,recall:g.size?h/g.size:null,rr:first<0?0:1/(first+1)}}
function retrieve12(query,access,bad){const id=query==="repair"?"B":query==="warranty"?"A":null;if(!id||id==="B"&&!access)return {id:null,answer:"資料不足，無法依已授權證據回答。"};if(bad)return {id:"C",answer:"候選 C 與問題不相關；資料不足，不生成無依據答案。"};return {id,answer:id==="B"?"送修需提供設備序號與故障現象。[B]":"保固期限為 12 個月。[A]"}}
 const pct=x=>x===null?"未定義":(100*x).toFixed(2)+"%";
 function update(r){
  const q=s=>r.querySelector(s),all=s=>[...r.querySelectorAll(s)],input=k=>q('[data-rag12="'+k+'"]'),val=k=>Number(input(k).value),label=(k,v)=>{const n=q('[data-rag12-label="'+k+'"]');if(n)n.textContent=v},out=q('[data-rag12-out]');
  if(r.dataset.rag12Demo==="purpose"){
   out.textContent=input("enabled").checked?"文件 B：送修需提供設備序號與故障現象。":"未取得外部證據；此教學系統不提供來源式回答。";
  }else if(r.dataset.rag12Demo==="chunk"){
   const l=val("l"),c=val("c"),o=Math.min(val("o"),c-1);input("o").max=c-1;input("o").value=o;label("l",l);label("c",c);label("o",o);
   const list=chunks12(l,c,o);out.textContent="步長 "+(c-o)+"，分塊 "+list.length+" 個；總索引 Token 數（含重疊） "+list.reduce((a,[s,e])=>a+e-s,0)+"。";
   const area=q("[data-rag12-chunks]");area.replaceChildren();
   list.forEach(([s,e],i)=>{const row=document.createElement("div"),name=document.createElement("div"),track=document.createElement("div"),bar=document.createElement("div");name.textContent="Chunk "+(i+1)+"：["+s+", "+e+")";track.style.cssText="height:13px;background:#e5e7eb;margin:3px 0 7px;border-radius:4px;position:relative";bar.style.cssText="position:absolute;height:100%;background:#6480ad;border-radius:4px;left:"+(100*s/l)+"%;width:"+(100*(e-s)/l)+"%";track.append(bar);row.append(name,track);area.append(row)});
  }else if(r.dataset.rag12Demo==="cos"){
   const x=val("x"),y=val("y"),k=val("k");label("x",x);label("y",y);label("k",k);q("[data-rag12-vector]").setAttribute("d","M160 110L"+(160+30*x)+" "+(110-30*y));q("[data-rag12-q]").setAttribute("x",Math.max(4,Math.min(305,165+30*x)));q("[data-rag12-q]").setAttribute("y",Math.max(12,Math.min(213,104-30*y)));
   const result=rank12([x,y],3);out.replaceChildren();
   if(!result.length){out.textContent="查詢為零向量：Cosine 無定義，不能排序。";return;}
   result.forEach((v,i)=>{const row=document.createElement("p");row.textContent=(i+1)+". 文件 "+v.id+"：Cosine="+v.score.toFixed(4)+(i<k?"（取回）":"（未取回）");out.append(row)});
  }else if(r.dataset.rag12Demo==="retrieve"){
   const result=retrieve12(input("query").value,input("access").checked,input("bad").checked);out.textContent="候選來源："+(result.id||"無")+"\n回答："+result.answer;
  }else if(r.dataset.rag12Demo==="metrics"){
   const k=val("k"),gold=all('[data-rag12="gold"]:checked').map(x=>x.value),m=metrics12("ABCDE".split(""),gold,k);label("k",k);
   out.textContent="命中 "+m.hits+" 項；Precision@"+k+" = "+pct(m.precision)+"；Recall@"+k+" = "+pct(m.recall)+"；RR@"+k+" = "+m.rr.toFixed(4)+"。";
  }
 }
 function event(e){const r=e.target.closest("[data-rag12-demo]");if(r&&e.target.matches("[data-rag12]"))update(r)}
 document.addEventListener("input",event);document.addEventListener("change",event);
 function init(){document.querySelectorAll("[data-rag12-demo]:not([data-rag12-ready])").forEach(r=>{r.dataset.rag12Ready="1";update(r)})}
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();


// Chapter 13: local teaching simulations; no external calls, real approvals or account writes.
(()=>{
function step13(s,scenario,max){if(s.done)return s;const lines=[...s.lines];let n=s.n,done=false;if(scenario==="missing"){lines.push("缺少工單 ID，要求使用者補充；未呼叫工具。");done=true}else if(n>=max){lines.push("達最大步數，停止並轉人工。");done=true}else{n++;if(n===1){lines.push("步驟 1：查詢工單 101。");if(scenario==="fail"){lines.push("工具回傳失敗，未取得狀態；停止並轉人工。");done=true}else lines.push("工具回傳 pending。")}else{lines.push("步驟 2：根據已確認狀態產生草稿；未寄信。");done=true}if(!done&&n>=max){lines.push("達最大步數，停止並轉人工。");done=true}}return {n,done,lines}}
function tool13(name,raw,access){if(name!=="lookup_status")return {ok:false,error:"tool_not_allowed"};if(!access)return {ok:false,error:"forbidden"};let a;try{a=JSON.parse(raw)}catch{return {ok:false,error:"invalid_json"}}if(!a||typeof a!=="object"||Array.isArray(a)||Object.keys(a).length!==1||!Object.hasOwn(a,"id")||!Number.isSafeInteger(a.id)||a.id<1)return {ok:false,error:"invalid_arguments"};const db={101:"pending",102:"closed"};return Object.hasOwn(db,a.id)?{ok:true,status:db[a.id]}:{ok:false,error:"not_found"}}
function memory13(c,h){return c-512-128-h-1024}
function policy13(op,allowed,approved,n,limit,spent,budget){if(!["read","send"].includes(op)||!allowed)return "forbidden";if(n+1>limit||spent+2>budget)return "limit";if(op==="send"&&!approved)return "approval_required";return "permitted"}
function evaluate13(w,a,wc,ac,violation){const rows=[{name:"Workflow",s:w,c:wc,eligible:w>=16},{name:"Agent",s:a,c:ac,eligible:a>=16&&!violation}].map(x=>({...x,rate:x.s/20,perTask:x.c/20,perSuccess:x.s?x.c/x.s:null}));const eligible=rows.filter(x=>x.eligible).sort((x,y)=>x.perSuccess-y.perSuccess||y.s-x.s);let winner="無合格方案";if(eligible.length){winner=eligible.length===2&&Math.abs(eligible[0].perSuccess-eligible[1].perSuccess)<1e-10&&eligible[0].s===eligible[1].s?"兩者並列":eligible[0].name}return {rows,winner}}
 const loops=new WeakMap();
 const initial=()=>({n:0,done:false,lines:[]});
 const reasons={forbidden:"拒絕：工具禁止或無權限。",limit:"停止：下一步將超出步數或預算。",approval_required:"暫停：此動作需要明確批准。",permitted:"政策預檢通過；僅模擬，未執行外部動作。"};
 function update(r,action){
  const q=s=>r.querySelector(s),inp=k=>q('[data-agent13="'+k+'"]'),val=k=>Number(inp(k).value),label=k=>{const n=q('[data-agent13-label="'+k+'"]');if(n)n.textContent=inp(k).value},out=q("[data-agent13-out]");
  switch(r.dataset.agent13Demo){
   case "loop":{label("max");let s=loops.get(r)||initial();if(action==="reset")s=initial();if(action==="next")s=step13(s,inp("scenario").value,val("max"));loops.set(r,s);out.textContent=s.lines.join("\n")||"等待開始。";q('[data-agent13-action="next"]').disabled=s.done;break;}
   case "tool":if(action==="call")out.textContent=JSON.stringify(tool13(inp("tool").value,inp("args").value,inp("access").checked),null,2);else out.textContent="等待呼叫。";break;
   case "memory":{label("history");const c=val("capacity"),b=memory13(c,val("history")),used=c-b;q("[data-agent13-bar]").style.width=Math.min(100,100*used/c)+"%";q("[data-agent13-bar]").style.background=b<0?"#b04444":"#6480ad";out.textContent=b<0?"超出容量 "+(-b)+" Token；請減少輸入或預留。":"已使用／預留 "+used+" Token；證據容量 "+b+" Token。";break;}
   case "policy":{["used","limit","spent","budget"].forEach(label);out.textContent=reasons[policy13(inp("operation").value,inp("allowed").checked,inp("approved").checked,val("used"),val("limit"),val("spent"),val("budget"))];break;}
   case "eval":{["workflow","agent","wc","ac"].forEach(label);const e=evaluate13(val("workflow"),val("agent"),val("wc"),val("ac"),inp("violation").checked);out.replaceChildren();for(const x of e.rows){const p=document.createElement("p");p.textContent=x.name+"：成功率 "+(100*x.rate).toFixed(0)+"%；每任務 NT$ "+x.perTask.toFixed(2)+"；每成功任務 "+(x.perSuccess===null?"未定義":"NT$ "+x.perSuccess.toFixed(2))+"；"+(x.eligible?"合格":"不合格");out.append(p)}const p=document.createElement("p");p.textContent="依本實驗規準："+e.winner;out.append(p);break;}
  }
 }
 function input(e){const r=e.target.closest("[data-agent13-demo]");if(r&&e.target.matches("[data-agent13]"))update(r,r.dataset.agent13Demo==="loop"?"reset":undefined)}
 document.addEventListener("input",input);document.addEventListener("change",input);
 document.addEventListener("click",e=>{const b=e.target.closest("[data-agent13-action]");if(!b)return;const r=b.closest("[data-agent13-demo]");if(r)update(r,b.dataset.agent13Action)});
 function init(){document.querySelectorAll("[data-agent13-demo]:not([data-agent13-ready])").forEach(r=>{r.dataset.agent13Ready="1";update(r)})}
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();


// Chapter 14: deterministic local planning exercises; no external operations.
(()=>{
function kpi14(before,after,pass,leak){const improvement=before>0?(before-after)/before*100:null;return {improvement,pass,eligible:before>0&&after<=before*.8+1e-10&&pass>=95&&!leak}}
function select14(weight,offline){const weights=[80-weight,weight,20];const rows=[{name:"Cloud API",ratings:[4,5,4],local:false},{name:"On-premises",ratings:[4,2,2],local:true},{name:"Hybrid",ratings:[5,3,3],local:false}].map(x=>({...x,score:x.ratings.reduce((s,v,i)=>s+v*weights[i],0)/100,eligible:!offline||x.local}));const eligible=rows.filter(x=>x.eligible);const max=Math.max(...eligible.map(x=>x.score));return {weights,rows,winners:eligible.filter(x=>Math.abs(x.score-max)<1e-10).map(x=>x.name)}}
function roi14(n,minutes,wage,real,initial,operating,months){const hours=n*minutes/60,gross=hours*wage*real/100,net=gross-operating,tco=initial+months*operating,benefit=months*gross,roi=tco>0?(benefit-tco)/tco*100:null,payback=net>0?(initial===0?0:initial/net):null;return {hours,gross,net,tco,benefit,roi,payback}}
function gate14(stage,quality,safety,ops,approval){const missing=[];if(!quality)missing.push("技術與品質");if(!safety)missing.push("安全與資料控制");if(!ops)missing.push("營運與回退準備");if(!approval)missing.push("階段批准");return {ok:missing.length===0,missing,next:{poc:"Pilot（受控試點）",pilot:"Rollout（分批上線）",rollout:"Operations（正式營運監控）"}[stage]}}
function monitor14(down,p95,accuracy,critical){const period=30*24*60,allowance=period*.001,availability=(period-down)/period*100;const issues=[];if(down>allowance+1e-10)issues.push("可用率未達目標");if(p95>2000)issues.push("P95 延遲超標");if(accuracy<95)issues.push("正確率未達標");return {availability,allowance,remaining:allowance-down,issues,status:critical?"重大安全事件：立即停止受影響功能，轉人工並啟動事件應變。":issues.length?"暫停擴大部署，診斷異常；必要時依計畫回滾。":"本組教學監控指標符合門檻，持續觀察。"}}
 const money=x=>"NT$ "+x.toLocaleString("zh-TW",{minimumFractionDigits:0,maximumFractionDigits:2});
 const pct=x=>x===null?"未定義":x.toFixed(2)+"%";
 function update(r){
  const q=s=>r.querySelector(s),inp=k=>q('[data-plan14="'+k+'"]'),val=k=>Number(inp(k).value),checked=k=>inp(k).checked,out=q("[data-plan14-out]");
  r.querySelectorAll("input[type=range][data-plan14]").forEach(x=>{const label=q('[data-plan14-label="'+x.dataset.plan14+'"]');if(label)label.textContent=x.value});
  function show(lines){out.replaceChildren();for(const line of lines){const p=document.createElement("p");p.textContent=line;out.append(p)}}
  switch(r.dataset.plan14Demo){
   case "kpi":{const a=kpi14(val("before"),val("after"),val("pass"),checked("leak"));show(["耗時降低："+pct(a.improvement)+"；正確率："+pct(a.pass),a.eligible?"通過本案例驗收門檻。":"未通過；不得僅依速度改善判定成功。"]);break;}
   case "select":{const s=select14(val("weight"),checked("offline"));show(["品質／成本／維護權重："+s.weights.join("%／")+"%",...s.rows.map(x=>x.name+"："+x.score.toFixed(2)+" 分；"+(x.eligible?"符合硬性條件":"排除：不支援完全離線")),"合格方案最高分："+s.winners.join("、")]);break;}
   case "roi":{const a=roi14(val("n"),val("minutes"),val("wage"),val("real"),val("initial"),val("operating"),val("months"));show(["每月節省工時："+a.hours.toFixed(2)+" 小時","每月可實現毛效益："+money(a.gross),"每月淨效益："+money(a.net),"期間 TCO："+money(a.tco),"期間毛效益："+money(a.benefit),"期間 ROI："+pct(a.roi),"簡化回收期："+(val("initial")===0?"無初始投入（仍需檢查每月淨效益）":a.payback===null?"無有限正回收期":a.payback.toFixed(2)+" 個月")]);break;}
   case "gate":{const a=gate14(inp("stage").value,checked("quality"),checked("safety"),checked("ops"),checked("approval"));show([a.ok?"通過本階段模擬檢核，可依計畫進入 "+a.next:"尚未通過：缺少 "+a.missing.join("、")+"；不得推進。"]);break;}
   case "monitor":{const a=monitor14(val("down"),val("p95"),val("accuracy"),checked("critical"));show(["可用率："+a.availability.toFixed(4)+"%；允許停機："+a.allowance.toFixed(1)+" 分鐘","剩餘停機預算："+a.remaining.toFixed(1)+" 分鐘",...(a.issues.length?[a.issues.join("、")]:[]),a.status]);break;}
  }
 }
 function event(e){const r=e.target.closest("[data-plan14-demo]");if(r&&e.target.matches("[data-plan14]"))update(r)}
 document.addEventListener("input",event);document.addEventListener("change",event);
 function init(){document.querySelectorAll("[data-plan14-demo]:not([data-plan14-ready])").forEach(r=>{r.dataset.plan14Ready="1";update(r)})}
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();


// Chapter 15: deterministic risk-management teaching simulations; no real approvals or external actions.
(()=>{
function matrix15(l0,i0,l1,i1){const initial=l0*i0,residual=l1*i1,level=x=>x>=16?"高":x>=8?"中":"低";return {initial,residual,initialLevel:level(initial),residualLevel:level(residual),changed:residual-initial,review:i1===5||residual>=16}}
function policy15(origin,action,scope,approved,sensitive){if(origin!=="user")return "untrusted";if(!scope||!["read","draft","export"].includes(action))return "forbidden";if(action==="export"&&sensitive)return "sensitive";if(action==="export"&&!approved)return "approval";return "permitted"}
function privacy15(necessary,extra,service,rights){return {missing:3-necessary,extra,ready:necessary===3&&extra===0&&service&&rights}}
function incident15(severity,contained,fixed,owner){const missing=[];if(!contained)missing.push("限制影響／核對結果");if(!fixed)missing.push("修正與回歸驗證");if(!owner)missing.push("責任人批准");return {ready:missing.length===0,missing,action:severity==="high"?"暫停受影響功能、通報並保留必要證據。":severity==="unknown"?"暫停重試，先核對外部結果。":"人工修訂、記錄問題及檢查影響。"}}
function rubric15(r,blocker,evidence){const weights=[20,20,25,15,20],parts=r.map((v,i)=>v*weights[i]/5),score=parts.reduce((a,b)=>a+b,0);return {parts,score,pass:score>=80&&!blocker&&evidence}}
 const reasons={untrusted:"拒絕：外部內容不能自行授權工具行動。",forbidden:"拒絕：動作不在授權範圍。",sensitive:"拒絕：包含禁止外傳的敏感資料，即使已批准亦不可外傳。",approval:"暫停：須取得具體人工批准。",permitted:"通過本案例政策預檢；未執行任何外部操作。"};
 function update(r){
  const q=s=>r.querySelector(s),inp=k=>q('[data-risk15="'+k+'"]'),val=k=>Number(inp(k).value),on=k=>inp(k).checked,out=q("[data-risk15-out]");
  r.querySelectorAll("input[type=range][data-risk15]").forEach(x=>{const el=q('[data-risk15-label="'+x.dataset.risk15+'"]');if(el)el.textContent=x.value});
  function show(lines){out.replaceChildren();for(const line of lines){const p=document.createElement("p");p.textContent=line;out.append(p)}}
  switch(r.dataset.risk15Demo){
   case "matrix":{const l0=val("l0"),i0=val("i0"),l1=val("l1"),i1=val("i1"),a=matrix15(l0,i0,l1,i1);const first=q('[data-risk15-mark="initial"]'),last=q('[data-risk15-mark="residual"]');first.setAttribute("x",52+(l0-1)*43);first.setAttribute("y",16+(5-i0)*39);last.setAttribute("cx",72+(l1-1)*43);last.setAttribute("cy",34+(5-i1)*39);show(["初始風險："+a.initial+"（"+a.initialLevel+"）","剩餘風險："+a.residual+"（"+a.residualLevel+"）；分數差："+(a.changed>0?"+":"")+a.changed,a.review?"須依重大影響或高風險硬性門檻審查。":"仍需由責任人確認控制證據及剩餘風險。"]);break;}
   case "injection":show([reasons[policy15(inp("origin").value,inp("action").value,on("scope"),on("approved"),on("sensitive"))]]);break;
   case "privacy":{const a=privacy15(["model","symptom","status"].filter(on).length,["name","phone","address"].filter(on).length,on("service"),on("rights"));show(["必要欄位缺少："+a.missing+"；非必要欄位："+a.extra,a.ready?"通過本案例初步檢核；仍須檢查自由文字及適用法規。":"尚未通過初步檢核，應修正欄位並確認處理授權及素材權利。"]);break;}
   case "incident":{const a=incident15(inp("severity").value,on("contained"),on("fixed"),on("owner"));show([a.action,a.ready?"通過本案例恢復閘門；仍應依計畫受控恢復及監控。":"不可恢復，尚缺："+a.missing.join("、")]);break;}
   case "rubric":{const a=rubric15([0,1,2,3,4].map(i=>val("r"+i)),on("blocker"),on("evidence"));show(["各項加權分數："+a.parts.join("／"),"總分："+a.score+" / 100",a.pass?"通過本案例驗收示例。":"未通過；需達 80 分、無重大未解決風險並具備完整測試證據。"]);break;}
  }
 }
 function event(e){const r=e.target.closest("[data-risk15-demo]");if(r&&e.target.matches("[data-risk15]"))update(r)}
 document.addEventListener("input",event);document.addEventListener("change",event);
 function init(){document.querySelectorAll("[data-risk15-demo]:not([data-risk15-ready])").forEach(r=>{r.dataset.risk15Ready="1";update(r)})}
 new MutationObserver(init).observe(document.body,{childList:true,subtree:true});init();
})();
