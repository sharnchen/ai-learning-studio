'use strict';
// 教學用名詞釋義；不將 JavaScript 語法說明放入學習介面。
const learningDefinitions=[
['Specificity','特異度（Specificity）','TN／(TN＋FP)：所有實際陰性中判對的比例。'],
['F1','F1 分數（F1 Score）','2×TP／(2×TP＋FP＋FN)，是精確率與召回率的調和平均。'],
['NLL','負對數概似（Negative Log-Likelihood）','本例單筆值為 −ln(真類別機率)，機率越小，損失越大。'],
['TP','真陽性（True Positive）','實際為陽性、也預測為陽性的筆數；是判對的陽性。'],
['FP','假陽性（False Positive）','實際為陰性、卻預測為陽性的筆數；是誤報。'],
['FN','假陰性（False Negative）','實際為陽性、卻預測為陰性的筆數；是漏報。'],
['TN','真陰性（True Negative）','實際為陰性、也預測為陰性的筆數；是判對的陰性。'],
['TPR','真陽性率（True Positive Rate）','TP／(TP＋FN)，與召回率（Recall）相同；分母是所有實際陽性。'],
['FPR','假陽性率（False Positive Rate）','FP／(FP＋TN)；分母是所有實際陰性，不是所有預測陽性。'],
['Precision','精確率（Precision）','TP／(TP＋FP)：預測陽性之中，有多少真的陽性。分母為零時未定義。'],
['Recall','召回率（Recall）','TP／(TP＋FN)：實際陽性之中，成功找出多少。分母為零時未定義。'],
['Accuracy','準確率（Accuracy）','(TP＋TN)／總筆數：所有判斷之中正確的比例。'],
['ROC','接收者操作特徵曲線（Receiver Operating Characteristic）','改變分類閾值，以假陽性率為橫軸、真陽性率為縱軸繪出的曲線。'],
['AUC','曲線下面積（Area Under the Curve）','ROC-AUC 是 ROC 曲線下面積；本例依各閾值結果以梯形面積相加。'],
['PR','精確率－召回率曲線（Precision–Recall）','改變閾值，對照召回率與精確率；不等同 ROC 曲線。'],
['MSE','均方誤差（Mean Squared Error）','每筆「預測－真值」先平方，再加總除以筆數；單位為原量測單位的平方。'],
['MAE','平均絕對誤差（Mean Absolute Error）','每筆「預測－真值」取絕對值，再加總除以筆數。'],
['RMSE','均方根誤差（Root Mean Squared Error）','先算均方誤差，再開平方根；單位與真值相同。'],
['R²','決定係數（Coefficient of Determination）','1－殘差平方和／真值對平均的平方和；真值全相同時此式分母為零。'],
['KL','KL 散度（Kullback–Leibler Divergence）','Σ Pᵢ log(Pᵢ／Qᵢ)，比較兩個機率分布；通常不對稱，不是距離。'],
['WER','詞錯誤率（Word Error Rate）','(替換詞數＋刪除詞數＋插入詞數)／參考稿詞數；本實驗依面板指定的分詞方式計數。'],
['QKV','查詢、鍵、值（Query, Key, Value）','注意力先比較查詢 Q 與鍵 K，再以所得權重加權值 V。'],
['Q1','第一四分位數（First Quartile）','排序後位於約 25% 位置的數值；實際插值方式須與本例公式一致。'],
['Q3','第三四分位數（Third Quartile）','排序後位於約 75% 位置的數值。'],
['IQR','四分位距（Interquartile Range）','Q3－Q1；本例以 Q1－1.5×IQR 至 Q3＋1.5×IQR 作截斷界線。'],
['eps','鄰域半徑（Epsilon）','密度分群中兩點可視為鄰近的最大距離。'],
['minPts','最少鄰點數（Minimum Points）','密度分群中成為核心點所需的鄰域樣本數；本例包含點本身。'],
['logit','未正規化分數（Logit）','尚未轉成機率的實數分數；經 Sigmoid 或 Softmax 後才得到本例機率。'],
['rank','秩（Rank）','低秩適配中間維度 r；影響需訓練的參數數量。'],
['MiB','二進位百萬位元組（Mebibyte）','1 MiB＝2²⁰ bytes＝1,048,576 位元組。'],
['GiB','二進位十億位元組（Gibibyte）','1 GiB＝2³⁰ bytes；不同於 10⁹ bytes 的 GB。'],
['GB','十億位元組（Gigabyte）','1 GB＝10⁹ bytes；頻寬 GB/s 表示每秒搬移多少 GB。'],
['FLOPs','浮點運算次數（Floating-point Operations）','表示總工作量；FLOP/s 表示每秒運算速率，兩者不能混用。'],
['TFLOP/s','每秒兆次浮點運算（Tera Floating-point Operations per Second）','1 TFLOP/s＝每秒 10¹² 次浮點運算。'],
['ms','毫秒（Millisecond）','1 ms＝0.001 秒；延遲是時間，吞吐是單位時間完成量。']
];
function learningReferenceRows(text){
 const source=String(text),rows=[],seen=new Set();
 const matches=token=>new RegExp('(^|[^A-Za-z0-9])'+token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^A-Za-z0-9])','i').test(source);
 for(const [token,name,meaning]of learningDefinitions)if(matches(token)){rows.push([name,meaning]);seen.add(token.toLowerCase())}
 for(const t of keywordCatalog){const tokens=t.en.match(/\b(?:[A-Z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*|[A-Z]{2,})\b/g)||[];if(tokens.some(token=>!seen.has(token.toLowerCase())&&matches(token))){rows.push([t.zh+'（'+t.en+'）',t.definition]);tokens.forEach(token=>seen.add(token.toLowerCase()))}}
 return rows;
}
function learningReference(text){const rows=learningReferenceRows(text);return rows.length?`<details class="learning-reference" ${rows.length<=8?'open':''}><summary>本節縮寫與名詞（Terms in This Section）</summary>${labTable(['中英文名稱','在此處的意義'],rows)}</details>`:'';
}

function labDataGuide(e,v,r){
 const rows=e.controls.map(c=>{let value=v[c.id];if(c.type==='select'){const option=c.options.find(o=>o.split(':')[0]===value);value=option?.includes(':')?option.slice(option.indexOf(':')+1):value}if(c.type==='checkbox')value=value?'是':'否';return [c.label,String(value),'目前輸入；初次開啟為教學預設，可自行修改']});
 const provenance=e.type==='流程模擬'?'本次結果依輸入條件選擇規劃建議，沒有實際量測或訓練模型。':'本次結果由目前輸入與本例固定假設計算；不是外部量測值。請往下對照公式、代入值與逐步結果。';
 const text=[e.title,e.description,...e.controls.map(c=>c.label),...(r.metrics||[]).map(x=>x[0]),...(r.lines||[]),...(r.table?.headers||[])].join(' ');
 return `<section class="data-guide"><h3>數據從哪裡來？（Data Sources）</h3><p>${provenance}</p><details><summary>核對本次輸入與來源</summary>${labTable(['輸入意義','本次數值／設定','來源'],rows)}<p><b>本例假設：</b>${escapeHtml(e.description)}</p></details>${fixedLearningNotes[e.id]?`<p><b>固定資料與符號：</b>${escapeHtml(fixedLearningNotes[e.id])}</p>`:''}${classificationDataGuide(e,v)}${learningReference(text)}</section>`;
}
const thresholdTeachingSamples=[[.95,1],[.85,0],[.8,1],[.65,1],[.5,0],[.4,1],[.2,0],[.1,0]];
function confusionExplanation(samples,positive='陽性',negative='陰性'){
 const groups={TP:[],FP:[],FN:[],TN:[]};
 for(const [id,truth,prediction]of samples)groups[truth?(prediction?'TP':'FN'):(prediction?'FP':'TN')].push(id);
 const names={TP:'真陽性（True Positive）',FP:'假陽性（False Positive）',FN:'假陰性（False Negative）',TN:'真陰性（True Negative）'};
 return `<section class="confusion-explanation"><h3>逐筆歸類與計數（Confusion Matrix）</h3><p>本例「陽性（Positive）」指${escapeHtml(positive)}，「陰性（Negative）」指${escapeHtml(negative)}。True／False 表示預測對／錯；Positive／Negative 表示預測的類別。</p>${labTable(['縮寫與全名','實際類別','預測類別','符合條件的資料','筆數如何得到'],Object.keys(groups).map(k=>[k+'：'+names[k],k==='TP'||k==='FN'?positive:negative,k==='TP'||k==='FP'?positive:negative,groups[k].join('、')||'無',groups[k].length?groups[k].map(()=>1).join('＋')+'＝'+groups[k].length:'沒有符合資料＝0']))}${labTable(['實際＼預測',positive,negative],[[positive,'TP＝'+groups.TP.length,'FN＝'+groups.FN.length],[negative,'FP＝'+groups.FP.length,'TN＝'+groups.TN.length]])}<p>總數核對：TP＋FP＋FN＋TN＝${groups.TP.length}＋${groups.FP.length}＋${groups.FN.length}＋${groups.TN.length}＝${samples.length}。</p></section>`;
}
function classificationDataGuide(e,v){
 if(e.id==='threshold')return '<p>固定教學資料共八筆；分數為預先指定的示範值，真實標籤為教學參考答案。規則：分數 ≥ 閾值就預測陽性。</p>'+labTable(['樣本','固定分數','真實標籤','與目前閾值比較','預測','歸類'],thresholdTeachingSamples.map(([s,y],i)=>{const p=s>=v.threshold;return ['S'+(i+1),s,y?'陽性':'陰性',s+(p?' ≥ ':' < ')+v.threshold,p?'陽性':'陰性',y?(p?'TP':'FN'):(p?'FP':'TN')]}))+confusionExplanation(thresholdTeachingSamples.map(([s,y],i)=>['S'+(i+1),y,s>=v.threshold]));
 if(e.id==='calc-metrics')return `<p>此面板直接輸入四種分類的彙總筆數，預設 TP＝8、FP＝2、FN＝12、TN＝78 是教學設定，並非由未提供的逐筆資料推算。可先在「閾值、ROC 與 PR」實驗觀察逐筆計數，再回來輸入自己的統計。</p><p>本次總數＝TP＋FP＋FN＋TN＝${v.tp}＋${v.fp}＋${v.fn}＋${v.tn}＝${v.tp+v.fp+v.fn+v.tn}。</p>`;
 if(e.id==='fairness')return `<p>本例固定 A、B 群各有 10 個實際陽性、90 個實際陰性；TP、FP 由你輸入，FN＝10－TP，TN＝90－FP。</p>${labTable(['群體','TP（輸入）','FP（輸入）','FN＝10－TP','TN＝90－FP'],[['A',v.tpA,v.fpA,'10－'+v.tpA+'＝'+(10-v.tpA),'90－'+v.fpA+'＝'+(90-v.fpA)],['B',v.tpB,v.fpB,'10－'+v.tpB+'＝'+(10-v.tpB),'90－'+v.fpB+'＝'+(90-v.fpB)]])}`;
 return '';
}

const fixedLearningNotes={
'calc-activation':'x 是輸入、w 是權重、b 是偏置；線性分數 z＝w×x＋b。Leaky ReLU 負半軸斜率固定 0.1；GELU 使用近似式中的常數 0.044715。',
'calc-gradient':'固定損失 L(w)＝(w－3)²，最佳位置 3 是教學設定；梯度 g＝2(w－3)，新參數＝w－ηg；η 是目前輸入的學習率。',
'calc-sampling':'候選 A、B、C 的原始分數固定為 2、1、0，不是本次模型推論產生。Temperature 是溫度；Top-k 保留最高 k 個候選，Top-p 依累積機率保留候選，再重新正規化。',
'calc-conv':'尺寸均為像素／格數；步幅是核每次移動的距離，填補是每側增加的格數。輸出邊長＝向下取整((輸入邊長＋2×填補－核邊長)／步幅)＋1。',
'calc-batch':'微批次是一次處理的樣本數，累積次數是更新前累積多少微批次，輪次是完整走過資料的次數；不足整批仍計一次。',
'calc-vector':'A₁、A₂ 是二維向量 A 的兩個分量，B₁、B₂ 是 B 的分量。範數表示長度，Cosine 表示夾角餘弦，Euclidean Distance 表示兩點直線距離。',
'calc-memory':'參數量輸入單位為百萬；8 bits＝1 byte。純權重容量不包含激活、梯度與最佳化器狀態；注意力矩陣每元素固定假設 2 bytes。N 是序列長度。',
'calc-lora':'完整權重矩陣為 m×n；低秩更新由 m×r 與 r×n 兩矩陣組成，因此需 r(m＋n) 個參數。r 是 rank。',
'calc-discount':'三步獎勵固定為 1、2、3；不是由環境收集。γ 是折扣因子，回報 G＝1＋γ×2＋γ²×3。',
'calc-clip':'原梯度向量固定為 [3,4]，長度＝√(3²＋4²)＝5；縮放比例＝min(1,最大範數／5)，再乘上每個分量。',
'calc-standard':'x 是輸入值、μ 是輸入的平均、σ 是輸入的標準差；此面板不會另外從資料估計 μ、σ。標準分數 z＝(x－μ)／σ。',
'calc-error':'兩個誤差與真類別機率由你輸入；此處沒有隱藏的預測資料。MSE 用兩筆誤差平方平均；單筆交叉熵為 −ln(真類別機率)。',
'autodiff':'x 是輸入、w 是權重、b 是偏置、y 是目標；z 是線性分數、L 是損失。dL/dw 表示只改變 w 時，損失變化的快慢；鏈式法則把沿路的局部導數相乘。',
'fairness':'Recall 差距是兩群召回率相減後取絕對值；比較前必須先固定陽性定義。',
'calculus':'∂f/∂x 表示固定 y、只改 x 的變化率；∂f/∂y 則固定 x。Jacobian 把多個輸出對各輸入的偏導數排成矩陣。',
'distribution':'P、Q 是輸入權重正規化後的機率；H(P) 是熵，H(P,Q) 是交叉熵。此處 log 採自然對數，單位為 nat。',
'attention':'Q、K、V 是本例固定的查詢、鍵、值示範向量；面板調整 Q 倍率與遮罩，並非從真實語言模型擷取。PAD 是填補位置，因果遮罩禁止讀取未來位置。',
'privacy':'ε 是差分隱私參數；本例用固定種子的偽隨機噪聲展示數值變化，不代表完整隱私保證或適合正式發布的安全亂數。'
};
