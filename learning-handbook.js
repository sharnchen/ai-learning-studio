'use strict';
// SVG flowcharts are generated once with the handbook HTML; no DOM observers or CDN.
let methodFlowchartSerial=0;
const methodFlowchartRules={
 'learning-plan':{at:2,question:'是否有行動回饋？',yes:'將行動與回饋納入評估',no:'依現有資料與標籤評估方法'},
 'calc-clip':{at:1,question:'梯度範數是否超過上限？',yes:'需要縮放，計算共同倍率',no:'不需縮放，倍率設為 1'},
 'tree':{at:1,question:'是否符合分割條件？',yes:'走符合條件的分支',no:'走另一條分支'},
 'json':{at:0,question:'JSON 是否可解析？',yes:'繼續檢查欄位與型別',no:'回報解析錯誤，不執行欄位檢查',stop:true},
 'agent-workflow':{at:0,question:'是否具有寫入授權？',yes:'按授權範圍送出請求',no:'停止寫入並回報未授權',stop:true},
 'mcp-tools':{at:3,question:'型別與權限是否均通過？',yes:'執行允許的本地工具',no:'拒絕執行並回報原因',stop:true},
 'onehot':{at:1,question:'輸入是否在固定類別表內？',yes:'依固定順序進行編碼',no:'依既定規則處理未知類別',stop:true},
 'guardrails':{at:3,question:'敏感操作是否獲得批准？',yes:'依授權範圍繼續',no:'停止敏感操作',stop:true},
 'release':{at:4,question:'是否觸發事先訂定的回滾條件？',yes:'回到舊版並記錄事件',no:'持續觀察新版與錯誤指標'},
 'pipeline':{at:4,question:'必要檢查是否全部通過？',yes:'前進至允許的下一階段',no:'停止發布並回報問題',stop:true},
 'kmeans':{loopAt:3,to:1,question:'是否還有指定迭代未完成？'},
 'boost':{loopAt:4,to:1,question:'是否還有指定輪次未完成？'},
 'optimizer':{loopAt:4,to:1,question:'是否還有指定更新未完成？'},
 'tokenizer':{loopAt:3,to:1,question:'是否還有指定合併次數未完成？'},
 'rnn':{loopAt:4,to:2,question:'是否還有下一個時間步？'},
 'qlearning':{loopAt:5,to:1,question:'是否還有指定回合未完成？'},
 'generation-ode':{loopAt:3,to:1,question:'是否還有指定時間步未完成？'},
 'gradient-ascent':{loopAt:5,to:2,question:'是否還有指定更新未完成？'},
 'cv':{loopAt:2,to:2,question:'是否還有下一折待驗證？'},
 'graph':{loopAt:3,to:3,question:'佇列非空且尚未找到終點？'}
};
function methodFlowchart(steps,options={}){
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const items=Array.isArray(steps)?steps.map(String):[];
 if(!items.length)return '';
 const rule=options.id?methodFlowchartRules[options.id]:null;
 const uid='method-flow-'+(++methodFlowchartSerial),title=options.title||'方法步驟流程圖';
 function wrap(text,max){
  const lines=[];let line='',length=0;
  for(const char of text){const n=/[\x00-\xff]/.test(char)?.56:1;
   if(char==='\n'||length+n>max){lines.push(line);line='';length=0;if(char==='\n')continue;}
   line+=char;length+=n;
  }
  if(line)lines.push(line);return lines;
 }
 const nodes=[],edges=[],positions=[];let y=12,previous=null;
 function node(label,type='process',x=38,width=324){
  const lines=wrap(label,type==='decision'?9:width/22),height=type==='decision'?Math.max(160,lines.length*40+60):Math.max(type==='terminal'?46:62,lines.length*28+28);
  const n={label,type,x,y,width,height,lines};nodes.push(n);return n;
 }
 function connect(a,b,label=''){if(a&&b)edges.push({a,b,label:label||a.exitLabel||''});}
 let n=node('開始','terminal');previous=n;y+=n.height+32;
 for(let i=0;i<items.length;i++){
  const isDecision=rule?.at===i;
  n=node(isDecision?rule.question:items[i],isDecision?'decision':'process');positions[i]=n;
  connect(previous,n);previous=n;y+=n.height+36;
  if(isDecision){
   const top=y,left=node(rule.yes,'process',8,184);y=top;const right=node(rule.no,rule.stop?'terminal':'process',208,184);
   edges.push({a:n,b:left,label:'是',fork:true});edges.push({a:n,b:right,label:'否',fork:true});
   y=top+Math.max(left.height,right.height)+44;
   const merge={x:200,y:y-12,width:0,height:0};
   edges.push({a:left,b:merge,merge:true});if(!rule.stop)edges.push({a:right,b:merge,merge:true});
   previous=merge;
  }
  if(rule?.loopAt===i){
   const d=node(rule.question,'decision');connect(previous,d);positions[i].loopDecision=d;
   edges.push({a:d,b:positions[rule.to],label:'是',loop:true});previous=d;y+=d.height+36;previous.exitLabel='否';
  }
 }
 const end=node('本次流程結束','terminal');connect(previous,end,previous?.exitLabel||'');y+=end.height+12;
 const svgText=(n)=>'<text x="'+(n.x+n.width/2)+'" y="'+(n.y+n.height/2-(n.lines.length-1)*14+7)+'" text-anchor="middle" class="method-flow-label">'+n.lines.map((s,i)=>'<tspan x="'+(n.x+n.width/2)+'" dy="'+(i?28:0)+'">'+escape(s)+'</tspan>').join('')+'</text>';
 const drawnNodes=nodes.map(n=>{
  const cx=n.x+n.width/2,cy=n.y+n.height/2;
  const shape=n.type==='decision'?'<path d="M'+cx+' '+n.y+'L'+(n.x+n.width)+' '+cy+'L'+cx+' '+(n.y+n.height)+'L'+n.x+' '+cy+'Z"/>':'<rect x="'+n.x+'" y="'+n.y+'" width="'+n.width+'" height="'+n.height+'" rx="'+(n.type==='terminal'?23:12)+'"/>';
  return '<g class="method-flow-'+n.type+'">'+shape+svgText(n)+'</g>';
 }).join('');
 const drawnEdges=edges.map(e=>{
  const a=e.a,b=e.b,ax=a.x+a.width/2,ay=a.y+a.height,bx=b.x+b.width/2,by=b.y;let path,labelx=ax+18,labely=(ay+by)/2;
  if(e.loop){const startX=a.x+a.width,startY=a.y+a.height/2,endX=b.x+b.width,endY=b.y+b.height/2;path='M'+startX+' '+startY+'H398V'+endY+'H'+endX;labelx=382;labely=startY-10;}
  else if(e.fork){const sy=ay+18;path='M'+ax+' '+ay+'V'+sy+'H'+bx+'V'+by;labelx=bx;labely=by-10;}
  else if(e.merge){path='M'+ax+' '+ay+'V'+by+'H'+bx;}
  else path='M'+ax+' '+ay+'V'+by;
  return '<path class="method-flow-edge" d="'+path+'"'+(e.merge?'':' marker-end="url(#'+uid+'-arrow)"')+'/>'+(e.label?'<text class="method-flow-edge-label" x="'+labelx+'" y="'+labely+'" text-anchor="middle">'+escape(e.label)+'</text>':'');
 }).join('');
 return '<figure class="method-flowchart" data-method-flowchart="'+escape(options.id||'sequence')+'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 408 '+y+'" role="img" aria-labelledby="'+uid+'-title '+uid+'-desc"><title id="'+uid+'-title">'+escape(title)+'</title><desc id="'+uid+'-desc">'+escape(items.join('；')+(rule?'。判斷：'+rule.question+'。是與否分別沿標示分支前進。':''))+'</desc><defs><marker id="'+uid+'-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#7764a3"/></marker></defs>'+drawnEdges+drawnNodes+'</svg><figcaption>方框：操作；菱形：判斷；箭頭：執行方向。</figcaption><details class="method-flow-transcript"><summary>流程文字版</summary><ol>'+items.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol></details></figure>';
}
let methodGuideCounter=0;
const methodDefaultsCache=new Map();
function methodEngine(t){return labEngines.find(e=>e.id===t.engineId)||labEngines.find(e=>e.terms.includes(t.zh))}
function methodInputRows(e,v){const p=methodLessons[e.id];return e.controls.map((c,i)=>[c.label,c.id,p.inputs[i],typeof v[c.id]==='object'?JSON.stringify(v[c.id]):String(v[c.id])])}
function methodScope(e){return methodLessons[e.id]?.principle||e.description}
function methodDefaultResult(e,values=null){const v=values||labDefaults(e),key=e.id+JSON.stringify(v);if(!methodDefaultsCache.has(key))methodDefaultsCache.set(key,{v,r:e.compute({...v})});return methodDefaultsCache.get(key)}
function methodFormulaReading(e,c,r={}){const p=methodLessons[e.id];return `<section class="formula-explanation"><h4>本節運算如何得到結果？（Calculation Guide）</h4><p>${escapeHtml(p.principle)}</p>${labTable(['輸入名稱','符號','意義與用途','目前值'],methodInputRows(e,c.inputs||labDefaults(e)))}${methodFlowchart(p.steps,{id:e.id,title:e.title+'：方法流程圖'})}<p><b>判讀前提：</b>${escapeHtml(p.limit)}</p><p>下列各步保留本次實際運算及代入值；不是另外抽換的示例。請按上述演算法順序核對中間結果。</p></section>`}
function methodWorkedExample(t,e,values=null){const {v,r}=methodDefaultResult(e,values),p=methodLessons[e.id];const result=(r.metrics||[]).map(([name,value])=>[name,typeof value==='number'?lfmt(value):String(value)]);return `<p>以下使用「${escapeHtml(e.title)}」的固定教學資料與預設輸入，結果由同一個實驗引擎計算。${t?`它示範「${escapeHtml(t.zh)}」涉及的部分機制；若上方應用情境使用不同資料，答案不能直接套用。`:''}</p>${e.demonstrationScope&&!e.id.startsWith('calc-')?`<p><b>本例固定假設：</b>${escapeHtml(e.demonstrationScope)}</p>`:''}${labTable(['輸入名稱','符號','意義與用途','預設值'],methodInputRows(e,v))}${methodFlowchart(p.steps,{id:e.id,title:e.title+'：方法流程圖'})}${result.length?labTable(['算得項目','預設結果'],result):''}${e.id==='knn'&&typeof knnRows==='function'?`<p>查詢點 Q = (${v.x}, ${v.y})，取最近 ${v.k} 筆：${knnRows(r).slice(0,v.k).map(p=>p.id).join('、')}。</p>${labTable(['排名','樣本','座標','已知類別','距離','投票'],knnRows(r).map(p=>[p.rank,p.id,`(${p.x}, ${p.y})`,p.category,knnNumber(p.distance),p.rank<=v.k?'是':'否']))}<details><summary>六筆距離的逐步代入</summary>${knnRows(r).map(p=>`<p>Q 到 ${p.id}</p>${knnMath(v,p)}`).join('')}</details>`:''}${r.table?`<details><summary>逐筆資料與中間結果（${r.table.rows.length} 列）</summary>${labTable(r.table.headers,r.table.rows)}</details>`:''}${r.lines?.length?`<ul>${r.lines.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul>`:''}${r.steps?.length?`<ol>${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>`:''}${r.grids?.length?'<div class="method-grids">'+r.grids.map(labGrid).join('')+'</div>':''}${r.series?.length?labLinePlot(r.series):''}<p><b>結果如何判讀：</b>${escapeHtml(p.principle)} ${escapeHtml(p.limit)}</p>${t?`<button class="primary" data-open-lab="${t.id}">調整輸入、查看圖形與完整計算 →</button>`:''}`}
function methodLearningGuide(t,e=methodEngine(t),mode='term'){if(!e||!methodLessons[e.id])throw Error('Missing learning explanation: '+(e?.id||t?.zh));const p=methodLessons[e.id],uid='method-'+(++methodGuideCounter);const labels=['問題與方法由來','原理與名詞','演算法拆解','輸入怎麼讀','完整算例','應用與限制','練習與驗收'];const d=t?termPractice[t.zh]:null;return `<section class="method-handbook" data-method-id="${e.id}"><div class="eyebrow">UNDERSTAND · TRACE · VERIFY · APPLY</div><h3>${escapeHtml(t?t.zh:e.title)}：從問題到方法（Learning Path）</h3><p class="method-context">${t?`${escapeHtml(t.en)}。${escapeHtml(t.definition)}`:escapeHtml(e.title)} ${mode==='lab'?'目前下方輸入會即時影響實驗；此處先交代方法脈絡。':'依序閱讀原理、拆解與算例，再進入圖形操作。'}</p>${t&&typeof domainGuidance!=='undefined'?`<p><b>先備知識（Prerequisites）：</b>${escapeHtml(domainGuidance[t.domainId][0])}</p>`:''}<nav class="method-navigation" aria-label="單元學習順序">${labels.map((x,i)=>`<button data-method-jump="${uid}-${i}">${i+1}. ${x}</button>`).join('')}</nav><section id="${uid}-0"><h4>1. 問題背景與方法由來（Motivation）</h4><p>${escapeHtml(p.why)}</p><p class="muted">這裡的「由來」說明設計動機與推理脈絡；相關來源可由單元的參考資料延伸閱讀。</p>${d?`<div class="method-case"><b>本詞應用情境（文字示意）：</b>${escapeHtml(d.example)}<p class="muted">下方數值實驗使用另行明列的固定資料；請勿把文字示意直接當成該實驗的輸入。</p></div>`:''}</section><section id="${uid}-1"><h4>2. 核心原理與名詞（Principle）</h4><p>${escapeHtml(p.principle)}</p>${typeof learningReference==='function'?learningReference([t?.zh,t?.en,t?.definition,p.principle].filter(Boolean).join(' ')):''}${mode==='lab'?`<p><b>本例範圍：</b>${escapeHtml(e.type)}。${escapeHtml(p.limit)}</p>`:''}</section><details open id="${uid}-2"><summary>3. 方法怎麼一步步完成？（Algorithm Breakdown）</summary>${methodFlowchart(p.steps,{id:e.id,title:(t?t.zh:e.title)+'：方法流程圖'})}<p>每一步以上一步資料為依據；在互動圖中核對相同順序，再查看對應數值。</p></details><details id="${uid}-3"><summary>4. 輸入代表什麼？（Inputs）</summary>${labTable(['輸入名稱','符號','意義與用途','預設值'],methodInputRows(e,labDefaults(e)))}<p>預設值是教學起點，不是建議所有任務都使用的最佳設定。切換模式時，部分輸入可能只影響該模式；請依結果表核對。</p></details><details id="${uid}-4"><summary>5. 用完整資料走一遍（Worked Example）</summary>${methodWorkedExample(t,e)}</details><details id="${uid}-5"><summary>6. 何時適用？何時可能失效？（Applications & Limits）</summary><p><b>應用：</b>${escapeHtml(p.use)}</p><p><b>限制與假設：</b>${escapeHtml(p.limit)}</p>${t&&e.terms.length>1?`<p>「${escapeHtml(t.zh)}」與其他詞條共用這個機制示範，不代表這些技術完全相同。先以本詞定義及應用情境辨認你正在學的部分。</p>`:''}${t?`<p><b>參考資料：</b></p><ul>${curriculum[t.domainId].sourceIds.map(i=>`<li><a href="${escapeHtml(learningSources[i].url)}" target="_blank" rel="noopener">${escapeHtml(learningSources[i].title)} ↗</a></li>`).join('')}</ul>`:''}</details><details id="${uid}-6"><summary>7. 實作任務與驗收（Practice & Verification）</summary>${t?methodPracticeComparison(t,e):''}<p><b>驗收：</b>列出改前與改後輸入、指出改變的中間步驟、用表格或公式核對結果，再說明是否符合上述原理。沒有變化也要解釋原因，例如模式未使用此值、門檻尚未跨過或四捨五入。</p><p>自我勾選與一次答對不代表完成實務驗證；請再舉一個適用案例和一個不適用案例。</p>${t?`<button data-open-lab="${t.id}">帶著問題進入完整互動實驗 →</button>`:''}</details></section>`}
function keywordLearningHandbook(t){return methodLearningGuide(labCases.find(x=>x.id===t.id)||t,undefined,'term')}
function lessonMethodTerms(l){const terms=[...(l.termIds||[]).map(id=>labCases.find(t=>t.id===id)).filter(Boolean),...lessonRecallTerms(l).map(t=>labCases.find(x=>x.id===t.id)).filter(Boolean),...labCases.filter(t=>t.lessonId===l.id)];const seen=new Set();return terms.filter(t=>{if(seen.has(t.engineId))return false;seen.add(t.engineId);return true})}
function lessonLearningHandbook(l){const terms=lessonMethodTerms(l);return `<section class="lesson-learning-path"><h3>這一課怎麼學？（Study Roadmap）</h3><p><b>學習問題：</b>${escapeHtml(l.sub)}。先理解問題與方法，再核對數據，最後用新情境解釋。</p><ol><li>閱讀核心觀念，確認輸入、輸出與先備名詞。</li><li>依序展開下列方法，了解設計動機、運作原理與限制。</li><li>核對完整算例，進入圖形實驗修改一個條件。</li><li>完成情境題，說明選擇理由；將疑問記在本課筆記。</li></ol>${terms.length?terms.map((t,i)=>`<details class="lesson-method" ${i===0?'open':''}><summary>${escapeHtml(t.zh)}（${escapeHtml(t.en)}）：問題、原理、算例與應用</summary>${methodLearningGuide(t,methodEngine(t),'lesson')}</details>`).join(''):'<p>請先閱讀本課核心觀念，沿相關詞條進入對應實驗。</p>'}${unitGuidance(l.domainId??coreDomain[l.id])}</section>`}
function learningArchitecture(){return `<section class="learning-architecture"><h2>從理解到應用（How to Learn）</h2><p>每個單元以同一條學習路徑展開；課程、詞條與實驗共用方法說明。先釐清問題，再動手驗證。</p><div>${[['01','為什麼需要','理解問題、方法設計動機與先備名詞。'],['02','怎麼運作','拆解原理、輸入、運算與中間結果。'],['03','如何驗證','用明列資料手算，再改一個條件看圖表。'],['04','何時使用','說明應用、假設、失效情況與驗收理由。']].map(([n,t,d])=>`<article><span>${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div><p>初次學習可按領域先備順序走課程；遇到陌生名詞，進入詞條閱讀完整說明；實驗用來驗證機制，不能直接當成真實模型的效能。</p></section>`}
document.addEventListener('click',event=>{const target=event.target.closest('[data-method-jump]');if(!target)return;const section=document.getElementById(target.dataset.methodJump);if(!section)return;if(section.tagName==='DETAILS')section.open=true;section.scrollIntoView({block:'start',behavior:'smooth'})});
const methodPracticeCache=new Map();
function methodPracticeScenario(e,values=null){const key=e.id+JSON.stringify(values||labDefaults(e));if(methodPracticeCache.has(key))return methodPracticeCache.get(key);const {v,r}=methodDefaultResult(e,values),ordered=[...e.controls.filter(c=>c.type==='number'),...e.controls.filter(c=>c.type==='checkbox'),...e.controls.filter(c=>c.type==='select'),...e.controls.filter(c=>c.type==='textarea')];for(const c of ordered){let value=v[c.id];if(c.type==='number'){const step=c.step||1;value=Number((value+step<=c.max?value+step:value-step).toPrecision(12));if(value<c.min||value>c.max)continue}else if(c.type==='checkbox')value=!value;else if(c.type==='select')value=c.options.map(o=>o.split(':')[0]).find(x=>x!==value);else{try{const obj=JSON.parse(value);if(obj&&typeof obj==='object'&&!Array.isArray(obj)&&typeof obj.price==='number'){obj.price+=1;value=JSON.stringify(obj)}else throw Error()}catch{const xs=String(value).split(',');if(xs.length>1&&xs.every(x=>x.trim()!==''&&Number.isFinite(Number(x)))){xs[0]=String(Number(xs[0])+1);value=xs.join(',')}else if(String(value).includes('|'))value+='\n'+String(value).split('\n')[0];else value=String(value)+' test'}}if(value===undefined||value===v[c.id])continue;const changed={...v,[c.id]:value};try{const after=e.compute(changed),scenario={v,r,c,changed,after};methodPracticeCache.set(key,scenario);return scenario}catch{/* Try another valid teaching control instead of showing an invalid exercise. */}}throw Error('No valid controlled experiment for '+e.id)}
function methodPracticeSteps(t){const e=methodEngine(t),s=methodPracticeScenario(e),show=x=>typeof x==='boolean'?(x?'啟用':'關閉'):String(x),inputs=e.controls.map(c=>c.label+'='+show(s.v[c.id])).join('；'),summary=labResultSummary(s.after).slice(0,3).map(([k,v])=>k+'：'+v).join('；');return [['準備資料（Prepare）',`開啟「${e.title}」，使用本例固定資料，將輸入設為：${inputs}。先記下原始結果。`],['只改一項（Change）',`其餘輸入保持不變，只把「${s.c.label}」從「${show(s.v[s.c.id])}」改為「${show(s.changed[s.c.id])}」。查看演算法哪一步使用了這個值，再比較圖形與數據。`],['解釋與驗收（Verify）',`改後前三項參考摘要：${summary||'請查看逐筆結果表'}。用本頁完整比較表核對；結果沒有改變也要指出原因。最後用自己的話解釋方法的適用情境與限制。`]]}
function methodPracticeComparison(t,e=methodEngine(t),values=null){const s=methodPracticeScenario(e,values),before=new Map(labResultSummary(s.r)),after=labResultSummary(s.after);return `<p><b>完整任務設定：</b>使用「${escapeHtml(e.title)}」的固定教學資料；以下兩組只改一個欄位。</p>${labTable(['輸入','意義與用途','原值','改後值'],e.controls.map((c,i)=>[c.label,methodLessons[e.id].inputs[i],String(s.v[c.id]),String(s.changed[c.id])]))}<p>先預測，再把「${escapeHtml(s.c.label)}」改成表內數值。請依演算法順序找出受影響的中間步驟。</p>${labTable(['參考結果','原值','改後值'],after.map(([k,v])=>[k,before.get(k)??'—',v]))}<p>表格由實驗引擎以兩組輸入實際計算；相同結果可能代表類別或門檻未改變，不代表所有距離、中間值都相同。請進入完整實驗核對逐筆計算。</p>`}
function methodNextStepOptions(t){const e=methodEngine(labCases.find(x=>x.id===t.id)||t),steps=methodLessons[e.id].steps,other=keywordCatalog.filter(x=>x.id!==t.id).slice(0,2);return [{id:t.id,label:steps[1]},{id:other[0].id,label:steps[0]},{id:other[1].id,label:steps[steps.length-1]}].sort((a,b)=>a.label.localeCompare(b.label))}
function methodQuestion(t){const e=methodEngine(labCases.find(x=>x.id===t.id)||t),p=methodLessons[e.id];return `在「${e.title}」的教學流程中，已完成「${p.steps[0]}」。依本例演算法，接下來應先做哪一步？`}
function methodQuestionFeedback(t){const p=methodLessons[methodEngine(labCases.find(x=>x.id===t.id)||t).id];return `完成「${p.steps[0]}」後，先「${p.steps[1]}」，再進行後續步驟。`}
