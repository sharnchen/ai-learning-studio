'use strict';
// Dedicated Transformer chapter. Keep the existing term ID and learning records.
(() => {
 const id='d9t0',previousExample=keywordExample,previousRender=renderKeyword,previousDefinitions=keywordDefinitions;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const round=n=>Number(n.toFixed(5));
 const term=keywordCatalog.find(t=>t.id===id);
 if(term){term.definition='Transformer 以注意力在序列位置間交換資訊，結合位置表示、逐位置前饋網路、殘差及正規化建立可堆疊的序列模型；Encoder、Decoder 與遮罩配置依任務而異。';plainKeywordDefinitions[id]='讓每個詞元依需要讀取其他可見詞元的資訊，再以可堆疊區塊形成序列表示。';}
 keywordDefinitions=function(t){if(t.id!==id)return previousDefinitions(t);return '<div class="keyword-definition"><strong>白話說明</strong><p>'+esc(plainKeywordDefinitions[id])+'</p><strong>正式定義</strong><p>'+esc(t.definition)+'</p></div>';};
 const equations={
  embedding:String.raw`X_{p,:}=E_{t_p,:}+P_{p,:}`,
  position:String.raw`P_{p,2i}=\sin(p/10000^{2i/d}),\quad P_{p,2i+1}=\cos(p/10000^{2i/d})`,
  qkv:String.raw`Q=XW^Q,\quad K=XW^K,\quad V=XW^V`,
  attention:String.raw`S=\frac{QK^T}{\sqrt{d_k}}+M,\quad A_{ij}=\frac{\exp(S_{ij})}{\sum_{\ell=1}^{n_k}\exp(S_{i\ell})},\quad O=AV`,
  multi:String.raw`H_r=\operatorname{Attention}(XW_r^Q,XW_r^K,XW_r^V),\quad Y=\operatorname{Concat}(H_1,\ldots,H_h)W^O`,
  residual:String.raw`R=X+F(X)`,
  norm:String.raw`\mu_i=\frac1d\sum_{j=1}^dR_{ij},\quad \sigma_i^2=\frac1d\sum_{j=1}^d(R_{ij}-\mu_i)^2`,
  normout:String.raw`\operatorname{LN}(R)_{ij}=\gamma_j\frac{R_{ij}-\mu_i}{\sqrt{\sigma_i^2+\epsilon}}+\beta_j`,
  postnorm:String.raw`U=\operatorname{LN}(X+\operatorname{MHA}(X)),\quad Z=\operatorname{LN}(U+\operatorname{FFN}(U))`,
  prenorm:String.raw`U=X+\operatorname{MHA}(\operatorname{LN}(X)),\quad Z=U+\operatorname{FFN}(\operatorname{LN}(U))`,
  ffn:String.raw`\operatorname{FFN}(u)=\operatorname{ReLU}(uW_1+b_1)W_2+b_2`,
  loss:String.raw`L=-\frac1T\sum_{t=1}^{T}\log p_\theta(y_t\mid y_{<t},x)`,
  output:String.raw`\ell=zW_{\rm vocab}+b_{\rm vocab},\quad p=\operatorname{softmax}(\ell)`,
  complexity:String.raw`\operatorname{cost}\sim O(n^2d+nd^2),\qquad \operatorname{attention\ scores}\in\mathbb R^{n\times n}`
 };
 function eq(name,reading){const latex=equations[name];let html='';if(window.katex){html=window.katex.renderToString(latex,{displayMode:true,output:'mathml',throwOnError:true,trust:false});}return '<div class="transformer-equation">'+html+'</div><p class="transformer-equation-reading">'+esc(reading)+'</p>';}
 function table(headers,rows){return '<div class="transformer-table"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 const matrix=m=>table(['列 / 位置',...m[0].map((_,i)=>'第 '+(i+1)+' 欄')],m.map((r,i)=>['位置 '+(i+1),...r.map(x=>Number.isFinite(x)?round(x):'−∞')]));
 const section=(n,title,html)=>'<section class="keyword-section transformer-chapter"><h2>'+n+'. '+esc(title)+'</h2>'+html+'</section>';
 function softmax(values){const max=Math.max(...values);if(!Number.isFinite(max))throw Error('至少須保留一個可讀取位置');const exp=values.map(x=>Number.isFinite(x)?Math.exp(x-max):0),sum=exp.reduce((a,b)=>a+b,0);return exp.map(x=>x/sum);}
 function compute({q1=1,q2=0,scaled=true,causal=false}={}){
  if(!Number.isFinite(q1)||!Number.isFinite(q2)||Math.abs(q1)>8||Math.abs(q2)>8)throw Error('Query 分量須介於 −8 與 8');
  const Q=[[q1,q2],[0,1]],K=[[1,0],[0,1]],V=[[2,0],[0,1]],divisor=scaled?Math.sqrt(2):1;
  const dot=Q.map(q=>K.map(k=>q.reduce((sum,x,i)=>sum+x*k[i],0)));
  const scores=dot.map(row=>row.map(x=>x/divisor));
  const masked=scores.map((row,i)=>row.map((x,j)=>causal&&j>i?-Infinity:x));
  const A=masked.map(softmax),O=A.map(row=>[0,1].map(j=>row.reduce((s,a,k)=>s+a*V[k][j],0)));
  return {Q,K,V,dot,scores,masked,A,O};
 }
 function layerNorm(row,epsilon=1e-5){const mean=row.reduce((s,x)=>s+x,0)/row.length,variance=row.reduce((s,x)=>s+(x-mean)**2,0)/row.length;return {mean,variance,values:row.map(x=>(x-mean)/Math.sqrt(variance+epsilon))};}
 const box=(x,y,w,label,kind='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="42" rx="8" class="transformer-box '+kind+'"/><text x="'+(x+w/2)+'" y="'+(y+26)+'" text-anchor="middle">'+esc(label)+'</text>';
 const arrow=(x,y,toX,toY)=>{const a=Math.atan2(toY-y,toX-x),u=toX-8*Math.cos(a-.5),v=toY-8*Math.sin(a-.5),w=toX-8*Math.cos(a+.5),z=toY-8*Math.sin(a+.5);return '<path class="transformer-edge" d="M'+x+' '+y+'L'+toX+' '+toY+' M'+u+' '+v+'L'+toX+' '+toY+'L'+w+' '+z+'"/>';};
 function architecture(){return '<figure class="transformer-figure"><svg viewBox="0 0 720 540" role="img" aria-label="原始 Encoder Decoder 架構：來源經 Encoder 輸出記憶，目標前綴經遮罩注意力，並透過交叉注意力讀取來源表示"><title>Encoder–Decoder 的資訊流</title>'+box(20,15,300,'來源 Token + 位置表示')+box(20,95,300,'Encoder：Self-Attention')+box(20,175,300,'Encoder：FFN')+box(20,255,300,'來源表示 Z（可重用）','output')+arrow(170,57,170,95)+arrow(170,137,170,175)+arrow(170,217,170,255)+box(400,15,300,'右移的目標前綴 + 位置')+box(400,95,300,'Decoder：Masked Self-Attention')+box(400,255,300,'Cross-Attention：Q 讀取 K、V')+box(400,335,300,'Decoder：FFN')+box(400,415,300,'Linear + Softmax → 下一詞元','output')+arrow(550,57,550,95)+arrow(550,137,550,255)+arrow(320,276,400,276)+arrow(550,297,550,335)+arrow(550,377,550,415)+'<text x="340" y="258">K、V</text><text x="570" y="205">Q</text><text x="30" y="342">兩側區塊可各自重複 N 層</text><text x="30" y="375">每個子層另有 Residual 與 LayerNorm</text><text x="30" y="505">示意省略 Dropout；Decoder 的輸出再供下一個生成步驟使用。</text></svg><figcaption>左側處理來源；右側處理已知目標前綴。右側不能偷看尚未生成的詞元。</figcaption></figure>';}
 function attentionDiagram(){return '<figure class="transformer-figure"><svg viewBox="0 0 700 330" role="img" aria-label="X 經不同權重產生 Q K V；Q 與 K 計算分數，縮放加遮罩後 Softmax，最後加權 V"><title>一個 Attention Head 的資料流</title>'+box(210,10,280,'輸入 X')+box(30,85,160,'Q = X WQ')+box(260,85,160,'K = X WK')+box(490,85,160,'V = X WV')+arrow(270,52,110,85)+arrow(350,52,340,85)+arrow(430,52,570,85)+box(80,170,340,'Q KT → 縮放 → Mask → Softmax')+arrow(110,127,160,170)+arrow(340,127,340,170)+box(210,260,280,'注意力權重 A × V = O','output')+arrow(250,212,300,260)+arrow(570,127,430,260)+'</svg><figcaption>Q 決定要找什麼；K 提供匹配線索；V 提供被加權搬過來的內容。這是用途比喻，三者皆為數值向量。</figcaption></figure>';}
 const pyAttention=String.raw`import math

Q = [[1.0, 0.0], [0.0, 1.0]]
K = [[1.0, 0.0], [0.0, 1.0]]
V = [[2.0, 0.0], [0.0, 1.0]]
causal = False  # 改為 True，第一個位置就不能讀第二個位置
scores = [[sum(a*b for a, b in zip(q, k))/math.sqrt(2)
           for k in K] for q in Q]
weights = []
for i, row in enumerate(scores):
    visible = [s if not causal or j <= i else -math.inf
               for j, s in enumerate(row)]
    peak = max(visible)
    exps = [math.exp(s-peak) for s in visible]
    weights.append([e/sum(exps) for e in exps])
out = [[sum(weights[i][k]*V[k][j] for k in range(2))
        for j in range(2)] for i in range(2)]
print("Attention weights:", weights)
print("Output:", out)
assert all(abs(sum(row)-1) < 1e-9 for row in weights)
if causal:
    assert weights[0][1] == 0
    assert out[0] == [2.0, 0.0]`;
 const pyBlock=String.raw`import torch
from torch import nn

torch.manual_seed(7)
# CPU 即可。這裡直接提供兩個位置、每個四維的數值表示。
x = torch.tensor([[[1., 0., 0., 0.], [0., 1., 0., 0.]]])
layer = nn.TransformerEncoderLayer(
    d_model=4, nhead=2, dim_feedforward=8,
    dropout=0.0, batch_first=True, norm_first=False)
encoder = nn.TransformerEncoder(layer, num_layers=1)
encoder.eval()
with torch.no_grad():
    y = encoder(x)
print("Input shape:", tuple(x.shape))
print("Output shape:", tuple(y.shape))
print(y)
assert y.shape == (1, 2, 4)
# 此例沒有 tokenizer、位置編碼與輸出分類頭，也沒有訓練。
# 隨機初始化的參數不同於手算例的指定矩陣。`;
 function code(text){return '<pre><code class="language-python">'+esc(text)+'</code></pre>';}
 function interactive(){return '<div class="transformer-demo" data-transformer-demo data-stage="0"><div class="transformer-controls"><label>投影後第 1 個 Query：q₁ <input type="range" min="-4" max="4" step="0.25" value="1" data-transformer-control="q1"><output data-transformer-q1>1</output></label><label>投影後第 1 個 Query：q₂ <input type="range" min="-4" max="4" step="0.25" value="0" data-transformer-control="q2"><output data-transformer-q2>0</output></label><label><input type="checkbox" checked data-transformer-control="scaled"> 除以 √dₖ（此例 dₖ＝2）</label><label><input type="checkbox" data-transformer-control="causal"> 啟用因果遮罩</label><button type="button" data-transformer-reset>還原手算設定</button></div><p>只調整投影後第 1 列 Q，K、V 固定。這是在觀察 Attention 機制，沒有重新訓練投影矩陣。</p><div class="transformer-stage-nav"><button type="button" data-transformer-back>上一步</button><span data-transformer-stage-label></span><button type="button" data-transformer-next>下一步</button></div><div data-transformer-stage-view></div><h3>注意力權重熱圖</h3><div data-transformer-heatmap></div><p>每列代表一個 Query，每欄代表被讀取的 Key 位置；顏色越深表示權重越大。每列加總為 1，並非整張表加總為 1。</p><h3>最終加權輸出 O</h3><div data-transformer-output aria-live="polite"></div><p data-transformer-observation></p></div>';}
 function lesson(){const r=compute(),a=r.A[0][0],b=r.A[0][1],R=r.O.map((row,i)=>row.map((x,j)=>x+(i===j?1:0))),LN=R.map(row=>layerNorm(row)),FF=LN.map(row=>row.values.map(x=>Math.max(0,x))),RF=LN.map((row,i)=>row.values.map((x,j)=>x+FF[i][j])),Z=RF.map(row=>layerNorm(row).values);
 const quizzes=[
 ['Transformer 為何通常需要位置資訊？','沒有位置或順序機制的全域 Self-Attention 無法單靠內容分辨相同詞元的排列；因果遮罩提供可見性順序，但不是所有位置資訊的替代。'],
 ['第 1 個位置啟用因果遮罩後，對第 2 個位置權重是多少？','0。該分數在 Softmax 前設為負無限大；第 1 個位置仍可讀自己，所以本例輸出為 (2,0)。'],
 ['Attention 的權重 A 應與 Q、K 還是 V 相乘？','V。Q 與 K 用來計算匹配權重，V 才是被加權聚合的內容。'],
 ['訓練能平行計算所有位置，是否表示自回歸生成也能一次得到全部未來詞元？','否。訓練已提供右移的目標前綴並用遮罩避免洩漏；生成時下一個詞元仍依賴先前已選出的結果。'],
 ['把長度從 100 改為 200，稠密注意力分數矩陣有多少元素？','從 10000 變成 40000，是四倍；整個模型總耗時不必然恰好四倍。'],
 ['注意力分數高是否能證明因果關係或保證回答正確？','不能。它是該層該頭的資訊加權，不等於因果證明、來源可靠性或答案正確率。']
 ];
 return '<div class="transformer-lesson" data-transformer-lesson>'+[
 section(1,'學習問題：為何需要 Transformer？','<p>閱讀「小明把球交給小華，因為他要離開」時，系統需要結合不同位置判斷「他」可能指誰。序列模型不只辨識單詞，還要建立跨位置的關係。</p><p>RNN 依前一隱藏狀態逐步更新，序列內存在逐時依賴。Transformer 的關鍵改變是讓一個位置直接讀取其他可見位置的表示；再搭配前饋網路等元件，形成可堆疊模型。2017 年提出的原始模型以機器翻譯為主要任務。</p>'),
 section(2,'與 RNN、CNN 的思路比較',table(['方法','資訊如何移動','需要注意'],[['RNN','循環狀態依時間逐步傳遞','長序列的資訊路徑及梯度問題；LSTM 等方法改善但不消除所有限制'],['CNN','卷積先聚合局部鄰域，堆疊擴大感受野','適合局部結構；連接遠距位置通常需要多層或其他設計'],['Transformer','注意力在一層中連接可見位置','通常需位置資訊；稠密全域注意力的序列長度成本較高']])+'<p>比較的是資訊路徑，不是宣稱某一種模型在所有任務都較好。Transformer 也可與卷積或循環元件結合。</p>'),
 section(3,'先辨識架構中的模組與名詞',table(['名詞','在系統中的工作'],[['Token / Embedding','先分詞，再查表取得每個位置的數值向量'],['Position','加入位置或相對順序資訊'],['Attention','在可見位置間依權重交換資訊'],['FFN','在每個位置對特徵做非線性轉換'],['Residual / LayerNorm','保留更新路徑並控制特徵尺度'],['輸出頭','依任務把表示轉為詞彙分數、類別或其他輸出']])+'<p>Self-Attention 是 Transformer 的一個子模組，不是完整架構的全部。</p>'),
 section(4,'Encoder–Decoder 整體架構與資料流',architecture()+'<p>圖中的 N 是區塊重複層數。Encoder 將來源序列轉成表示；Decoder 將已知目標前綴轉成下一詞元分布。交叉注意力讓 Decoder 讀取 Encoder 的輸出。現代模型也可能只採其中一側。</p>'),
 section(5,'輸入表示、維度與參數',eq('embedding','每個位置的輸入表示＝詞元嵌入＋位置表示')+table(['符號','尺寸或意義'],[['B','批次大小；後續手算略去批次維度'],['n、d','序列長度及模型特徵維度 d_model'],['tₚ、p','第 p 個位置的 token ID 及位置索引'],['E、P、X','詞嵌入表、位置表示及 n×d 輸入表示'],['θ','所有可學參數的統稱；查表與矩陣乘法仍會傳遞梯度']])+'<p>位置不是另一個 token ID。不同模型的分詞器與嵌入表必須相容；同一數字 ID 在不同模型不一定表示相同內容。</p>'),
 section(6,'位置編碼：如何知道順序？',eq('position','原始正弦位置編碼在偶數及奇數分量使用 sin 與 cos')+'<p>p 從 0 起算；i 是成對維度的編號；d 是偶數模型維度；10000 是原方法設定的尺度基數。p＝0 時每一對為 (0,1)。當 d＝2、p＝1，該對為 (sin1,cos1)≈(0.84147,0.54030)。</p><p>這只是位置編碼的一種方法。可學習的位置嵌入、相對位置與 RoPE 採不同設計，不能把所有 Transformer 都當成只做 E＋P。</p>'),
 section(7,'Q、K、V 的來源與意義',attentionDiagram()+eq('qkv','同一輸入經三組可學矩陣，得到查詢、鍵及值')+table(['矩陣','尺寸','作用'],[['WQ、WK','d×dₖ','建立用來比較關係的 Query 與 Key'],['WV','d×dᵥ','建立要傳遞的內容'],['Q、K','n×dₖ','每列對應一個序列位置'],['V','n×dᵥ','每列是該位置可被聚合的內容']])+'<p>dₖ、dᵥ 分別是每頭 Key／Query 與 Value 維度。三組權重通常不同；Q 不是使用者問題的文字，K 也不是字典索引。</p>'),
 section(8,'Attention 公式：每一個步驟在做什麼？',eq('attention','先算匹配分數，縮放加遮罩，逐列 Softmax，再加權 V')+table(['符號','意義'],[['T','轉置；讓 Q 的各列與 K 的各列做內積'],['S、M','縮放後分數與加法遮罩；不可見項為 −∞'],['Aᵢⱼ','第 i 個 Query 對第 j 個 Key 的權重'],['nₖ、ℓ','Key 的數量及列內加總索引'],['exp','以自然常數 e 為底的指數函數'],['O','n×dᵥ 的加權輸出']])+'<p>若分量近似獨立且變異為 1，dₖ 個乘積相加的變異會隨維度變大；除以 √dₖ 有助控制分數尺度，避免 Softmax 過早過度尖銳。這是建模假設下的動機，不是每份真實資料都嚴格符合。</p>'),
 section(9,'完整手算一：指定輸入與投影矩陣','<p>採單一 head、兩個位置、d＝dₖ＝dᵥ＝2，略去位置、Dropout 及批次。這組指定權重只為手算，並非訓練完成的語言模型。</p>'+table(['項目','指定值'],[['X、WQ、WK','[[1,0],[0,1]]，三者在此例皆為單位矩陣'],['WV','[[2,0],[0,1]]'],['Q＝XWQ、K＝XWK','[[1,0],[0,1]]'],['V＝XWV','[[2,0],[0,1]]']])+'<p>請先用矩陣乘法核對 Q、K、V，才能進入相似度計算；實際模型的三組投影通常不相同。</p>'),
 section(10,'完整手算二：分數、縮放與 Softmax','<p>QKT＝單位矩陣，除以 √2 後，對角線分數為 0.70711，其餘為 0。此處先不加因果遮罩。</p>'+matrix(r.scores)+'<p>第 1 列先算 exp(0.70711)≈2.02811、exp(0)＝1，總和約 3.02811。權重分別為 2.02811/3.02811≈'+round(a)+' 與 1/3.02811≈'+round(b)+'。第 2 列對調。</p>'+matrix(r.A)+'<p>權重是對每列可見位置的相對分配；用減去該列最大值再取指數，可得到同樣結果並降低溢位風險。</p>'),
 section(11,'完整手算三：權重如何變成輸出？','<p>第 1 個輸出＝'+round(a)+'×(2,0)＋'+round(b)+'×(0,1)＝('+round(r.O[0][0])+','+round(r.O[0][1])+')。第 2 個位置同樣用自己的那一列權重聚合 V。</p>'+matrix(r.O)+'<p>這裡得到的是注意力子層表示，尚未加殘差、正規化、FFN，也還不是中文詞語或最終答案。</p>'),
 section(12,'逐步互動：自己改變 Query 與遮罩',interactive()),
 section(13,'Multi-Head：多個表示空間如何合併？',eq('multi','各頭獨立投影及聚合，串接後再用輸出矩陣混合')+table(['符號','尺寸或意義'],[['h、r','注意力頭數及目前頭編號'],['Hᵣ','n×dᵥ，每頭的輸出'],['Concat(H₁,…,Hₕ)','沿特徵維串接，得到 n×(h dᵥ)'],['WO','(h dᵥ)×d，映回模型維度'],['Y','n×d 的多頭注意力輸出']])+'<p>例如 d＝4、h＝2、每頭 dₖ＝dᵥ＝2，各頭輸出 2 欄，串接為 4 欄，再乘 4×4 的 WO。各頭有機會學到不同關係，但不是預先指定「第一頭語法、第二頭語意」。</p>'),
 section(14,'Residual 與 LayerNorm：為何不直接覆蓋輸入？',eq('residual','子層產生更新量，與原表示相加')+eq('norm','在同一位置的特徵維度內計算平均與變異')+eq('normout','先標準化，再以可學縮放及偏移調整')+table(['符號','意義'],[['F(X)','目前子層的輸出，尺寸須與 X 可相加'],['μᵢ、σᵢ²','第 i 個位置、d 個特徵的平均與母體變異'],['ε','避免分母為零的小正數'],['γⱼ、βⱼ','第 j 個特徵的可學縮放與偏移']])+'<p>殘差保留原表示的直接通路，子層可以學習更新量，也提供較直接的梯度路徑；這不保證完全沒有梯度問題。LayerNorm 調整每個位置的特徵尺度，幫助堆疊子層穩定運作。LayerNorm 通常不把不同 token 或不同樣本混成同一組統計量，這點與常見 BatchNorm 的統計方式不同。</p>'),
 section(15,'FFN：每個位置上的非線性轉換',eq('ffn','先升維及非線性轉換，再投影回模型維度')+table(['符號','尺寸或意義'],[['u','單一位置的 1×d 表示'],['W₁、b₁','d×d_ff 與 d_ff 維偏置'],['W₂、b₂','d_ff×d 與 d 維偏置'],['ReLU','逐元素取 max(0,z)；原始 Transformer 的選擇']])+'<p>Attention 著重跨位置混合，FFN 則讓各位置重新組合與轉換特徵。FFN 中的非線性很重要：若僅將兩個線性層相接，中間沒有激活函數，便可合併成單一仿射轉換。同一層所有位置共用這組 FFN 參數，但各位置分別計算；跨位置交換主要由 Attention 完成。現代模型也常用 GELU 或閘控 FFN 等變體。</p>'),
 section(16,'把子層串回完整 Encoder Block',eq('postnorm','原始 Post-Norm：每次殘差相加後做 LayerNorm')+eq('prenorm','常見 Pre-Norm：先做 LayerNorm，再送入子層')+'<p>U 為注意力子層後的表示，Z 為整個區塊輸出。下列接續第 11 節手算：把 Attention 輸出與原始 X 相加得到 R。</p>'+matrix(R)+'<p>指定 ε＝0.00001、γ＝1、β＝0，逐列 LayerNorm 的 U 約為：</p>'+matrix(LN.map(row=>row.values))+'<p>再示範 W₁＝W₂＝單位矩陣、b₁＝b₂＝0、d_ff＝2：FFN 只保留 U 的正分量；接著計算 U＋FFN(U)，最後再做 LayerNorm 才得到 Z。</p>'+table(['階段','第 1 個位置','第 2 個位置'],[['FFN(U)',FF[0].map(round).join(', '),FF[1].map(round).join(', ')],['U＋FFN(U)',RF[0].map(round).join(', '),RF[1].map(round).join(', ')],['最終 Z',Z[0].map(round).join(', '),Z[1].map(round).join(', ')]])+'<p>這組兩維、指定權重的簡化只用來核對連接順序，不能代替一般模型的表現分析；兩維 LayerNorm 的示意也容易產生近似 ±1 的結果。</p><p>Post-Norm 與 Pre-Norm 的次序不同，公式不可混用。此處略去 Dropout；原始結構還包含訓練時的 Dropout。</p>'),
 section(17,'Decoder 遮罩與 Cross-Attention','<p>因果遮罩阻止位置 i 讀取 j&gt;i 的未來位置。本例的加法遮罩為 [[0,−∞],[0,0]]，加在 Softmax 前；第 1 列因此變成權重 (1,0)，輸出 (2,0)。Padding 遮罩則排除填補位置，目的不同。</p><p>Cross-Attention 中，Q 來自 Decoder 目前表示，K、V 來自 Encoder 輸出。兩邊長度可以不同：分數矩陣尺寸是目標長度×來源長度。</p><p>所有 Key 都被遮住會讓 Softmax 無有效分母，不能把此情況當成正常輸出。不同 API 的布林遮罩可能有不同約定，需查該函式文件。</p>'),
 section(18,'Encoder-only、Decoder-only 與完整雙側架構',table(['配置','常見用途','主要資訊流'],[['Encoder-only（例如 BERT 類）','理解、分類、抽取或表示學習','可雙向讀取可見輸入；通常不直接做完整聊天生成'],['Decoder-only（例如 GPT 類）','自回歸文字生成','以因果 Self-Attention 讀取前綴；不一定有 Encoder 或 Cross-Attention'],['Encoder–Decoder','翻譯、摘要等條件生成','Encoder 處理來源，Decoder 逐步生成並讀取來源表示']])+'<p>這些是典型配置；具體產品可能加入額外模組或改變訓練方式。</p>'),
 section(19,'訓練：答案如何變成學習訊號？',eq('loss','以目標詞元的負對數機率作為條件生成訓練損失')+'<p>T 是有效目標詞元數，yₜ 是第 t 個正確目標，y&lt;ₜ 是前綴，x 是來源，θ 為可學參數，log 採自然對數。Decoder-only 不一定另有來源 x。</p><p>目標「我 喜歡 AI EOS」的訓練輸入右移為「BOS 我 喜歡 AI」。這種訓練時提供正確前綴的方式常稱 Teacher Forcing。所有位置可平行計算，但因果遮罩禁止偷看右側答案；之後反向傳播，更新嵌入、投影、FFN 及其他可學參數。Padding 通常不計入有效損失。</p>'),
 section(20,'推論：表示如何成為下一個詞元？',eq('output','把最後位置表示投影為詞彙 logits，再轉為候選分布')+'<p>z 為 1×d 最後位置表示；W_vocab 為 d×詞彙數的輸出矩陣；b_vocab 為詞彙偏置；ℓ 是 logits，p 是機率。選出下一詞元後附加到前綴，再重複到 EOS 或預算上限。</p><p>Prefill 先處理提示；Decode 逐步生成。KV Cache 重用各層歷史 Key、Value，減少重算，但仍占用記憶體，也不會讓未來詞元同時已知。Temperature 等取樣參數改變選詞，不等於重新訓練模型。</p>'),
 section(21,'效能與限制：長序列為何昂貴？',eq('complexity','一般稠密 Self-Attention 的計算包含兩兩互動及線性投影')+'<p>n 為序列長度、d 為模型維度，O 表示成長階數，省略常數與固定頭數。n 從 100 增至 200，單頭分數由 10000 增至 40000 個元素；整體模型耗時不必恰好四倍。</p><p>FlashAttention 等可避免完整寫回注意力矩陣，改善記憶體與執行效率，但不代表所有密集互動的算術成本都消失。長上下文也不保證能可靠取用其中每一段資訊。</p>'),
 section(22,'Python 手算驗證：CPU 即可','<p>使用 Python 標準函式庫重現第 9–11 節；不需 GPU 或模型下載。預設輸出權重約 [[0.66976,0.33024],[0.33024,0.66976]]，輸出約 [[1.33952,0.33024],[0.66048,0.66976]]。將 causal 改為 True 再比較。</p>'+code(pyAttention)),
 section(23,'PyTorch 實作：一層 Encoder 的尺寸檢查','<p>此例使用 CPU，需已安裝 PyTorch。batch_first=True 的順序為 B×n×d。它示範完整 Encoder 子層的連接，並未建立 tokenizer、位置編碼、任務輸出頭或訓練流程；不可當成已會翻譯的模型。</p>'+code(pyBlock)),
 section(24,'應用與容易混淆的地方','<ul><li>文字：依架構與訓練任務，可做分類、翻譯、生成及檢索表示。</li><li>視覺：ViT 把影像區塊轉成序列；不是將原始大圖無條件直接當文字。</li><li>多模態：需要相容編碼器與跨模態訓練，不能只因都叫 Transformer 就混用表示。</li><li>Attention 高權重不等於因果關係，生成流暢也不代表查證正確。</li><li>長序列、資料偏見、幻覺、授權及推論成本仍需獨立驗收。</li></ul>'),
 section(25,'自我測驗：先回答，再核對理由',quizzes.map(([q,a])=>'<div class="transformer-question"><p><strong>'+esc(q)+'</strong></p><details><summary>展開答案與解釋</summary><p>'+esc(a)+'</p></details></div>').join('')),
 section(26,'學習檢核、相關詞條與參考資料','<p>能從 X 的尺寸開始，寫出 Q、K、V、A、O 的尺寸；算出一列 Softmax；解釋遮罩改變了什麼；再把殘差、LayerNorm、FFN 接回整個區塊，才算掌握這一章的基本邏輯。</p><div class="glossary-related">'+['d8t13','d9t1','d9t2','d9t3','d9t4','d9t15','d9t20'].map(key=>keywordCatalog.find(t=>t.id===key)).filter(Boolean).map(t=>'<button type="button" data-learn-keyword="'+esc(t.id)+'">'+esc(t.zh)+'</button>').join('')+'</div><ul><li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer">Vaswani 等，Attention Is All You Need（2017）</a></li><li><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.Transformer.html" target="_blank" rel="noopener noreferrer">PyTorch Transformer 官方介面</a></li><li><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html" target="_blank" rel="noopener noreferrer">PyTorch MultiheadAttention 官方介面</a></li></ul>')
 ].join('')+'</div>';
 }
 function paint(host){const get=k=>host.querySelector('[data-transformer-control="'+k+'"]'),r=compute({q1:Number(get('q1').value),q2:Number(get('q2').value),scaled:get('scaled').checked,causal:get('causal').checked});
  host.querySelector('[data-transformer-q1]').textContent=get('q1').value;host.querySelector('[data-transformer-q2]').textContent=get('q2').value;
  const stages=[['1 / 6・投影後的 Query Q',r.Q,'本實驗已提供投影結果，K 為單位矩陣，V 為 [[2,0],[0,1]]。'],['2 / 6・Q 與 K 的點積',r.dot,'每個 Query 都與每個可比較 Key 做內積；此時尚未縮放。'],['3 / 6・分數縮放',r.scores,get('scaled').checked?'已除以 √2。':'目前未縮放，觀察權重是否更尖銳。'],['4 / 6・加入可見性遮罩',r.masked,get('causal').checked?'第 1 列不能讀第 2 欄，該分數為 −∞。':'目前兩個位置都可互相讀取。'],['5 / 6・逐列 Softmax',r.A,'每列獨立正規化為權重，總和為 1。'],['6 / 6・加權 Value',r.O,'第 1 分量是對 Value (2,0) 的權重乘 2；第 2 分量是對 Value (0,1) 的權重。']];
  const index=Math.max(0,Math.min(5,Number(host.dataset.stage)||0)),stage=stages[index];host.dataset.stage=String(index);host.querySelector('[data-transformer-stage-label]').textContent=stage[0];host.querySelector('[data-transformer-stage-view]').innerHTML=matrix(stage[1])+'<p>'+esc(stage[2])+'</p>';host.querySelector('[data-transformer-back]').disabled=index===0;host.querySelector('[data-transformer-next]').disabled=index===5;
  host.querySelector('[data-transformer-heatmap]').innerHTML='<table class="transformer-heatmap"><thead><tr><th scope="col">Query / Key</th><th scope="col">位置 1</th><th scope="col">位置 2</th></tr></thead><tbody>'+r.A.map((row,i)=>'<tr><th scope="row">位置 '+(i+1)+'</th>'+row.map(x=>'<td style="background:rgba(109,78,207,'+(0.08+0.6*x)+');color:'+'#17233b'+'">'+round(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  host.querySelector('[data-transformer-output]').innerHTML=matrix(r.O);host.querySelector('[data-transformer-observation]').textContent=get('causal').checked?'因果遮罩已開啟：第 1 個位置只能使用自己的 Value，因此輸出固定為 (2,0)。':'沒有因果遮罩：兩個位置都可讀取，Query 改變會重新分配該列權重。';
 }
 keywordExample=function(t,p){return t.id===id?lesson():previousExample(t,p);};
 renderKeyword=function(){previousRender.apply(this,arguments);document.querySelectorAll('#keyword-body [data-transformer-demo]').forEach(paint);};
 document.addEventListener('input',event=>{if(event.target.matches('[data-transformer-control]'))paint(event.target.closest('[data-transformer-demo]'));});
 document.addEventListener('click',event=>{const button=event.target.closest('[data-transformer-back],[data-transformer-next],[data-transformer-reset]');if(!button)return;const host=button.closest('[data-transformer-demo]');if(!host)return;if(button.hasAttribute('data-transformer-reset')){host.querySelector('[data-transformer-control="q1"]').value=1;host.querySelector('[data-transformer-control="q2"]').value=0;host.querySelector('[data-transformer-control="scaled"]').checked=true;host.querySelector('[data-transformer-control="causal"]').checked=false;host.dataset.stage='0';}else host.dataset.stage=String(Number(host.dataset.stage)+(button.hasAttribute('data-transformer-next')?1:-1));paint(host);});
 window.TransformerLesson={id,compute,softmax,layerNorm,equations,lesson,interactive,pyAttention,pyBlock};
})();
