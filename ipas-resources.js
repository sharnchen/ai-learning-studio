'use strict';
(() => {
 const data=window.IPASResources;
 if(!data)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const link=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
 const jump=([week,page])=>'<button type="button" class="ipas-resource-jump" data-ipas-resource-week="'+week+'" data-ipas-resource-page="'+page+'">第 '+week+' 週・'+esc(window.IPASWeeks?.find(w=>w.n===week)?.slides.find(s=>s.n===page)?.title||'教材')+'</button>';
 const foundation=[
  ['人工智慧概念',0,[[1,3],[1,4],[2,3],[2,4]]],
  ['資料處理與分析概念',0,[[3,3],[3,5],[3,7],[4,3],[4,6]]],
  ['機器學習概念',0,[[5,3],[5,6],[6,3],[6,7]]],
  ['鑑別式 AI 與生成式 AI 概念',0,[[7,5],[7,6],[7,7]]],
  ['No Code／Low Code 概念',1,[[9,3],[9,6]]],
  ['生成式 AI 應用領域與工具使用',1,[[10,7],[11,3],[11,6],[11,7]]],
  ['生成式 AI 導入評估規劃',1,[[14,3],[14,5],[14,6],[15,3],[15,5]]]
 ];
 // Add explanations inside the existing slides; indices and saved checkpoints stay stable.
 function supplement(week,page,title,html){
  const slide=window.IPASWeeks?.find(w=>w.n===week)?.slides.find(s=>s.n===page);
  if(slide&&!slide.html.includes('data-ipas-supplement="'+title+'"'))slide.html+='<details class="ipas-supplement" data-ipas-supplement="'+title+'"><summary>'+title+'</summary>'+html+'</details>';
 }
 const find=id=>data.modules.find(m=>m.id===id);
 function core(m){return '<p><b>為什麼需要、基本原理：</b>'+esc(m.principle)+'</p><h4>逐步操作</h4><ol>'+m.steps.split('；').map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><div class="ipas-resource-example"><h4>數值與判讀</h4><p>'+esc(m.example)+'</p></div><p><b>應用與限制：</b>'+esc(m.application)+'</p><details><summary>自我檢核：'+esc(m.question)+'</summary><p>'+esc(m.answer)+'</p></details>'}
 supplement(4,3,'補充：平均差、母體與樣本變異數',core(find('m3-3-1')));
 supplement(4,3,'補充：抽樣變異、假設檢定與型一／型二錯誤',core(find('m3-3-3')));
 supplement(3,9,'補充：描述、診斷、預測與處方分析',core(find('m3-5-2')));
 supplement(5,6,'補充：演算法的選擇與 Logistic Regression',core(find('m4-4-2')));
 function demo(m){
  if(m.id==='m3-3-3')return '<div class="ipas-resource-demo"><label>教學示例 p 值 <input data-ipas-pvalue type="number" min="0" max="1" step="0.01" value="0.03"></label><output data-ipas-pvalue-out>α＝0.05；p＝0.03＜0.05，拒絕 H₀；不能解讀為 H₀ 為真的機率。</output><small>此處直接調整示例 p 值，觀察決策規則，不是從原始樣本計算檢定。</small></div>';
  if(m.id==='m4-5-4')return '<div class="ipas-resource-demo"><label>超參數組合數 <input data-ipas-combinations type="number" min="1" max="100" value="6"></label><label>交叉驗證折數 <input data-ipas-folds type="number" min="2" max="20" value="5"></label><output data-ipas-search-out>6 組 × 5 折＝30 次擬合；不含最後以完整訓練集重新擬合。</output></div>';
  if(m.id==='m4-6-2')return '<figure class="ipas-resource-bars" aria-label="A 群召回率百分之九十；B 群百分之五十"><div>A 群 Recall 90% <meter min="0" max="100" value="90">90%</meter></div><div>B 群 Recall 50% <meter min="0" max="100" value="50">50%</meter></div><figcaption>整體 83.33% 不能取代分群檢查。</figcaption></figure>';
  return '';
 }
 function moduleView(m){return '<details id="ipas-resource-'+m.id+'" class="ipas-resource-module" data-ipas-module data-subject="'+m.subject+'" data-search="'+esc(m.title+' '+m.principle+' '+m.example)+'"><summary>§'+m.section+' '+esc(m.title)+'</summary>'+core(m)+demo(m)+'<p>'+link(data.guides[m.subject].url,'官方指引｜'+data.guides[m.subject].title+' §'+m.section)+'</p>'+(m.existing.length?'<p>接續既有教材：</p><div class="ipas-resource-targets">'+m.existing.map(jump).join('')+'</div>':'')+'</details>'}
 function panel(){return '<section class="panel ipas-resources" aria-labelledby="ipas-resources-title"><h2 id="ipas-resources-title">官方資源對照與補充學習</h2><p>初級依原有 16 週學習；中級依三科的 34 個指引小節補充原理、步驟、數值例子與自我檢核。核對日期：'+data.checked+'。</p><details><summary>初級兩科：主題與教材對照</summary><div class="ipas-resource-table"><table><thead><tr><th>官方指引主題</th><th>站內學習位置</th></tr></thead><tbody>'+foundation.map(([title,sub,targets])=>'<tr><th>'+esc(title)+'<br><small>'+link(data.guides[sub].url,data.guides[sub].title)+'</small></th><td>'+targets.map(jump).join(' ')+'</td></tr>').join('')+'</tbody></table></div><p>新增補充放在第 3 週「ETL 與資料轉換」、第 4 週「描述統計與圖表」、第 5 週「常見模型」的展開說明，可直接沿原課程閱讀。</p></details><details><summary>中級三科：補充教材與逐項對照</summary><p>每個小節可先看例子再作答，並連回相關基礎課程；完整技術細節接續各科官方指引。</p><label>查找補充主題 <input type="search" data-ipas-resource-search placeholder="例如：假設、儲存、Spark、公平"></label><p role="status" data-ipas-resource-count>34 個補充小節</p>'+[2,3,4].map(sub=>'<section class="ipas-resource-subject"><h3>'+esc(data.guides[sub].title)+'</h3><p>'+link(data.guides[sub].url,'開啟本科官方學習指引')+'</p>'+data.modules.filter(m=>m.subject===sub).map(moduleView).join('')+'</section>').join('')+'</details><details><summary>官方學習指引、勘誤與易錯觀念</summary><ul>'+[...data.guides,...data.errata].map(r=>'<li>'+link(r.url,r.title)+'</li>').join('')+'</ul><div class="ipas-resource-example"><h3>依勘誤表核對的重要觀念</h3><ul><li>平均差：先取各數值與平均的絕對差，再求平均。</li><li>型一錯誤：H₀ 為真卻拒絕；型二錯誤：H₀ 為假卻未拒絕。p 值不代表 H₀ 為真的機率。</li><li>Recall＝TP/(TP＋FN)；Precision＝TP/(TP＋FP)。TP 是實際與預測皆陽性，FN 是實際陽性卻預測陰性，FP 是實際陰性卻預測陽性。</li><li>Logistic Regression 假設對數勝算與特徵呈線性關係，並不要求原始資料線性可分。</li><li>NMF 的非負條件表示矩陣每一個元素均大於或等於零；加權求和的第 i 項須為 wᵢxᵢ。</li></ul></div></details><details><summary>官方歷屆試題（'+data.exams.length+' 份公告 PDF）</summary><p>以下為官方公告原檔；站內線上測驗仍清楚區分「自編練習」與「官方歷屆試題」。</p>'+['初級','中級'].map(level=>'<h3>'+level+'</h3><ul>'+data.exams.filter(r=>r.title.includes(level)).map(r=>'<li>'+link(r.url,r.title.replace(/\.pdf$/,''))+'</li>').join('')+'</ul>').join('')+'</details><details><summary>官方列出的外部學習資源</summary>'+data.external.map(r=>'<h3>'+link(r.url,r.title)+'</h3><p>'+esc(r.intro)+'</p>').join('')+'</details><p>'+link(data.official,'查看官方學習資源最新公告')+'</p></section>'}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-ipas-resource-week]');if(!b)return;window.IPASCourse?.openVideoTarget(Number(b.dataset.ipasResourceWeek),Number(b.dataset.ipasResourcePage));requestAnimationFrame(()=>document.querySelector('.ipas-stage')?.scrollIntoView({block:'start'}))});
 document.addEventListener('input',e=>{
  if(e.target.matches('[data-ipas-resource-search]')){const q=e.target.value.normalize('NFKC').toLowerCase().replace(/\s+/g,'');let count=0;const root=e.target.closest('.ipas-resources');root.querySelectorAll('[data-ipas-module]').forEach(m=>{const text=m.dataset.search.normalize('NFKC').toLowerCase().replace(/\s+/g,'');m.hidden=!!q&&!text.includes(q);if(!m.hidden)count++});root.querySelector('[data-ipas-resource-count]').textContent=count?'找到 '+count+' 個補充小節':'沒有相符小節，請縮短關鍵詞';root.querySelectorAll('.ipas-resource-subject').forEach(s=>s.hidden=![...s.querySelectorAll('[data-ipas-module]')].some(m=>!m.hidden));}
  if(e.target.matches('[data-ipas-pvalue]')){const r=e.target.closest('.ipas-resource-demo'),p=e.target.valueAsNumber;r.querySelector('output').textContent=Number.isFinite(p)&&p>=0&&p<=1?'α＝0.05；p＝'+p+'，'+(p<=0.05?'拒絕':'未拒絕')+' H₀；不能解讀為 H₀ 為真的機率。':'請輸入 0～1 的 p 值。'}
  if(e.target.matches('[data-ipas-combinations],[data-ipas-folds]')){const r=e.target.closest('.ipas-resource-demo'),a=r.querySelector('[data-ipas-combinations]').valueAsNumber,b=r.querySelector('[data-ipas-folds]').valueAsNumber;r.querySelector('output').textContent=Number.isInteger(a)&&a>=1&&a<=100&&Number.isInteger(b)&&b>=2&&b<=20?a+' 組 × '+b+' 折＝'+a*b+' 次擬合；不含最後重新擬合。':'請輸入範圍內整數：組合 1～100，折數 2～20。'}
 });
 window.IPASResourcePanel={render:panel,foundation};
})();
