'use strict';
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/[\s,，/／–—-]+/g,' ').trim();
 const detailById=new Map(),added=[],reused=[];
 // Keep IDs and account progress for an existing equivalent concept.
 for(const row of window.IPASGlossaryData||[]){
  // Acronyms alone are not equivalent concepts: investment ROI differs from image ROI.
  const fullName=normalize(row.en.split(/[,，]/)[0]);
  let term=keywordCatalog.find(t=>t.zh===row.zh||normalize(t.en.split(/[,，]/)[0])===fullName);
  if(!term){const domain=curriculum[row.domainId];term={id:row.id,zh:row.zh,en:row.en,definition:row.definition,domainId:domain.id,domain:domain.title,lessonId:domain.lessonIds[0]};keywordCatalog.push(term);domain.terms.push(term);added.push(term.id);}
  else reused.push(term.id);
  detailById.set(term.id,row);
  plainKeywordDefinitions[term.id]=row.definition;
  termPractice[term.zh]={example:row.example,action:row.steps.join('；'),expected:row.application};
 }
 // Render dedicated explanations, without assigning unrelated experiment engines.
 const previousExample=keywordExample;
 keywordExample=function(term,practice){
  const row=detailById.get(term.id);if(!row)return previousExample(term,practice);
  const section=(title,body)=>'<section class="keyword-section glossary-chapter"><h2>'+title+'</h2>'+body+'</section>';
  const p=x=>'<p>'+esc(x)+'</p>';
  const source=row.domainId===18?'https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources':row.id.endsWith('http')?'https://www.rfc-editor.org/rfc/rfc9110':row.id.endsWith('csv')?'https://www.rfc-editor.org/rfc/rfc4180':row.id.endsWith('json')?'https://www.rfc-editor.org/rfc/rfc8259':row.id.endsWith('jsonschema')?'https://json-schema.org/understanding-json-schema/':row.id.endsWith('spark')?'https://spark.apache.org/docs/latest/cluster-overview.html':row.id.endsWith('hdfs')?'https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html':row.id.endsWith('mapreduce')?'https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html':row.domainId===17?'https://airc.nist.gov/airmf-resources/airmf/5-sec-core/':[2,3].includes(row.domainId)?'https://scikit-learn.org/stable/user_guide.html':'https://developers.google.com/machine-learning/glossary';
  return '<div class="glossary-standard">'+section('概念由來與運作原理',p(row.definition)+p(row.principle))+section('方法拆解與流程圖',methodFlowchart(row.steps,{id:term.id,title:row.zh+'的理解與操作流程'}))+section('完整範例與數值判讀',p(row.example))+section('應用、限制與易混淆觀念',p(row.application))+section('自我檢核與實作','<p>根據上方範例，逐步說明輸入、處理方法及結果；若改變一項條件，判斷哪些結果需要重新驗證。</p><button type="button" data-keyword-tab="interact">檢查情境理解</button> <button type="button" data-keyword-tab="practice">記錄實作與觀察</button>')+section('參考資料','<p><a href="'+source+'" target="_blank" rel="noopener noreferrer">原始文件與概念參考</a></p>'+(source==='https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources'?'':'<p><a href="https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources" target="_blank" rel="noopener noreferrer">iPAS 官方學習資源</a></p>'))+'</div>';
 };
 const aliases=new Map();
 function add(name,id){name=String(name).trim();if(name.length<2||/^[A-Za-z]$/.test(name))return;const key=name.toLowerCase();if(!aliases.has(key))aliases.set(key,{name,id});}
 for(const t of keywordCatalog){add(t.zh,t.id);for(const n of t.zh.split(/[／/]/))add(n,t.id);for(const n of t.en.split(/[,，/]/))add(n,t.id);}
 const extras={
  '人工智能':'人工智慧','生成式 AI':'生成式人工智慧','生成式AI':'生成式人工智慧','生成式人工智能':'生成式人工智慧','監督式學習':'監督學習','非監督式學習':'非監督學習','半監督式學習':'半監督學習','過度擬合':'過擬合','不足擬合':'欠擬合','過度配適':'過擬合','正則化':'正則化','早停':'提早停止',
  'KNN':'最近鄰演算法','K-NN':'最近鄰演算法','K-means':'K 平均分群','K means':'K 平均分群','K均值':'K 平均分群','樸素貝葉斯':'樸素貝氏分類器','Naive Bayes':'樸素貝氏分類器','Logistic Regression':'邏輯斯回歸','線性迴歸':'線性回歸',
  'Recall':'召回率／敏感度','Sensitivity':'召回率／敏感度','TPR':'召回率／敏感度','AUC':'ROC 曲線下面積','ROC':'ROC 曲線','F1':'F1 分數','MSE':'均方誤差','MAE':'平均絕對誤差','BCE':'二元交叉熵','ANN':'人工神經網路','Loss':'損失函數','Epoch':'訓練輪次','Iteration':'迭代','Optimizer':'最佳化器','Checkpoint':'檢查點',
  'Embedding':'嵌入模型','Attention':'注意力機制','Self-Attention':'自注意力','Top-k':'Top-k 取樣','Top-p':'核取樣','Few-shot':'少樣本提示','Chunking':'文件切塊','Overlap':'區塊重疊','KV Cache':'鍵值快取','Data Drift':'資料漂移','Concept Drift':'概念漂移',
  'No-Code':'無程式碼開發','Low-Code':'低程式碼開發','No code':'無程式碼開發','Low code':'低程式碼開發','資訊安全 CIA':'資訊安全三要素','平均值':'算術平均數','平均數':'算術平均數','型一錯誤':'型一與型二錯誤','型二錯誤':'型一與型二錯誤','Hypothesis Test':'假設檢定','p值':'p 值','p-value':'p 值',
  'DBSCAN':'密度式分群','BPTT':'跨時間反向傳播','DDPM':'去噪擴散機率模型','BERT':'BERT 語言模型','GPT':'GPT 類自回歸模型','SVR':'支持向量回歸','RMF':'AI 風險管理框架','AI RMF':'AI 風險管理框架','NIST':'AI 風險管理框架','OWASP':'OWASP 與 LLM 風險分類','XAI':'可解釋性','L1':'L1 正則化','L2':'L2 正則化','KL':'KL 散度','ELBO':'證據下界','HTTP':'HTTP 請求與回應','HTTPS':'HTTP 請求與回應','GET':'HTTP 請求與回應','POST':'HTTP 請求與回應','PUT':'HTTP 請求與回應','PATCH':'HTTP 請求與回應','DELETE':'HTTP 請求與回應','Q1':'四分位距','Q3':'四分位距','TF-IDF':'詞頻與逆文件頻率','BM25':'BM25 檢索排序','SHAP':'SHAP 特徵貢獻解釋','LIME':'LIME 局部模型解釋','HDFS':'Hadoop 分散式檔案系統','Spark':'Spark 分散式運算','MapReduce':'MapReduce 分散式處理','JSON Schema':'JSON 結構規格','Special Token':'特殊詞元','BOS':'特殊詞元','EOS':'特殊詞元','PAD':'特殊詞元','UNK':'特殊詞元','MASK':'特殊詞元',
  '投報率':'投資報酬率','總持有成本':'總持有成本','回收期':'回收期','Payback Period':'回收期','Production Rollout':'持續部署','人類監督':'人工監督','Human-in-the-loop':'人工介入','HITL':'人工介入'
 };
 const unresolvedAliases=[];
 for(const [name,zh]of Object.entries(extras)){const t=keywordCatalog.find(t=>t.zh===zh);if(t)aliases.set(name.toLowerCase(),{name,id:t.id});else unresolvedAliases.push({name,zh});}
 const reEscape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp([...aliases.values()].map(a=>reEscape(a.name).replace(/ +/g,'[ \\t]+')).sort((a,b)=>b.length-a.length).join('|'),'giu');
 const tokenChar=c=>!!c&&/[\p{L}\p{N}_]/u.test(c)&&!/[\u3400-\u9fff]/u.test(c);
 function matches(text,{business=false,week=0}={}){
  const out=[];pattern.lastIndex=0;let m;
  while((m=pattern.exec(text))){const name=m[0],start=m.index,end=start+name.length;
   if((/^[A-Za-z0-9]/.test(name)&&tokenChar(text[start-1]))||(/[A-Za-z0-9]$/.test(name)&&tokenChar(text[end])))continue;
   let row=aliases.get(name.toLowerCase().replace(/[ \t]+/g,' '));if(!row)continue;
   // Ordinary planning/reporting and a Python runtime environment are not RL concepts.
   if((name==='規劃'&&week!==13)||(name==='回報'&&week!==5)||name==='環境')continue;
   if(business&&(name==='敏感度'||name.toLowerCase()==='sensitivity'))row={id:'ipas-term-sensitivity-analysis'};
   if(name.toUpperCase()==='ROI')row={id:business?'ipas-term-roi-business':'d7t-roi'};
   out.push({start,end,id:row.id,text:name});
  }return out;
 }
 function href(id){const u=new URL(location.href);u.searchParams.set('term',id);u.hash='glossary';return u.pathname+u.search+u.hash;}
 function makeLink(doc,match){const a=doc.createElement('a');a.className='ipas-term-link';a.href=href(match.id);a.dataset.ipasTerm=match.id;a.textContent=match.text;a.title='開啟詞彙庫：'+(keywordCatalog.find(t=>t.id===match.id)?.zh||match.text);return a;}
 const excluded='a,button,input,select,textarea,pre,code,script,style,svg,math,.katex,.MathJax,.studio-code-card,[data-ipas-keywords],.ipas-quiz label,.ipas-quiz legend';
 function decorate(root){
  if(!root)return;
  const doc=root.ownerDocument||document;
  // Only touch explanatory regions; never alter formulas, runnable code or quiz controls.
  const regions=root.querySelectorAll('.ipas-slide,.ipas-guide article,.ipas-notes,.ipas-resource-module,.ipas-resource-example,.ipas-explain');
  const seen=new Set();
  for(const region of regions){const context=region.closest('.ipas-stage')?.querySelector('.eyebrow')?.textContent||'';
   const week=Number(context.match(/WEEK (\d+)/)?.[1]||0);
   const business=[14,16].includes(week)||region.textContent.includes('投資報酬率')||region.textContent.includes('Return on Investment');
   const walker=doc.createTreeWalker(region,4);const nodes=[];let node;while((node=walker.nextNode()))if(!node.parentElement?.closest(excluded)&&node.nodeValue.trim())nodes.push(node);
   for(const text of nodes){if(!text.isConnected||seen.has(text))continue;seen.add(text);const found=matches(text.nodeValue,{business,week});if(!found.length)continue;
    const fragment=doc.createDocumentFragment();let end=0;
    for(const match of found){fragment.append(doc.createTextNode(text.nodeValue.slice(end,match.start)),makeLink(doc,match));end=match.end;}
    fragment.append(doc.createTextNode(text.nodeValue.slice(end)));text.replaceWith(fragment);
   }
  }
 }
 let pendingURL=null;
 function openFromURL(){
  if(location.hash!=='#glossary')return;const u=new URL(location.href),id=u.searchParams.get('term');
  if(!id||pendingURL===id||!keywordCatalog.some(t=>t.id===id))return;
  pendingURL=id;requestAnimationFrame(()=>{pendingURL=null;if(location.hash!=='#glossary')return;openKeyword(id);u.searchParams.delete('term');history.replaceState(null,'',u.pathname+u.search+u.hash);});
 }
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-ipas-term]');if(!a||e.defaultPrevented||e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(!keywordCatalog.some(t=>t.id===a.dataset.ipasTerm))return;e.preventDefault();openKeyword(a.dataset.ipasTerm);
 });
 window.IPASGlossary={matches,decorate,openFromURL,added,reused,unresolvedAliases,details:detailById};
 window.IPASLifecycle?.register(()=>decorate(document.querySelector('.ipas-root')));
})();
