'use strict';
// Preserve attention term IDs; use the existing, tested numerical experiment.
(() => {
 const ids=new Set(['d9t1','d9t2']),prior=keywordExample,priorDef=keywordDefinitions;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const f=n=>Number(n.toFixed(5));
 for(const t of keywordCatalog)if(ids.has(t.id)){
  t.definition=t.id==='d9t2'?'由同一序列產生 Query、Key、Value，依匹配權重聚合可見位置的資訊，形成上下文化表示。':'以 Query 與 Key 的匹配程度決定權重，再聚合 Value 的資訊選擇機制；依來源可分 Self-Attention、Cross-Attention 等形式。';
  plainKeywordDefinitions[t.id]=t.id==='d9t2'?'讓每個詞元依需要讀取同一序列中其他可見位置的資訊。':'先決定要參考哪些資訊、各占多少權重，再把內容加權組合。';
 }
 keywordDefinitions=function(t){return ids.has(t.id)?'<div class="keyword-definition"><strong>白話說明</strong><p>'+esc(plainKeywordDefinitions[t.id])+'</p><strong>正式定義</strong><p>'+esc(t.definition)+'</p></div>':priorDef(t);};
 function table(headers,rows){return '<div class="transformer-table"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 const matrix=m=>table(['Query / 位置','位置 1','位置 2'],m.map((r,i)=>['位置 '+(i+1),...r.map(x=>Number.isFinite(x)?f(x):'−∞')]));
 const sec=(n,title,html)=>'<section class="keyword-section transformer-chapter"><h2>'+n+'. '+esc(title)+'</h2>'+html+'</section>';
 function eq(latex,reading){return '<div class="transformer-equation">'+(window.katex?window.katex.renderToString(latex,{output:'mathml',displayMode:true,throwOnError:true,trust:false}):'')+'</div><p>'+esc(reading)+'</p>';}
 function diagram(){return '<figure class="transformer-figure"><svg viewBox="0 0 600 300" role="img" aria-label="同一序列產生 Q K V；Q K 計算權重，再加權聚合 V"><title>Self-Attention 資訊流</title><g fill="#eee9ff" stroke="#7959cb"><rect x="180" y="5" width="240" height="40" rx="7"/><rect x="10" y="85" width="170" height="40" rx="7"/><rect x="215" y="85" width="170" height="40" rx="7"/><rect x="420" y="85" width="170" height="40" rx="7"/><rect x="50" y="165" width="340" height="40" rx="7"/><rect x="180" y="250" width="240" height="40" rx="7"/></g><g text-anchor="middle" fill="#24334b" font-size="14"><text x="300" y="31">同一序列的輸入 X</text><text x="95" y="111">Query：要找什麼</text><text x="300" y="111">Key：匹配線索</text><text x="505" y="111">Value：提供內容</text><text x="220" y="191">內積 → 縮放 / 遮罩 → Softmax</text><text x="300" y="276">權重 A × V → 新表示 O</text></g><g fill="none" stroke="#68718d" stroke-width="2"><path d="M240 45L95 85M300 45V85M360 45L505 85M95 125L140 165M300 125L300 165M220 205L260 250M505 125L385 250"/></g></svg><figcaption>連線表示資料流：Q 與 K 決定權重，最後聚合的是 V。</figcaption></figure>';}
 function lesson(t){
  const api=window.TransformerLesson,r=api.compute(),a=r.A[0][0],b=r.A[0][1];
  return '<div data-self-attention-lesson="'+esc(t.id)+'">'+[
   sec(1,t.id==='d9t1'?'注意力機制：用途與自注意力的定位':'Self-Attention：為何需要上下文？','<p>注意力機制把目前的需求與可提供的資訊比較，決定各來源的權重，再聚合內容。以下先理解通用流程，再完整計算同一序列內的 Self-Attention。</p><p>例如「小明把球交給小華，因為他要離開」，理解「他」需要參考周圍內容。這句本身有歧義，注意力能建立關聯，但不保證唯一判斷代詞指涉。</p>'),
   sec(2,'從單一詞元走向上下文化表示','<p>每個 Token 最初轉成向量，但它在句中的作用仍取決於其他位置。Self-Attention 讓每個位置直接讀取其他可見位置，更新自己的表示，而不是只看孤立詞語。</p><p>一次更新分為：提出查詢、比較線索、決定權重、聚合內容。模型用資料與訓練損失學習投影，不是由人逐條指定每個詞該看誰。</p>'),
   sec(3,'Self 是來源關係，不是只看自己',table(['機制','Query 來源','Key、Value 來源'],[['Self-Attention','目前序列','同一序列'],['Cross-Attention','一個序列','另一序列或資訊來源']])+'<p>沒有遮罩限制時，位置通常可讀取同序列所有位置，包括自己。因果遮罩決定可見性，Self／Cross 決定資訊來源，兩者不能混為一談。</p>'),
   sec(4,'Q、K、V 的意義與資料流',diagram()+table(['符號','英文','作用'],[['Q','Query','目前位置用來尋找資訊的條件表示'],['K','Key','供 Query 比較的匹配線索'],['V','Value','最後被加權聚合的內容']])+'<p>可比喻為找資料的條件、索引線索及實際內容，但三者都是數值向量，不是人工整理的關鍵字清單。Q 也不一定是一句使用者問題。</p>'),
   sec(5,'投影矩陣：同源為何還有三組向量？',eq('Q=XW^Q,\\quad K=XW^K,\\quad V=XW^V','輸入透過三組可學權重，得到三種用途的表示')+table(['符號','尺寸與意義'],[['X','n×d：n 個詞元，每個 d 維'],['WQ、WK','d×dₖ：Query 與 Key 的可學投影'],['WV','d×dᵥ：Value 的可學投影'],['Q、K','n×dₖ'],['V','n×dᵥ'],['dₖ、dᵥ','匹配向量與內容向量的維度']])+'<p>三組權重通常不同，因此 Q、K、V 通常不同。以下省略批次維度；多頭計算還有頭數維度。</p>'),
   sec(6,'核心公式與四個計算步驟',eq('S=\\frac{QK^T}{\\sqrt{d_k}}+M,\\quad A=\\operatorname{softmax}_{\\rm row}(S),\\quad O=AV','內積比較 → 縮放及遮罩 → 逐列 Softmax → 聚合 Value')+table(['項目','解釋'],[['T','轉置，讓 Q 的每列與 K 的每列比較'],['S、M','分數與加法遮罩；不可見項使用 −∞'],['Aᵢⱼ','Query 位置 i 對 Key 位置 j 的權重'],['O','n×dᵥ 的輸出表示']])+'<p>每列權重加總為 1，不是整張表加總為 1。Q 與 K 決定權重，V 才是被聚合的資訊。</p>'),
   sec(7,'完整算例一：先列清楚輸入與參數','<p>取兩個位置，d＝dₖ＝dᵥ＝2。X、WQ、WK 都是 [[1,0],[0,1]]，WV＝[[2,0],[0,1]]，因此：</p>'+table(['位置','Q','K','V'],[['1','[1,0]','[1,0]','[2,0]'],['2','[0,1]','[0,1]','[0,1]']])+'<p>這是指定權重的教學例，略去位置編碼且沒有訓練。一般模型的投影不是單位矩陣。</p>'),
   sec(8,'完整算例二：內積與縮放','<p>q₁·k₁＝1×1＋0×0＝1；q₁·k₂＝1×0＋0×1＝0。另一列同樣計算，QKT 得到單位矩陣；除以 √2 後：</p>'+matrix(r.scores)+'<p>內積是學到的表示空間中的匹配分數，不直接等同人類對語意的判斷。</p>'),
   sec(9,'完整算例三：Softmax 如何產生權重？',eq('A_{ij}=\\frac{\\exp(S_{ij})}{\\sum_{\\ell=1}^{n}\\exp(S_{i\\ell})}','同一 Query 的分數取指數，再除以該列總和')+'<p>i 為 Query 位置，j、ℓ 為 Key 位置；exp 是以 e 為底的指數。第一列 exp(0.70711)≈2.02811，exp(0)＝1；總和約 3.02811，權重約為 '+f(a)+' 與 '+f(b)+'。</p>'+matrix(r.A)+'<p>分數為 0 不表示權重為 0，因為 exp(0)＝1。實作可先減去該列最大分數，降低溢位風險，且不改變 Softmax 結果。</p>'),
   sec(10,'完整算例四：用權重聚合 Value','<p>第一個位置 o₁＝'+f(a)+'×[2,0]＋'+f(b)+'×[0,1]＝['+f(r.O[0][0])+','+f(r.O[0][1])+']。另一列用自己的權重，完整輸出為：</p>'+matrix(r.O)+'<p>每個位置得到結合可見上下文的新向量。它還不是中文詞語或最終答案，後續可接殘差、LayerNorm、FFN 及任務輸出頭。</p>'),
   sec(11,'為什麼除以 √dₖ？','<p>內積加總多個分量乘積，維度增加可能使分數尺度變大。在分量近似獨立、均值 0、變異 1 的假設下，內積變異隨 dₖ 成長；除以 √dₖ 有助控制尺度。</p><p>例如 Softmax([10,0])≈[0.99995,0.00005]，已非常尖銳，部分梯度也可能很小。縮放不是讓權重和變成 1；後者是 Softmax 的結果。上述分布假設是設計動機，不表示所有資料都嚴格符合。</p>'),
   sec(12,'因果遮罩：不能偷看尚未生成的內容','<p>兩個位置的加法遮罩 M＝[[0,−∞],[0,0]]，必須加在 Softmax 前。第一列變成 [0.70711,−∞]，權重為 [1,0]，輸出便是 [2,0]。第二個位置可讀取位置 1 與 2。</p>'+matrix(api.compute({causal:true}).A)+'<p>Softmax 後只把一項清零卻不重新正規化，不是同樣運算。Padding 遮罩則排除填補位置；若整列都被遮住，必須另外處理，不能當成正常 Softmax。</p>'),
   sec(13,'逐步互動：Query、尺度與遮罩',api.interactive()),
   sec(14,'Multi-Head：在不同表示空間建立關聯',eq('H_r=\\operatorname{Attention}(XW_r^Q,XW_r^K,XW_r^V),\\quad Y=\\operatorname{Concat}(H_1,\\ldots,H_h)W^O','各頭獨立投影與聚合，串接後映回模型維度')+'<p>h 是頭數，r 是頭編號。Hᵣ 尺寸 n×dᵥ，串接為 n×(h dᵥ)，WO 為 (h dᵥ)×d，Y 為 n×d。例如兩頭各輸出 2 欄，串接便是 4 欄。不同頭可能學到不同關聯，但不能保證某頭專門處理語法或情緒。</p>'),
   sec(15,'位置資訊與 Transformer 裡的角色','<p>僅依內容做全域 Self-Attention，不能單靠它區分相同詞元的排列。模型通常另加位置嵌入、相對位置或 RoPE；因果遮罩提供可見性限制，不等於所有位置資訊。</p>'+table(['元件','負責工作'],[['位置資訊','順序與相對位置'],['Attention','跨位置交換資訊'],['Residual','保留原表示並加入更新'],['LayerNorm','調整每個位置的特徵尺度'],['FFN','在各位置做非線性特徵轉換']])+'<p>Attention 是 Transformer 的子模組，不能用一個注意力公式取代整個架構。</p><button type="button" data-learn-keyword="d9t0">閱讀 Transformer 完整架構</button>'),
   sec(16,'應用、成本與常見誤解','<ul><li>可用於語言理解、序列表示、影像區塊或其他適當編碼的序列。</li><li>高權重不是因果證明、來源可靠性或答案正確率。</li><li>密集 Self-Attention 每頭分數矩陣有 n² 個元素。長度加倍，元素數變四倍，但整個模型耗時不必恰好四倍。</li><li>訓練能平行處理已知序列，不代表自回歸生成時能一次知道全部未來詞元。</li><li>局部、稀疏等變體會限制可見位置，不能全部當成全域兩兩互動。</li></ul>'),
   sec(17,'CPU Python：核對手算與因果遮罩','<p>使用 Python 標準函式庫，不需 GPU 或模型下載。先執行 causal=False，再改為 True，確認第一列權重變成 [1,0]、輸出變成 [2,0]。</p><pre><code class="language-python">'+esc(api.pyAttention)+'</code></pre>'),
   sec(18,'自我檢核與參考資料',[
    ['Q、K 與 V 各負責什麼？','Q 與 K 決定匹配分數及權重；V 提供被聚合內容。'],
    ['分數為零，權重也為零嗎？','不是。exp(0)＝1；未被遮住的位置通常仍有正權重。'],
    ['Self 是否表示只能看自己？','不是，指 Q、K、V 來自同一序列；可見範圍另由遮罩等設計決定。'],
    ['本例第一個位置的輸出是多少？','無遮罩約 [1.33952,0.33024]；有因果遮罩時為 [2,0]。']
   ].map(([q,a])=>'<p><strong>'+esc(q)+'</strong></p><details><summary>展開答案與理由</summary><p>'+esc(a)+'</p></details>').join('')+'<p><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer">Attention Is All You Need 原始論文</a></p><p><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html" target="_blank" rel="noopener noreferrer">PyTorch MultiheadAttention 官方文件</a></p>')
  ].join('')+'</div>';
 }
 keywordExample=function(t,p){return ids.has(t.id)?lesson(t):prior(t,p);};
 window.SelfAttentionLesson={ids,lesson};
})();
