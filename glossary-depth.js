'use strict';
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const deep=new Map((window.GlossaryDeepLessons||[]).map(row=>[row.id,row]));
 const formulae=window.GlossaryFormulaLessons||{};
 const prior=keywordExample;
 const foundation=[
  ['從任務與資料理解 AI，再分辨學習方式。',['人工智慧','機器學習','訓練集','測試集']],
  ['先釐清一筆資料、欄位與標籤，才能討論清理及前處理。',['資料集','特徵','標籤','資料洩漏']],
  ['先理解數值、維度與運算順序，再閱讀機率或微分符號。',['向量','矩陣','機率','導數']],
  ['先區分分類、數值預測與分群，再選擇模型及驗收指標。',['分類','回歸','特徵','訓練集']],
  ['先看一個神經元如何加權，再理解多層資訊與梯度傳遞。',['權重','偏置','激活函數','反向傳播']],
  ['先分清楚模型要降低的誤差與參數更新方式。',['損失函數','梯度','學習率','驗證集']],
  ['先定義真值、預測與資料切分，指標的分母才有意義。',['訓練集','驗證集','測試集','混淆矩陣']],
  ['先看像素、通道及座標，再理解區域、特徵與物件。',['張量','通道','卷積','感興趣區域']],
  ['文字先轉為詞元與數值表示，模型才可處理語言或序列。',['詞元','分詞器','詞嵌入','序列長度']],
  ['先理解向量內積與機率權重，再看跨詞元資訊如何聚合。',['矩陣','點積','Softmax 函數','注意力機制']],
  ['先分清訓練與生成，再看提示、解碼及答案查核。',['語言模型','詞元','自回歸生成','幻覺']],
  ['先理解文件、索引與相似度，才可拆解證據檢索與生成。',['資訊檢索','文件切塊','嵌入模型','來源引用']],
  ['先知道哪些參數改變、哪些保持固定，再比較資源與品質。',['參數','權重','微調','量化']],
  ['先辨識輸入條件、潛在表示與輸出媒體，再追蹤生成路徑。',['多模態','潛在表示','控制條件','去噪']],
  ['先定義狀態、可做動作及獎勵，再討論長期決策。',['狀態','動作','獎勵','回報']],
  ['先分清模型提出的建議與工具真正執行的操作。',['工作流程','工具呼叫','結構化輸出','最小權限原則']],
  ['先界定服務的時間、記憶體與硬體限制，再比較執行方式。',['推論','延遲','吞吐量','顯示記憶體']],
  ['先定義保護對象、信任邊界與錯誤代價，再選控制方法。',['個人可識別資訊','最小權限原則','人工監督','穩健性']],
  ['先固定任務、量測期間及版本，才能比較導入與維運結果。',['基準模型','模型監測','可重現性','成本最佳化']]
 ];
 function related(names,current){return names.map(name=>keywordCatalog.find(t=>t.zh===name)).filter(t=>t&&t.id!==current.id);}
 function buttons(rows){return rows.map(t=>'<button type="button" data-learn-keyword="'+esc(t.id)+'">'+esc(t.zh)+'</button>').join('');}
 function section(title,body){return '<section class="keyword-section glossary-chapter glossary-depth-section"><h2>'+esc(title)+'</h2>'+body+'</section>';}
 const p=text=>'<p>'+esc(text)+'</p>';
 function table(headers,rows){return '<div class="glossary-depth-table"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 function formula(id){const row=formulae[id];if(!row)return '';const [latex,reading,fields,explain]=row;
  let math='<p class="glossary-equation-plain">'+esc(reading)+'</p>';
  if(window.katex){try{math='<div class="glossary-equation">'+window.katex.renderToString(latex,{output:'mathml',displayMode:true,throwOnError:true,trust:false})+'</div>'+p(reading);}catch(error){console.warn('Glossary formula',id,error);}}
  return section('公式、每個符號與使用條件',math+table(['符號','意義'],fields.split(';').map(x=>{const i=x.lastIndexOf('|');return [x.slice(0,i),x.slice(i+1)]}))+p(explain));
 }
 function sourceFor(row){
  if(row.id==='fluxgloss-21')return ['Rectified Flow 原始論文','https://arxiv.org/abs/2209.03003'];
  if(row.id==='fluxgloss-30')return ['Segment Anything 原始論文','https://arxiv.org/abs/2304.02643'];
  if(row.id==='fluxgloss-31')return ['HQ-SAM 原始論文','https://arxiv.org/abs/2306.01567'];
  if(['fluxgloss-49','fluxgloss-51','fluxgloss-52','fluxgloss-56'].includes(row.id))return ['PyTorch：CUDA 與裝置運算','https://docs.pytorch.org/docs/stable/notes/cuda.html'];
  if(['fluxgloss-26','fluxgloss-27','fluxgloss-28','fluxgloss-32','fluxgloss-33','fluxgloss-34','fluxgloss-35','fluxgloss-36'].includes(row.id))return ['OpenCV 影像處理官方教材','https://docs.opencv.org/4.x/d2/d96/tutorial_py_table_of_contents_imgproc.html'];
  return ['Google 機器學習詞彙與概念','https://developers.google.com/machine-learning/glossary'];
 }
 function reference(row){const [label,url]=sourceFor(row);return section('參考資料','<p><a target="_blank" rel="noopener noreferrer" href="'+url+'">'+esc(label)+'</a></p>');}
 function example(text){const lines=text.split(/。/).map(s=>s.trim()).filter(Boolean);return '<ol class="glossary-worked-steps">'+lines.map(x=>'<li>'+esc(x)+'。</li>').join('')+'</ol>';}
 function legacyWidget(t){
  if(!['fluxgloss-21','fluxgloss-26','fluxgloss-32','fluxgloss-34','fluxgloss-36','fluxgloss-52','fluxgloss-61','fluxgloss-62'].includes(t.id))return '';
  const original=prior(t,termPractice[t.zh]),marker=original.indexOf('data-flux-study="'+t.id+'"');if(marker<0)return '';
  const start=original.lastIndexOf('<div',marker),tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start;let depth=0,m;
  while((m=tags.exec(original))){depth+=m[0].startsWith('</')?-1:1;if(depth===0)return section('圖形與數值互動實驗',original.slice(start,tags.lastIndex));}
  return '';
 }
 function deepLesson(t,row){return section('要解決的問題與方法由來',p(row.why))+section('運作原理與方法定位',p(t.definition)+p(row.principle))+section('輸入、輸出與關鍵符號',table(['符號或欄位','意義'],row.symbols))+section('演算法與操作拆解',methodFlowchart(row.steps,{id:'deep-'+t.id,title:t.zh+'的操作流程'}))+legacyWidget(t)+formula(t.id)+section('完整實例：條件、代入與結果',example(row.example))+section('應用限制與易錯觀念',p(row.limit))+section('自我檢核','<p>'+esc(row.question)+'</p><details><summary>展開答案與理由</summary>'+p(row.answer)+'</details><div class="glossary-related">'+buttons(related(row.related,t))+'</div>')+reference(row);}
 function ipasLesson(t,row){
  const old=prior(t,termPractice[t.zh]);
  // Preserve the concept-specific prose, examples, references and practice links.
  let html=old.replace('<h2>概念由來與運作原理</h2>','<h2>問題背景、方法由來與原理</h2>').replace('<h2>方法拆解與流程圖</h2>','<h2>演算法與操作拆解</h2>').replace('<h2>完整範例與數值判讀</h2>','<h2>完整實例：條件、代入與結果</h2>');
  const fields=window.GlossaryConceptFields?.[t.id];
  if(fields)html=html.replace(/(<section\b[^>]*><h2>演算法與操作拆解<\/h2>)/,section('輸入、輸出與關鍵欄位',table(['項目','意義與使用方式'],fields))+'$1');
  const extra=formula(t.id);
  if(extra)html=html.replace(/(<section\b[^>]*><h2>完整實例：條件、代入與結果<\/h2>)/,extra+'$1');
  return html;
 }
 function intro(t){const [why,names]=foundation[t.domainId]||foundation[0],rows=related(names,t);
  return section('閱讀起點與先備概念',p(why)+'<div class="glossary-related" aria-label="先備概念">'+buttons(rows)+'</div>');
 }
 function decorate(t,html){let index=0;const toc=[];
  html=html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g,(all,attrs,title)=>{const own=attrs.match(/\bid=["']([^"']+)["']/),id=own?own[1]:'glossary-depth-'+t.id+'-'+(++index);toc.push([id,title.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&')]);return '<h2'+attrs+(own?'':' id="'+esc(id)+'"')+'>'+title+'</h2>';});
  return '<div class="glossary-depth" data-glossary-depth="'+esc(t.id)+'"><nav class="glossary-reading-map" aria-label="本詞閱讀導覽"><button type="button" data-depth-toggle aria-expanded="false" aria-controls="glossary-toc-'+esc(t.id)+'"><strong>'+esc(t.zh)+'・閱讀導覽</strong> · 展開段落目錄</button><ol hidden id="glossary-toc-'+esc(t.id)+'">'+toc.map(([id,title])=>'<li><a href="#'+esc(id)+'" data-glossary-section="'+esc(id)+'">'+esc(title)+'</a></li>').join('')+'</ol></nav>'+html+'</div>';
 }
 keywordExample=function(t,practice){const row=deep.get(t.id),local=window.IPASGlossary?.details.get(t.id);let html=row?deepLesson(t,row):local?ipasLesson(t,local):prior(t,practice);return decorate(t,intro(t)+html);};
 document.addEventListener('click',event=>{const toggle=event.target.closest('[data-depth-toggle]');if(toggle){const list=toggle.closest('nav').querySelector('ol');list.hidden=!list.hidden;toggle.setAttribute('aria-expanded',String(!list.hidden));return;}const link=event.target.closest('[data-glossary-section]');if(!link)return;const root=link.closest('#keyword-reader'),target=root?.querySelector('[id="'+link.dataset.glossarySection+'"]');if(!target)return;event.preventDefault();target.scrollIntoView({block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});
 window.GlossaryDepth={deep,formulae,foundation,formula,sourceFor};
})();
