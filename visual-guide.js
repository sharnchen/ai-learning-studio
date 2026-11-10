'use strict';
const visualRecipes={
'gradient-ascent':['選擇最大化目標','計算目標的梯度','加上 η 倍梯度','核對目標與更新軌跡'],
  "calc-activation": [
    "輸入與權重",
    "線性加權 z=wx+b",
    "激活函數 f(z)",
    "輸出神經元"
  ],
  "calc-gradient": [
    "目前參數 w",
    "損失 L=(w−3)²",
    "梯度與更新方向",
    "下一步參數與損失"
  ],
  "calc-metrics": [
    "真值與模型預測",
    "累計 TP/FP/FN/TN",
    "選擇指標的分子分母",
    "比較準確率與召回率"
  ],
  "calc-sampling": [
    "候選 logits",
    "溫度與 Softmax",
    "Top-k / Top-p 篩選",
    "重新正規化分布"
  ],
  "calc-conv": [
    "輸入影像與通道",
    "核、步幅與填補",
    "計算輸出空間尺寸",
    "展平元素總數"
  ],
  "calc-batch": [
    "資料與微批次",
    "向上取整分批",
    "累積梯度後更新",
    "跨訓練輪次加總"
  ],
  "calc-vector": [
    "兩個二維向量",
    "點積與向量長度",
    "比較夾角與距離",
    "判讀方向相似性"
  ],
  "calc-memory": [
    "參數與位元數",
    "位元換算位元組",
    "注意力 N×N 規模",
    "理論記憶體需求"
  ],
  "calc-lora": [
    "完整 m×n 權重",
    "分解為低秩 A/B",
    "累計 r(m+n) 參數",
    "比較更新參數比例"
  ],
  "calc-discount": [
    "三步獎勵",
    "各步乘 γ 的次方",
    "加總折扣獎勵",
    "得到回報 G"
  ],
  "calc-clip": [
    "原梯度向量",
    "計算 L2 範數",
    "等比例裁剪",
    "比較裁剪與連乘梯度"
  ],
  "calc-standard": [
    "輸入與訓練統計",
    "減去訓練平均",
    "除以訓練標準差",
    "得到 z-score"
  ],
  "calc-error": [
    "誤差與真類別機率",
    "絕對值、平方或負對數",
    "取平均或平方根",
    "比較誤差與困惑度"
  ],
  "learning-plan": [
    "任務目標",
    "標籤與未標註資料",
    "有無行動回饋",
    "選擇學習訊號"
  ],
  "adaptation": [
    "目標任務樣本",
    "是否更新權重",
    "更新範圍與標註預算",
    "適應與回測"
  ],
  "capability": [
    "四項測試分數",
    "分別檢視能力",
    "平均與最弱項",
    "能力涵蓋與限制"
  ],
  "data-clean": [
    "原始數列與空欄",
    "填補或移除缺值",
    "離群截斷與縮放",
    "檢查轉換後資料"
  ],
  "split": [
    "時間與個體索引",
    "選逐筆、群組或時間切分",
    "核對跨集合個體",
    "發現資料洩漏"
  ],
  "balance": [
    "原始類別比例",
    "過採樣或欠採樣",
    "比較類別數量",
    "保留真實評估分布"
  ],
  "drift": [
    "舊資料與新資料",
    "比較平均與標準差",
    "比較條件陽性率",
    "分布或概念變化"
  ],
  "provenance": [
    "資料來源",
    "使用條件",
    "版本固定",
    "產物雜湊追溯"
  ],
  "augment": [
    "合成十字影像",
    "選幾何或亮度轉換",
    "逐像素映射",
    "檢查標籤是否保留"
  ],
  "matrix": [
    "矩陣 A 與 B",
    "取 A 的列與 B 的欄",
    "對應乘積加總",
    "乘法、轉置與形狀"
  ],
  "statistics": [
    "配對 X/Y 數列",
    "平均與離均差",
    "變異數、共變異數",
    "相關強度與限制"
  ],
  "bayes": [
    "先驗與觀測證據",
    "計算各假設概似",
    "聯合機率正規化",
    "後驗或 MAP"
  ],
  "distribution": [
    "兩組正權重",
    "正規化成機率",
    "加權負對數",
    "熵、交叉熵與 KL"
  ],
  "calculus": [
    "指定 x/y",
    "拆解內外函數",
    "偏導數與鏈式法則",
    "梯度與曲率"
  ],
  "pca": [
    "二維樣本",
    "中心化與協方差",
    "第一主成分投影",
    "低秩重建與誤差"
  ],
  "regression": [
    "固定樣本與真值",
    "多項式預測",
    "逐點殘差",
    "均方誤差"
  ],
  "knn": [
    "帶標籤樣本與查詢",
    "計算二維距離",
    "取最近 k 個",
    "依類別投票"
  ],
  "kmeans": [
    "樣本與初始中心",
    "分派最近中心",
    "各群重算平均",
    "重複迭代並檢查平方和"
  ],
  "hierarchy": [
    "一維樣本距離",
    "單連結或密度鄰域",
    "合併或擴展連通群",
    "群組與雜訊點"
  ],
  "gmm": [
    "樣本與兩個高斯",
    "成分密度乘先驗",
    "正規化加權密度",
    "柔性的責任值"
  ],
  "tree": [
    "溫度與電流",
    "比較溫度閾值",
    "低溫分支比較電流",
    "沿規則得到預測"
  ],
  "ensemble": [
    "固定訓練資料",
    "有放回抽樣",
    "多個模型各自預測",
    "集成投票或平均"
  ],
  "boost": [
    "目標與目前預測",
    "計算殘差",
    "縮減殘差更新量",
    "逐輪改善預測"
  ],
  "svm": [
    "帶標籤二維樣本",
    "線性分數",
    "乘標籤得到間隔",
    "不足間隔的 Hinge 損失"
  ],
  "naivebayes": [
    "類別先驗與詞項",
    "條件獨立的詞機率",
    "連乘成類別分數",
    "正規化後驗"
  ],
  "recommend": [
    "使用者與項目向量",
    "向量點積評分",
    "排除已看項目",
    "依分數推薦"
  ],
  "timeseries": [
    "按時間排列資料",
    "只取過去視窗",
    "移動平均預測",
    "殘差與異常分數"
  ],
  "mlp": [
    "兩個輸入",
    "兩個 ReLU 隱藏單元",
    "以權重組合隱藏值",
    "XOR 輸出"
  ],
  "normalization": [
    "兩樣本三特徵",
    "決定統計的軸",
    "中心化或 RMS 縮放",
    "比較不同正規化"
  ],
  "dropout": [
    "原激活值",
    "固定種子產生遮罩",
    "保留值除以保留率",
    "訓練與推論差異"
  ],
  "residual": [
    "輸入與分支輸出",
    "相加或串接",
    "核對形狀與尺度",
    "保留訊號的跳接"
  ],
  "autodiff": [
    "x、w、b 與目標",
    "前向 z=wx+b",
    "平方損失 L",
    "局部導數反向相乘"
  ],
  "optimizer": [
    "目前權重與損失",
    "計算梯度",
    "動量或自適應更新",
    "逐步追蹤收斂"
  ],
  "regularization": [
    "原權重與懲罰係數",
    "L1 或 L2 正則項",
    "近端或衰減更新",
    "比較稀疏與縮小"
  ],
  "learning-curve": [
    "模型複雜度",
    "訓練與驗證曲線",
    "耐心值與早停判斷",
    "選擇泛化較佳設定"
  ],
  "threshold": [
    "固定分數與真值",
    "比較分類閾值",
    "累計混淆矩陣",
    "掃描 ROC/PR 與 AUC"
  ],
  "regression-metrics": [
    "真值與預測",
    "逐筆計算殘差",
    "平方、絕對值與基準",
    "MSE、RMSE、MAE、R²"
  ],
  "calibration": [
    "原始機率分數",
    "溫度調整 logit",
    "按信心分桶",
    "比較信心與命中比例"
  ],
  "cv": [
    "資料索引與 K",
    "保留一折驗證",
    "其他折作訓練",
    "輪流驗證與污染檢查"
  ],
  "ablation": [
    "同測試集的結果",
    "移除指定元件",
    "與基準相減",
    "核對元件貢獻"
  ],
  "convolution-grid": [
    "輸入像素網格",
    "選核或池化區域",
    "局部乘加或彙整",
    "輸出特徵網格"
  ],
  "boxes": [
    "兩個同類別框",
    "求重疊交集",
    "交集除以聯集",
    "依 IoU 與分數抑制"
  ],
  "segmentation": [
    "合成圖中兩個物件",
    "指定像素類別",
    "保留或合併實例 ID",
    "比較語意與實例標註"
  ],
  "patches": [
    "影像與 Patch 邊長",
    "非重疊切塊",
    "展平每塊的通道",
    "Token 數與剩餘邊界"
  ],
  "tokenizer": [
    "小型文字語料",
    "統計相鄰配對",
    "合併高頻字元對",
    "新的詞元序列"
  ],
  "embedding": [
    "文件與詞彙表",
    "統計可見詞頻",
    "詞頻向量相似度",
    "依查詢相似度排序"
  ],
  "rnn": [
    "序列與初始狀態",
    "輸入結合舊狀態",
    "循環單元與閘門",
    "將新狀態傳到下一步"
  ],
  "text-tasks": [
    "輸入文字",
    "詞表或擷取規則",
    "情感、翻譯或摘要基準",
    "核對規則與侷限"
  ],
  "transcript": [
    "參考稿與辨識稿",
    "插入、刪除或替換",
    "動態規劃編輯距離",
    "WER 與錯誤位置"
  ],
  "attention": [
    "Q、K、V 三組向量",
    "QKᵀ 縮放與遮罩",
    "逐列 Softmax 權重",
    "權重乘 V 加總"
  ],
  "attention-cost": [
    "序列、頭數與維度",
    "全配對或稀疏配對",
    "位置旋轉與 KV 儲存",
    "理論元素與快取預算"
  ],
  "moe": [
    "四個專家分數",
    "選 Top-k 專家",
    "路由到選定分支",
    "激活預算與負載"
  ],
  "prompt": [
    "任務與來源",
    "限制與輸出格式",
    "提示或訓練資料結構",
    "檢查可驗收目標"
  ],
  "decoding": [
    "起始候選機率",
    "展開下一層分支",
    "相乘成路徑分數",
    "貪婪或 Beam 保留路徑"
  ],
  "json": [
    "JSON 與停止字串",
    "實際解析資料",
    "型別與欄位驗證",
    "可用結構或明確錯誤"
  ],
  "masking": [
    "分詞後的序列",
    "指定遮罩或前綴",
    "MLM 目標或串流切片",
    "核對可見上下文"
  ],
  "chunking": [
    "來源文件",
    "切塊長度與重疊",
    "滑動起點並保留位置",
    "文件片段與壓縮"
  ],
  "retrieval": [
    "查詢與多份文件",
    "詞項與詞頻相似度",
    "權限篩選及 RRF 融合",
    "有權限的排序結果"
  ],
  "query-evidence": [
    "問題與來源片段",
    "代名詞及同義詞規則",
    "逐字檢查引用",
    "證據命中與限制"
  ],
  "graph": [
    "主體、關係、客體",
    "建立有向鄰接關係",
    "BFS 逐層搜尋",
    "最短可達路徑"
  ],
  "quantize": [
    "原始權重",
    "縮放與整數捨入",
    "剪枝或反量化",
    "比較壓縮誤差"
  ],
  "distill": [
    "教師與學生 logits",
    "溫度 Softmax",
    "教師機率作軟目標",
    "學生交叉熵"
  ],
  "adapt-budget": [
    "全模型參數",
    "凍結與可訓練部分",
    "適配器或前綴規模",
    "比較微調預算"
  ],
  "merge-forget": [
    "兩組模型權重",
    "平均或按樣本加權",
    "在新舊任務回測",
    "觀察合併與遺忘"
  ],
  "signal": [
    "合成純淨波形",
    "加入固定種子噪聲",
    "移動平均與 DFT",
    "時間波形與頻率分量"
  ],
  "source-separation": [
    "兩個合成來源",
    "2×2 線性混音",
    "以已知逆矩陣解混",
    "重建來源與誤差"
  ],
  "latent": [
    "四個輸入值",
    "兩組平均編碼",
    "可選潛在取樣",
    "重複解碼與重建誤差"
  ],
  "generation-ode": [
    "起始值與目標",
    "速度場 dx/dt",
    "Euler 或 Heun 積分",
    "步數與軌跡誤差"
  ],
  "conditioning": [
    "合成圖與遮罩",
    "保留已知區域",
    "以條件約束填補",
    "檢查遮罩外保留"
  ],
  "temporal-world": [
    "位置與真實速度",
    "指定模型速度偏差",
    "逐時間演化",
    "比較長期位置誤差"
  ],
  "gan": [
    "真實與生成分數",
    "判別器機率",
    "負對數目標",
    "生成與判別損失"
  ],
  "qlearning": [
    "狀態與 Q 表",
    "探索或貪婪選動作",
    "環境回饋與下一狀態",
    "TD 誤差更新 Q"
  ],
  "policy-preference": [
    "策略與參考 logits",
    "偏好配對的對數比",
    "Logistic 偏好損失",
    "核對代理獎勵偏移"
  ],
  "agent-workflow": [
    "假任務與權限",
    "呼叫工具與重試",
    "冪等去除重複寫入",
    "可追蹤的執行狀態"
  ],
  "mcp-tools": [
    "Host 與 Client",
    "Server 公開工具介面",
    "參數格式與權限驗證",
    "本地假工具回傳"
  ],
  "memory-retrieval": [
    "本地假記憶",
    "依型別與查詢篩選",
    "檢查來源與有效期",
    "只保留所需記憶"
  ],
  "onehot": [
    "已知類別表",
    "定位類別索引",
    "指定位置為 1",
    "未知類別處理"
  ],
  "logistic-contrast": [
    "線性分數與向量",
    "Sigmoid 機率",
    "正負樣本距離",
    "分類與對比目標"
  ],
  "repetition": [
    "已出現詞與 logits",
    "依正負分數施加懲罰",
    "重新計算 Softmax",
    "比較候選分布"
  ],
  "serving": [
    "同時到達的請求",
    "同步或連續批次",
    "逐 Token 分配運算",
    "延遲與吞吐差異"
  ],
  "cache-speculate": [
    "前綴與草稿成本",
    "命中率與接受率",
    "命中或拒絕的成本",
    "比較理論總成本"
  ],
  "roofline": [
    "運算量與搬移量",
    "FLOPs 除以峰值",
    "Bytes 除以頻寬",
    "兩種時間下限取最大"
  ],
  "parallel-checkpoint": [
    "模型與激活記憶體",
    "資料、張量或管線平行",
    "重計算與卸載假設",
    "單卡記憶體及利用率"
  ],
  "fairness": [
    "兩群固定樣本",
    "各群 TP 與 FP",
    "Recall 及 FPR 分母",
    "比較群體差距"
  ],
  "privacy": [
    "計數與隱私參數",
    "種子產生 Laplace 噪聲",
    "原計數加噪聲",
    "發布數值與個資遮罩"
  ],
  "guardrails": [
    "不可信外部文件",
    "隔離資料與指令",
    "連外、寫入及審核關卡",
    "受條件限制的風險"
  ],
  "adversarial": [
    "原始輸入",
    "共同擾動或後門條件",
    "比較線性決策邊界",
    "檢查跨界與污染比例"
  ],
  "governance": [
    "用途與限制",
    "資料及評估證據",
    "人工更正與解釋機制",
    "模型卡說明草稿"
  ],
  "watermark": [
    "合成原訊號",
    "固定種子標記",
    "加入噪聲並裁切",
    "以已知原訊號檢測"
  ],
  "pipeline": [
    "資料或程式提交",
    "格式與測試關卡",
    "品質與發布決定",
    "停止或交付的狀態"
  ],
  "release": [
    "新舊版錯誤率",
    "金絲雀、影子或回滾",
    "依流量加權",
    "錯誤請求與發布判斷"
  ],
  "monitor": [
    "請求與各段耗時",
    "追蹤各 Span",
    "限流與成本計算",
    "延遲及運維指標"
  ],
  "float-format": [
    "原始浮點值",
    "選指數與尾數格式",
    "量級間距與偶數捨入",
    "可表示值與誤差"
  ]
};
const visualContexts=new Map(),visualSteps=new Map();
function vesc(x){return escapeHtml(String(x))}
function vnum(x){return typeof x==='number'?lfmt(x):String(x)}
function vsvg(title,body,description='圖形以目前輸入與結果呈現，細節可在下方數值與計算過程核對。'){return `<svg class="visual-svg" viewBox="0 0 720 310" role="img" aria-label="${vesc(title)}"><title>${vesc(title)}</title><desc>${vesc(description)}</desc><rect x="1" y="1" width="718" height="308" rx="16" fill="#faf9ff" stroke="#e3def3"/>${body}</svg>`}
function vtext(x,y,text,color='#3c3653',size=14,anchor='start'){return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}">${vesc(text)}</text>`}
function vline(x1,y1,x2,y2,color='#b6abcF',width=2,dash=''){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`}
function vnode(x,y,label,value,color='#7155df'){return `<circle cx="${x}" cy="${y}" r="30" fill="#fff" stroke="${color}" stroke-width="3"/>${vtext(x,y+5,label,color,14,'middle')}${value===undefined?'':vtext(x,y+53,vnum(value),'#4c465f',13,'middle')}`}
function vshort(x,n=40){const a=Array.from(String(x));return a.length>n?a.slice(0,n).join('')+'…':String(x)}
function visualConcept(e,step){const names=visualRecipes[e.id];return `<div class="visual-concept" role="group" aria-label="可點選的概念圖解">${names.map((name,i)=>`<button class="visual-node ${i===step?'selected':''}" data-visual-step="${i}" data-visual-context="CONTEXT" aria-pressed="${i===step}"><span class="visual-node-top"><b>${i+1}</b><span>${['INPUT','TRANSFORM','MECHANISM','RESULT'][i]}</span></span><strong>${vesc(name)}</strong><span class="visual-node-hint">${['辨認輸入與條件','理解資料如何轉換','觀察核心機制','核對結果與限制'][i]}</span></button>`).join('')}</div>`}
function visualResultText(r){if(r.metrics?.length)return r.metrics.slice(0,3).map(([k,v])=>k+'：'+vnum(v)).join('；');if(r.grids?.length)return r.grids.map(g=>g.title+' '+g.values.length+'×'+(g.values[0]?.length||0)).join('；');if(r.table)return r.table.headers.join('／')+'（'+r.table.rows.length+'列）';return (r.lines||r.steps||[]).slice(0,2).join('；')}
function visualExplain(e,v,r,step){const names=visualRecipes[e.id],inputs=e.controls.filter(c=>typeof v[c.id]!=='undefined').slice(0,4).map(c=>c.label+'＝'+vshort(v[c.id],50)).join('；');const special={
'gradient-ascent':['先選擇 J 的定義。二次目標、資料對數概似與策略預期回報都以最大化為目的。','梯度取自目前參數；正梯度使參數增大，負梯度使參數減小。','使用加號：θ新=θ舊+ηg；等價於下降損失 −J。調高學習率觀察越過頂點的情況。','圖上紫點為起點，綠點為終點；連線依迭代順序，不代表沿連線求值。下方逐步表和計算過程列出所有更新。'],
'calc-gradient':['目前的 w 是損失曲線上的一個位置。紫色點表示更新前，綠色點表示更新後。','曲線為 L(w)=(w−3)²；最低點在 w=3。點越高，損失越大。','梯度 g=2(w−3)。更新量為 −ηg，因此沿梯度反方向移動；學習率過大可能跨越最低點。','核對紫點和綠點的高低，以及下方更新前後的損失；畫面只顯示單步更新。'],
'calc-activation':['x 是輸入，w 控制輸入的重要性，b 讓線性分數平移。','先計算 z=wx+b；神經元圖的多條連線在加總節點匯合。','曲線展示 ReLU、Sigmoid 與 Tanh；虛線標出目前 z。三條曲線共用座標，數值尺度不同。','同一個 z 經不同激活函數會有不同輸出。下方計算表可核對各函數的實際代入。'],
'kmeans':['數線上的點是實際樣本；星形位置是本次迭代後的兩個中心。','每個樣本比較到兩個中心的距離，選較近者；同距離時依本例規則分到第一群。','重算群內平均，移動中心，再重複分派。改變迭代次數可觀察中心的改變。','連線表示樣本到目前中心的距離；群內平方和會放大遠離中心的樣本影響。'],
'attention':['固定 Q、K、V 各有三個位置；圖中左側為 Query，右側為 Key。','每一個 Query 與各 Key 做點積，再除以 √2；勾選的遮罩會排除不允許的位置。','連線越粗表示目前注意力權重越大；零權重連線隱藏。這些權重來自本次計算。','每個 Query 以這一列權重對 V 加權求和。圖為單頭小案例，並非完整 Transformer。'],
'convolution-grid':['左圖是固定合成輸入；每個方格是一個像素數值。','卷積核在局部區域逐項乘加；池化則彙整區域。可切換操作比較兩種機制。','深淺顏色只在同一張網格內表示數值相對大小；不同網格不共用色階。','輸出網格來自本次結果。步幅、填補及丟棄邊界會改變形狀，詳細乘加保留在計算表。'],
'boxes':['紫框 A 固定在 (0,0)，綠框 B 由目前 X/Y 控制。兩框邊長都是 3。','重疊部分是交集；兩框覆蓋的總區域扣掉重複部分就是聯集。','IoU=交集／聯集。框相距越遠，重疊通常越少；不相交時交集為零。','NMS 還會比較分數與閾值，決定是否抑制較低分的框；不只是看有沒有重疊。'],
'regression':['散點是真實資料，預測線使用目前的一次、二次係數與截距。','把每個 X 代入預測式，得到對應預測值。','垂直虛線連接真值與預測，是每一筆的殘差。','MSE 先平方每筆殘差再取平均；改係數後可觀察虛線與 MSE 一起改變。'],
'autodiff':['輸入 x 與權重 w、偏置 b 形成計算圖。','正向沿紫色實線計算 z=wx+b，再計算 L=(z−y)²。','反向虛線代表從損失往回傳遞導數；經過每條邊時乘上局部導數。','圖上顯示本次 z、L 與 dL/dw；全部偏導數可在結果和計算表核對。']};
if(special[e.id])return special[e.id][step];return [inputs||'本案例使用固定的小型教學資料。',`本步聚焦「${names[1]}」。${e.description}`,`觀察「${names[2]}」如何影響圖中的位置、連線、色階或狀態。調整上方輸入後，圖中實際資料會同步更新；概念框架保留不變。`,`本次可核對：${visualResultText(r)}。${e.type==='流程模擬'?'這是依明列條件判斷的本地模擬。':'請搭配下方計算過程核對公式與數值。'}`][step]}
function visualActivation(v){const z=v.w*v.x+v.b;let b=vline(75,85,210,125)+vline(75,190,210,125)+vline(240,125,335,125)+vnode(65,85,'x',v.x)+vnode(65,190,'b',v.b)+vnode(225,125,'Σ',z)+vnode(350,125,'f(z)')+vtext(125,75,'w = '+v.w)+vtext(20,275,'先加權相加，再經非線性激活');const X=x=>425+(x+5)/10*265,Y=y=>235-(y+1)/6*205;for(const [f,color]of [[x=>Math.max(0,x),'#7155df'],[x=>1/(1+Math.exp(-x)),'#159878'],[x=>Math.tanh(x),'#d28529']]){b+=`<polyline points="${Array.from({length:101},(_,i)=>{const x=-5+i*.1;return X(x)+','+Y(f(x))}).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5"/>`};b+=vline(X(-5),Y(0),X(5),Y(0),'#aaa',1)+vline(X(0),Y(-1),X(0),Y(5),'#aaa',1)+vline(X(Math.max(-5,Math.min(5,z))),30,X(Math.max(-5,Math.min(5,z))),235,'#7155df',1,'4 4')+vtext(440,270,'ReLU 紫 / Sigmoid 綠 / Tanh 橙',undefined,12)+vtext(440,291,'橫軸 z ∈ [−5,5]；超出者以邊界線表示',undefined,11);return vsvg('神經元結構與激活函數曲線',b)}
function visualGradient(v,r,id){const w=id==='calc-gradient'?v.w:(r.table?.rows?.[0]?.[1]??v.w??0),next=id==='calc-gradient'?w-v.lr*2*(w-3):w;const lo=Math.min(-1,w,next)-1,hi=Math.max(7,w,next)+1,max=Math.max((lo-3)**2,(hi-3)**2),X=x=>65+(x-lo)/(hi-lo)*590,Y=y=>245-y/max*195;let b=vline(65,40,65,245,'#aaa')+vline(65,245,675,245,'#aaa')+`<polyline points="${Array.from({length:101},(_,i)=>{let x=lo+(hi-lo)*i/100;return X(x)+','+Y((x-3)**2)}).join(' ')}" fill="none" stroke="#bcb0e5" stroke-width="3"/>`+vtext(30,25,'L(w)')+vtext(670,267,'w')+vtext(X(3),270,'3（最低點）','#555',12,'middle');if(id==='calc-gradient')b+=vline(X(w),Y((w-3)**2),X(next),Y((next-3)**2),'#159878',3)+`<circle cx="${X(w)}" cy="${Y((w-3)**2)}" r="7" fill="#7155df"/><circle cx="${X(next)}" cy="${Y((next-3)**2)}" r="7" fill="#159878"/>`+vtext(90,40,'紫：更新前 w='+vnum(w)+'　綠：更新後 w='+vnum(next));return vsvg('梯度下降在損失曲線上的移動',b)}
function visualCluster(v,r){const data=lnums(v.data),c=r.metrics.slice(0,2).map(x=>x[1]),lo=Math.min(...data,...c)-1,hi=Math.max(...data,...c)+1,X=x=>55+(x-lo)/(hi-lo)*610;let b=vline(55,180,665,180,'#aaa');data.forEach((x,i)=>{const k=Math.abs(x-c[0])<=Math.abs(x-c[1])?0:1,color=k?'#159878':'#7155df',y=100+(i%3)*19;b+=vline(X(x),y,X(c[k]),180,color,1,'3 3')+`<circle cx="${X(x)}" cy="${y}" r="7" fill="${color}"/>`+vtext(X(x),y-12,vnum(x),color,12,'middle')});c.forEach((x,i)=>b+=vtext(X(x),195,'★',i?'#159878':'#7155df',28,'middle')+vtext(X(x),225,'中心'+(i+1)+'='+vnum(x),undefined,13,'middle'));return vsvg('K-Means 樣本與本次群中心',b+vtext(35,275,'點：樣本　★：目前中心　虛線：到最近中心的距離；顏色表示目前分派'))}
function visualAttention(r){const a=r.grids[0].values;let b=vtext(100,32,'Query（查詢）')+vtext(470,32,'Key（鍵）');a.forEach((row,i)=>row.forEach((w,j)=>{if(w>1e-8)b+=vline(170,85+i*80,500,85+j*80,'#7155df',1+w*10)}));for(let i=0;i<3;i++)b+=vnode(135,85+i*80,'Q'+(i+1))+vnode(535,85+i*80,'K'+(i+1));return vsvg('注意力連線圖：線寬對應實際權重',b+vtext(245,285,'線越粗，權重越高；被遮罩的位置不連線',undefined,12))}
function visualBoxes(v,r){const X=x=>230+x*22,Y=y=>35+y*22;let b=`<rect x="${X(0)}" y="${Y(0)}" width="66" height="66" fill="#7155df30" stroke="#7155df" stroke-width="3"/><rect x="${X(v.x)}" y="${Y(v.y)}" width="66" height="66" fill="#15987830" stroke="#159878" stroke-width="3"/>`+vtext(X(0),Y(0)-9,'A（固定）','#7155df')+vtext(X(v.x)+10,Y(v.y)+95,'B（可移動）','#159878');return vsvg('偵測框的交集與聯集',b+vtext(35,276,'交集 = '+vnum(r.metrics[0][1])+'　IoU = '+vnum(r.metrics[1][1])))}
function visualRegression(r){const rows=r.table.rows,xs=rows.map(a=>a[0]),ys=rows.flatMap(a=>[a[1],a[2]]),lo=Math.min(...ys)-1,hi=Math.max(...ys)+1,X=x=>80+(x+2)/5*560,Y=y=>240-(y-lo)/(hi-lo)*190;let b=vline(80,40,80,240,'#aaa')+vline(80,240,665,240,'#aaa')+vtext(35,30,'y')+vtext(670,265,'x')+`<polyline points="${rows.map(a=>X(a[0])+','+Y(a[2])).join(' ')}" fill="none" stroke="#159878" stroke-width="3"/>`;rows.forEach(a=>b+=vline(X(a[0]),Y(a[1]),X(a[0]),Y(a[2]),'#d28529',2,'4 4')+`<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="6" fill="#7155df"/>`);return vsvg('預測、真值與殘差',b+vtext(95,285,'紫點：真值　綠線：六個 X 位置的預測連線　橙色虛線：殘差',undefined,13))}
function visualAutodiff(v,r){let b=vline(85,90,265,135)+vline(85,215,265,135)+vline(295,135,470,135)+vline(500,135,635,135,'#d28529',2,'6 4')+vnode(70,90,'x',v.x)+vnode(70,215,'w,b',v.w+', '+v.b)+vnode(280,135,'z',r.metrics[0][1])+vnode(485,135,'L',r.metrics[1][1])+vnode(650,135,'∂L/∂w',r.metrics[3][1])+vline(640,235,90,235,'#d28529',3,'6 4')+vtext(200,270,'紫線：前向計算　橙色虛線：鏈式法則反向傳遞');return vsvg('前向計算與反向傳播',b)}
function visualTree(v){let b=vline(355,80,160,160,'#159878',3)+vline(355,80,535,160,'#7155df',3)+vline(535,175,440,245,'#159878',3)+vline(535,175,650,245,'#d28529',3);b+=vtext(355,55,'溫度 > '+v.temp+'？',undefined,18,'middle')+vtext(210,110,'是')+vtext(480,110,'否')+vtext(140,175,'陽性','#159878',18,'middle')+vtext(535,160,'電流 > '+v.current+'？',undefined,17,'middle')+vtext(450,215,'是')+vtext(620,215,'否')+vtext(440,270,'陽性','#159878',18,'middle')+vtext(650,270,'陰性','#d28529',18,'middle');return vsvg('決策樹的條件分支',b)}
function visualKnn(v,r){const X=x=>250+(x+2)*22,Y=y=>235-(y+2)*22;let b=vline(65,240,650,240,'#aaa')+vline(65,30,65,240,'#aaa');r.table.rows.forEach((a,i)=>{const c=a[2]==='A'?'#7155df':'#159878';if(i<v.k)b+=vline(X(a[0]),Y(a[1]),X(v.x),Y(v.y),c,2,'4 4');b+=`<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="${i<v.k?10:6}" fill="${c}"/>`+vtext(X(a[0])+13,Y(a[1])+5,a[2])});return vsvg('k-NN 最近鄰與類別投票',b+vtext(X(v.x),Y(v.y),'✦','#d28529',28,'middle')+vtext(90,285,'✦：查詢點　大圓與虛線：最近 k 個鄰居　紫：A　綠：B',undefined,13))}
function visualMetricGrid(v){const cells=[['TP',v.tp,'真陽性'],['FN',v.fn,'假陰性'],['FP',v.fp,'假陽性'],['TN',v.tn,'真陰性']],max=Math.max(1,...cells.map(c=>c[1]));let b=vtext(330,30,'預測正類',undefined,14,'middle')+vtext(540,30,'預測負類',undefined,14,'middle')+vtext(35,110,'真實正類')+vtext(35,205,'真實負類');cells.forEach(([name,value,label],i)=>{let x=215+i%2*210,y=50+Math.floor(i/2)*95;b+=`<rect x="${x}" y="${y}" width="200" height="86" rx="9" fill="rgba(113,85,223,${.1+.6*value/max})"/>`+vtext(x+100,y+34,name+' = '+value,undefined,18,'middle')+vtext(x+100,y+64,label,undefined,13,'middle')});return vsvg('混淆矩陣：真值與預測的四種組合',b+vtext(225,280,'每一格是樣本數；深淺代表同一矩陣內的相對數量',undefined,12))}
function visualGridResult(r){return `<div class="visual-grid-row">${r.grids.map((g,i)=>`<figure>${labGrid(g)}<figcaption>${i===0?'先辨認每個格子的數值與形狀。':i===r.grids.length-1?'本次運算的輸出；可與計算過程逐項核對。':'中間的核、權重或轉換結構。'}</figcaption></figure>`).join('')}</div><p class="visual-caption">格內數字是實際結果；每張圖的深淺依自身數值範圍縮放，跨圖請比較數字。</p>`}
function visualFlow(e,v,r){const labels=(r.steps?.length?r.steps:visualRecipes[e.id]).slice(0,12);return `<div class="visual-flow-map">${labels.map((s,i)=>`<div class="visual-flow-item ${/停止|缺少|未執行|限制|待/.test(s)?'caution':''}"><span>${i+1}</span><b>${vesc(s)}</b></div>`).join('')}</div><p class="visual-caption">編號表示本例的順序；橙色僅標示文字中出現的等待、限制或停止，非真實服務狀態。</p>`}
function visualNumeric(r){const metrics=(r.metrics||[]).filter(a=>typeof a[1]==='number'&&Number.isFinite(a[1]));if(!metrics.length)return '';return `<div class="visual-number-map">${metrics.map(([label,value])=>`<div><span class="visual-number-dot"></span><small>${vesc(label)}</small><strong>${vesc(vnum(value))}</strong></div>`).join('')}</div><p class="visual-caption">各指標可能有不同單位，這裡不以柱高比較。請到下方公式表核對各自的計算。</p>`}
function visualData(e,v,r){if(e.id==='gradient-ascent')return visualAscent(v,r);if(e.id==='calc-vector')return visualVector(v);if(e.id==='graph')return visualGraph(v,r);if(e.id==='calc-activation')return visualActivation(v);if(e.id==='calc-gradient')return visualGradient(v,r,e.id);if(e.id==='calc-metrics')return visualMetricGrid(v);if(e.id==='kmeans')return visualCluster(v,r);if(e.id==='attention')return visualAttention(r)+visualGridResult(r);if(e.id==='boxes')return visualBoxes(v,r);if(e.id==='regression')return visualRegression(r);if(e.id==='autodiff')return visualAutodiff(v,r);if(e.id==='tree')return visualTree(v);if(e.id==='knn')return visualKnn(v,r);if(e.type==='流程模擬')return visualFlow(e,v,r)+visualNumeric(r);if(r.grids?.length)return visualGridResult(r);if(r.series?.length)return labLinePlot(r.series)+'<p class="visual-caption">各條曲線使用同一縱軸；橫軸為步數／索引，非一律代表時間。圖例對應本次結果序列。</p>';if(r.bars?.length)return `<div class="visual-probability">${r.bars.map(b=>`<div><span>${vesc(b.label)}</span><meter min="0" max="1" value="${Math.max(0,Math.min(1,b.value))}"></meter><b>${vesc(vnum(b.value))}</b></div>`).join('')}</div><p class="visual-caption">條長為 0 至 1 的比例視覺；以旁邊原數值與公式說明為準。</p>`;if(r.table?.rows?.length)return `<div class="visual-table-map">${r.table.rows.slice(0,8).map((row,i)=>`<div><span class="visual-table-index">${i+1}</span>${row.slice(0,5).map((value,j)=>`<span><small>${vesc(r.table.headers[j]||'欄位')}</small><b>${vesc(vshort(vnum(value),60))}</b></span>`).join('')}</div>`).join('')}</div><p class="visual-caption">以卡片閱讀表格前 8 筆結果；完整數據與計算過程保留在下方。</p>`;return visualNumeric(r)||visualFlow(e,v,r)}
const visualExpanded=new Map();
function renderVisualGuide(e,v,r,context='lab'){if(e?.id==='knn'&&typeof renderKnnLearning==='function')return renderKnnLearning(e,v,r,context);if(!e||!visualRecipes[e.id])return '';visualContexts.set(context,{e,v,r});const step=visualSteps.get(context)||0;return `<section id="visual-guide-${context}" class="visual-guide visual-compact"><div class="visual-heading"><h2>圖解學習（Visual Learning）</h2><p>調整旁邊的輸入，立即觀察圖形變化。</p></div><details open class="visual-live"><summary>本次結果圖（Live Result Diagram）</summary><div class="visual-data">${visualData(e,v,r)}</div></details><details class="visual-lesson" data-visual-lesson="${context}" ${visualExpanded.get(context)?'open':''}><summary>概念步驟與解說（Step-by-step Guide）</summary>${visualConcept(e,step).replaceAll('CONTEXT',context)}<div class="visual-explanation" aria-live="polite"><b>第 ${step+1} 步：${vesc(visualRecipes[e.id][step])}</b><p>${vesc(visualExplain(e,v,r,step))}</p><button data-visual-next="${context}">${step===3?'回到第一步 ↺':'下一步圖解 →'}</button></div></details><p class="visual-limit">依本實驗的簡化假設繪製；精確數值與完整計算過程列於下方。</p></section>`}
document.addEventListener('toggle',event=>{if(event.target.dataset?.visualLesson)visualExpanded.set(event.target.dataset.visualLesson,event.target.open)},true);
function updateVisualStep(context,step){const d=visualContexts.get(context);if(!d)return;visualSteps.set(context,step);const el=document.querySelector('#visual-guide-'+context);if(el)el.outerHTML=renderVisualGuide(d.e,d.v,d.r,context)}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.visualStep!==undefined)updateVisualStep(b.dataset.visualContext,Number(b.dataset.visualStep));if(b.dataset.visualNext){const c=b.dataset.visualNext;updateVisualStep(c,((visualSteps.get(c)||0)+1)%4)}});
function visualVector(v){const X=x=>360+x*11,Y=y=>155-y*11;let b=vline(205,155,515,155,'#aaa',1)+vline(360,25,360,285,'#aaa',1)+vtext(515,175,'x')+vtext(370,27,'y');for(const [x,y,label,c]of [[v.a1,v.a2,'A','#7155df'],[v.b1,v.b2,'B','#159878']])b+=vline(360,155,X(x),Y(y),c,4)+`<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="${c}"/>`+vtext(X(x)+9,Y(y)-9,label+' ('+x+', '+y+')',c);return vsvg('兩個二維向量的方向與長度',b+vtext(25,292,'同方向向量可能長度不同；點積與餘弦相似度的意義也不同。',undefined,12))}
function visualGraph(v,r){const edges=r.table.rows,nodes=[...new Set(edges.flatMap(a=>[a[0],a[2]]))].slice(0,8),pos=new Map(nodes.map((n,i)=>[n,[360+245*Math.cos(-Math.PI/2+i*2*Math.PI/nodes.length),150+100*Math.sin(-Math.PI/2+i*2*Math.PI/nodes.length)]]));let b='';for(const [a,label,z]of edges){if(!pos.has(a)||!pos.has(z))continue;const [x,y]=pos.get(a),[u,w]=pos.get(z),active=r.steps?.some((n,i)=>n===a&&r.steps[i+1]===z),color=active?'#159878':'#c0b5d8',angle=Math.atan2(w-y,u-x),endX=u-27*Math.cos(angle),endY=w-27*Math.sin(angle);b+=vline(x,y,endX,endY,color,active?4:1.5)+`<path d="M${endX-10*Math.cos(angle-.45)},${endY-10*Math.sin(angle-.45)} L${endX},${endY} L${endX-10*Math.cos(angle+.45)},${endY-10*Math.sin(angle+.45)}" fill="none" stroke="${color}" stroke-width="2"/>`+vtext((x+u)/2,(y+w)/2-9,vshort(label,10),undefined,11,'middle')};nodes.forEach(n=>{const [x,y]=pos.get(n);b+=`<circle cx="${x}" cy="${y}" r="26" fill="white" stroke="${r.steps?.includes(n)?'#159878':'#7155df'}" stroke-width="2"><title>${vesc(n)}</title></circle>`+vtext(x,y+5,vshort(n,9),undefined,12,'middle')});return vsvg('有向知識圖譜與 BFS 找到的路徑',b+vtext(30,291,'箭頭：關係方向　綠線：找到的路徑　最多顯示前 8 個節點；完整資料見結果表',undefined,11))}
function lessonVisualLinks(l){const core=[['learning-plan','capability'],['data-clean','onehot'],['learning-plan','kmeans','qlearning'],['split','cv'],['regression','regression-metrics'],['logistic-contrast','calc-error'],['calc-gradient','optimizer'],['learning-curve','regularization'],['calc-activation','mlp'],['autodiff','calc-clip'],['convolution-grid','calc-conv'],['calc-metrics','threshold'],['tokenizer','embedding'],['attention','attention-cost'],['prompt','serving'],['prompt','json'],['chunking','retrieval','query-evidence'],['calc-lora','quantize','adapt-budget'],['agent-workflow','mcp-tools'],['agent-workflow','guardrails'],['retrieval','query-evidence'],['convolution-grid','release'],['privacy','guardrails'],['capability','ablation']];const ids=l.termIds?.length?l.termIds:(core[l.id]||[]).map(engineId=>labCases.find(t=>t.engineId===engineId)?.id).filter(Boolean);const terms=[...(l.id<24?lessonRecallTerms(l).map(t=>labCases.find(c=>c.id===t.id)).filter(Boolean):[]),...ids.map(id=>labCases.find(t=>t.id===id)).filter(Boolean)],seen=new Set(),items=terms.filter(t=>{if(seen.has(t.engineId))return false;seen.add(t.engineId);return true}).slice(0,3);if(!items.length)return '';return `<section class="lesson-visual"><h3>以圖理解（Learn with Diagrams）</h3><p>開啟圖解案例，點選步驟並調整參數，將本節觀念連結到圖形與計算。</p><div class="lesson-visual-links">${items.map(t=>`<button data-open-lab="${t.id}"><span>◈ ${vesc(t.zh)}</span><small>${vesc(t.en)}</small><b>查看圖解與實驗 →</b></button>`).join('')}</div></section>`}

function visualAscent(v,r){const path=r.ascentPath,lo=Math.min(-1,...path.map(p=>p[0]))-1,hi=Math.max(4,...path.map(p=>p[0]))+1;const value=w=>v.mode==='quadratic'?9-(w-3)**2:v.mode==='likelihood'?v.successes*w-10*(Math.max(w,0)+Math.log1p(Math.exp(-Math.abs(w)))):lsig(w)*v.rewardA+(1-lsig(w))*v.rewardB;const samples=Array.from({length:101},(_,i)=>{const x=lo+(hi-lo)*i/100;return [x,value(x)]}),all=[...samples,...path],low=Math.min(...all.map(p=>p[1])),high=Math.max(...all.map(p=>p[1])),X=x=>55+(x-lo)/(hi-lo)*600,Y=y=>245-(y-low)/(high-low||1)*195;let b=vline(55,45,55,245,'#aaa')+vline(55,245,670,245,'#aaa')+`<polyline points="${samples.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#a797c8" stroke-width="2"/><polyline points="${path.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#159878" stroke-width="2"/>`;path.forEach((p,i)=>b+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${i===0||i===path.length-1?6:3}" fill="${i===0?'#7155df':'#159878'}"/>`);b+=vtext(58,30,'J（最大化目標）')+vtext(550,280,'參數 w／θ')+vtext(55,275,vnum(lo))+vtext(650,265,vnum(hi))+vtext(60,60,vnum(high))+vtext(60,240,vnum(low))+vtext(90,302,'紫：起點　綠：更新軌跡與終點；灰紫：目標曲線',undefined,12);return vsvg('梯度上升的參數與目標軌跡',b)}
