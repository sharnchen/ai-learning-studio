'use strict';

const keywordStudy = (() => {
  const custom = {
  "d7t-roi": [
    "只需要分析或修改影像中的指定範圍。",
    "在 1280 × 640 的圖上，用 (x, y, w, h) = (200, 120, 320, 160) 圈選鞋子附近。",
    "整個 ROI 有 51,200 個像素位置。若只想改鞋子，還要用像素遮罩標出 ROI 內實際修改的位置。"
  ],
  "fluxgloss-01": [
    "把學到的規律用於新輸入。",
    "同一張鞋款參考圖交給視覺模型讀出顏色，交給生成模型則可用於合成新畫面。",
    "先看模型的輸入和輸出，就能區分它在辨識還是在生成。"
  ],
  "fluxgloss-08": [
    "把內容轉成可比較或可傳給後續模型的數值表示。",
    "搜尋時將「黑色細帶涼鞋」和商品描述各轉成向量，再計算相似度。",
    "向量相似代表在該表示空間接近，鞋跟高度等細節仍須核對原文或原圖。"
  ],
  "fluxgloss-15": [
    "從既有影像出發，只修改指定內容。",
    "將黑色鞋款換成銀色款，保留同一張照片的臉部、姿勢和背景。",
    "對照新舊圖的鞋區與其餘區域，可以分別檢查修改和保留是否達標。"
  ],
  "fluxgloss-18": [
    "提供一張影像來約束生成的構圖、外觀或局部內容。",
    "換鞋時，把鞋款照用作外觀條件，並保有人物照片作為編輯起點。",
    "檢查輸出是否沿用鞋款條件中的顏色與構造，條件符合度取決於模型設計。"
  ],
  "fluxgloss-19": [
    "讓多張參考圖各自提供不同資訊。",
    "一張人物照提供姿勢，鞋款正面提供鞋帶形狀，側面提供鞋跟高度。",
    "逐張說明參考圖的用途，再比較輸出是否同時保留三項特徵。"
  ],
  "fluxgloss-21": [
    "用學到的速度場將雜訊推向資料分布。",
    "在一維示意中，把起點 0 與終點 1 用 x(t) = t 連起來，各處的理想速度都是 1。",
    "取樣按速度方向積分。實際模型的速度會隨位置、時間與條件改變。"
  ],
  "fluxgloss-24": [
    "讓較小或較快的學生模型學習教師模型的行為。",
    "讓學生用教師提供的同一批提示與輸出分布學習，再在未見提示上比較效果。",
    "記錄生成品質與延遲，才能看見加速與能力取捨。"
  ],
  "fluxgloss-26": [
    "用矩形表示物體大致位置。",
    "鞋子外接框可寫為左上 (120, 400)、右下 (220, 490)。",
    "框內可含背景和腳趾。需要鞋帶輪廓時，再用分割遮罩。"
  ],
  "fluxgloss-27": [
    "只取出影像中的一塊矩形。",
    "從 1024 × 768 的圖取出 (200, 100) 起算的 320 × 240 區域。",
    "裁切圖原點對回原圖時須加上 (200, 100)。"
  ],
  "fluxgloss-28": [
    "標記哪些像素允許參與處理。",
    "用 1 標記鞋帶、0 標記腳背，讓合成步驟只在鞋帶區採用新像素。",
    "工具可能採相反黑白約定，應先用一小塊區域確認遮罩方向。"
  ],
  "fluxgloss-29": [
    "為像素指定物件或類別。",
    "把一張全身照中的鞋、皮膚與背景各標成不同區域。",
    "檢查鞋帶是否被包含，並用疊圖檢查腳趾有沒有被誤選。"
  ],
  "fluxgloss-30": [
    "用點或方框提示來取得候選物件遮罩。",
    "先用綠框圈出左側鞋子，再以正點標鞋帶、負點排除腳背。",
    "交替比較各候選的覆蓋範圍及邊緣，模型給的分數可作為參考。"
  ],
  "fluxgloss-31": [
    "在分割時改善物件邊界和細部。",
    "用相同方框比較 SAM 與 HQ-SAM 的鞋帶遮罩。",
    "在同一倍率下檢查細帶中斷與腳趾誤選，並以相同標註比較兩者。"
  ],
  "fluxgloss-32": [
    "依透明度混合前景和背景像素。",
    "在常見的線性數值示意中，前景 200、背景 100、α = 0.25，輸出為 0.25 × 200 + 0.75 × 100 = 125。",
    "α = 0 時採背景，α = 1 時採前景。"
  ],
  "fluxgloss-33": [
    "讓遮罩邊界從完全覆蓋平順過渡到透明。",
    "把輪廓邊緣的一圈像素由 0/1 改成漸變的 α 值。",
    "石階式硬邊可能減少，但過寬會讓細鞋帶變淡。"
  ],
  "fluxgloss-34": [
    "用中心較重的鄰域權重平滑資料。",
    "對二值遮罩做高斯模糊後，原本由 0 跳到 1 的邊界變成漸變。",
    "調整 σ 時比較過渡寬度與細小結構是否還能保留。"
  ],
  "fluxgloss-35": [
    "前方物體擋住後方物體的一部分。",
    "裙襬擋住鞋跟上緣，畫面中只能看到鞋跟下半部。",
    "檢查合成順序，裙襬應維持覆蓋鞋子，而遮住的細節無法從原圖直接確認。"
  ],
  "fluxgloss-36": [
    "物件在畫面中的投影會隨視角與距離改變。",
    "將正面鞋款圖套到斜側腳姿時，近側與遠側鞋帶呈現不同寬度和角度。",
    "比對鞋底方向、腳尖形狀與地面接觸點。"
  ],
  "fluxgloss-39": [
    "從影像或其他輸入自動整理提示詞。",
    "視覺模型從鞋照抽出「黑色、細交叉鞋帶、細高跟」，由編輯流程組成提示詞。",
    "將每個描述和參考圖核對，標記遮擋或看不清楚的屬性。"
  ],
  "fluxgloss-40": [
    "把語句所談到的物件對到畫面區域。",
    "模型讀到「畫面左側的鞋」後回傳該鞋的位置。",
    "檢查框落在畫面左側的正確物件，並區分畫面左右與人體左右。"
  ],
  "fluxgloss-41": [
    "把物件特徵拆成可獨立檢查的欄位。",
    "將鞋照整理成顏色＝黑、跟型＝細跟、鞋帶＝交叉。",
    "只填可辨認項目，遮住的鞋跟高度標記為未知。"
  ],
  "fluxgloss-43": [
    "列出輸出必須遵守的邊界或條件。",
    "要求換鞋時保留人物衣服、姿勢和背景，並用遮罩限制編輯區。",
    "分別比對指定修改和原圖保留區，確認每項條件是否通過。"
  ],
  "fluxgloss-45": [
    "提示中有兩項要求不能同時滿足。",
    "同時要求鞋面「純黑」及「純白」，卻沒有指定不同區域。",
    "明確設定優先要求或指定鞋面、鞋底各自的顏色，再比較輸出。"
  ],
  "fluxgloss-46": [
    "在重寫提示或多輪編輯時，目標逐步偏離原需求。",
    "初始要求是「黑色細跟」，多次自動擴寫後變成「厚底黑鞋」。",
    "將每版提示與最初條件逐項比對，找出首次變更的版本。"
  ],
  "fluxgloss-47": [
    "輸出保留參考物件關鍵特徵的程度。",
    "比較鞋帶交叉方式、鞋跟形狀與材質光澤。",
    "把各特徵分開核對，避免整體看起來相似卻改掉款式。"
  ],
  "fluxgloss-49": [
    "讓程式把支援的計算交給 NVIDIA GPU。",
    "在 Colab 用 CUDA 張量進行模型推論，並查看張量與權重所在裝置。",
    "比較 GPU 使用量和延遲，確認實際算子也在 GPU 上執行。"
  ],
  "fluxgloss-51": [
    "保存 CPU 可存取的工作資料與程式狀態。",
    "把部分模型權重從 GPU 卸載到 CPU 時，觀察系統 RAM 上升、GPU 記憶體下降。",
    "分別記錄 RAM 和 VRAM 峰值，確認瓶頸轉移到哪一側。"
  ],
  "fluxgloss-52": [
    "用每個數值 32 位元的格式保存浮點數。",
    "十億個 FP32 權重的純權重容量約 4 GB，以十進位計。",
    "比較模型容量時另外計入中間結果、索引和框架開銷。"
  ],
  "fluxgloss-56": [
    "把部分模型權重或狀態移到 CPU 記憶體。",
    "影像生成時將未執行的子模型移到 CPU，輪到該子模型再移回 GPU。",
    "比較 VRAM 峰值、RAM 峰值和等待時間，確認是否適合設備。"
  ],
  "fluxgloss-60": [
    "取樣器用來逐步更新生成狀態的步數。",
    "固定種子、提示與解析度，分別試 4 步與 8 步。",
    "記錄細節和耗時。品質與步數的關係取決於模型和取樣器。"
  ],
  "fluxgloss-61": [
    "控制生成過程跟隨條件的程度。",
    "在支援 CFG 的同一模型中固定種子，比較不同引導值的鞋款相似度。",
    "同時檢查鞋色、邊緣與過度飽和。不同引導實作的數值不能直接互比。"
  ],
  "fluxgloss-62": [
    "用寬乘高表示影像的像素尺寸。",
    "512 × 512 有 262,144 像素，1024 × 1024 有 1,048,576 像素。",
    "長寬各加倍會讓像素數變成四倍，運算和記憶體仍取決於架構。"
  ]
};
  const walkthroughs = {
  "d1t23": [
    [
      "原始值 x = 80",
      "減訓練平均 70",
      "除以標準差 5"
    ],
    "z = (80 − 70) ÷ 5 = 2。轉換後的值表示比訓練平均高兩個標準差。驗證資料應使用訓練時估出的平均和標準差。"
  ],
  "d2t24": [
    [
      "讀出真類別的機率",
      "取自然對數",
      "加上負號"
    ],
    "真類別機率為 0.8 時，單筆損失為 −ln(0.8) ≈ 0.223。若只有 0.1，損失約 2.303。此簡式適用於單一正確類別的情況。"
  ],
  "d4t20": [
    [
      "前向算出預測",
      "由損失往前求梯度",
      "最佳化器更新參數"
    ],
    "若 y = 2w、L = (y − 6)²，w = 2 時 y = 4，則 ∂L/∂y = −4、∂y/∂w = 2，所以 ∂L/∂w = −8。"
  ],
  "d5t10": [
    [
      "計算目前梯度",
      "乘上學習率",
      "從舊權重減更新量"
    ],
    "L(w) = (w − 3)²，w = 0、學習率 0.1。梯度是 −6，新權重為 0 − 0.1 × (−6) = 0.6。損失從 9 降為 5.76。"
  ],
  "d6t0": [
    [
      "指定正類",
      "交叉對照真值與預測",
      "累計 TP、FP、FN、TN"
    ],
    "若 TP = 8、FP = 2、FN = 4、TN = 16，精確率為 8 ÷ 10 = 80%，召回率為 8 ÷ 12 ≈ 66.7%。兩者回答的問題取決於不同分母。"
  ],
  "d9t9": [
    [
      "Q 與 K 計算點積",
      "除以 √dₖ",
      "Softmax 加權 V"
    ],
    "假設縮放後兩個分數為 [0, ln 3]，Softmax 權重為 [0.25, 0.75]。若對應的 V 為 2 和 6，加權輸出為 5。"
  ],
  "d11t0": [
    [
      "讀取問題",
      "檢索相關文件",
      "用來源生成答案",
      "核對引文"
    ],
    "問題是「保固多久？」時，先找對應型號和版本的手冊，再根據保固條款回答。檢查引用是否同時支持期限與適用條件。"
  ],
  "d12t3": [
    [
      "保留原始權重 W",
      "以低秩矩陣 A、B 學習更新",
      "推論時合成 W 與更新量"
    ],
    "對 1024 × 1024 的權重矩陣，設定秩 r = 8，A、B 共需 8 × (1024 + 1024) = 16,384 個可訓練參數，原矩陣有 1,048,576 個。"
  ],
  "d13t13": [
    [
      "從雜訊取樣",
      "用模型估計更新方向",
      "依排程逐步更新"
    ],
    "以潛在擴散文生圖為例，模型在潛在空間迭代，最後由 VAE Decoder 還原影像。像素空間擴散的設計可以直接在像素空間運算。"
  ],
  "d7t-roi": [
    [
      "在原圖定位鞋區",
      "裁出 ROI",
      "用遮罩限制像素",
      "合成回原座標"
    ],
    "如果 ROI 左上是 (200, 120)，裁切圖的 (10, 20) 對應原圖 (210, 140)。合成時也要套用相同的座標偏移。"
  ]
};

  for (const term of keywordCatalog) {
    const entry = custom[term.id];
    if (!entry) continue;
    const [plain, example, expected] = entry;
    plainKeywordDefinitions[term.id] = plain;
    const action = term.id === 'd7t-roi'
      ? '畫出矩形 ROI，算出像素數，並標出其中允許修改的像素。'
      : expected;
    termPractice[term.zh] = {example, action, expected};
  }

  function summary(term) {
    const plain = plainKeywordDefinitions[term.id] || term.definition;
    const example = termPractice[term.zh]?.example;
    return '<p>' + escapeHtml(plain) + '</p>'
      + (example ? '<p class="keyword-definition"><strong>例子</strong>　' + escapeHtml(example) + '</p>' : '');
  }

  function guide(term, practice) {
    if (!practice) return '';
    const trace = walkthroughs[term.id];
    const flow = trace
      ? '<h3>一步步看輸入與結果</h3><ol class="method-breakdown">'
        + trace[0].map(step => '<li>' + escapeHtml(step) + '</li>').join('')
        + '</ol><p>' + escapeHtml(trace[1]) + '</p>'
      : '';
    const action = practice.action === practice.expected ? ''
      : '<dt><strong>跟著做</strong></dt><dd>' + escapeHtml(practice.action) + '</dd>';
    return '<section class="keyword-section keyword-study-example"><h2>用一個例子理解' + escapeHtml(term.zh) + '</h2>'
      + '<dl><dt><strong>具體情境</strong></dt><dd>' + escapeHtml(practice.example) + '</dd>'
      + action + '<dt><strong>如何核對結果</strong></dt><dd>' + escapeHtml(practice.expected) + '</dd></dl>'
      + flow + '<button type="button" data-keyword-tab="interact">用例題檢查理解 →</button></section>';
  }

  function hasMethod(term) {
    const engine = methodEngine(term);
    return Boolean(engine && methodLessons[engine.id]);
  }

  return {summary, guide, hasMethod, walkthrough:term=>walkthroughs[term.id]};
})();

{
  const originalKeywordExample = keywordExample;
  keywordExample = function (term, practice) {
    const guide = keywordStudy.guide(term, practice);
    if (!keywordStudy.hasMethod(term)) return guide;
    return guide + '<details class="keyword-section"><summary>展開方法、公式與完整算例</summary>'
      + originalKeywordExample(term, practice) + '</details>';
  };
}

/* SVM: dedicated keyword lesson; no changes to navigation or learning-state lifecycle. */
{
  const previousExample = keywordExample;
  const svmTerm = keywordCatalog.find(t=>t.id==='d3t10');
  if(svmTerm){
    svmTerm.definition='監督式分類方法，以最大化分類間隔建立最佳決策邊界；可使用核函數處理非線性資料，並延伸至回歸與異常偵測。';
    plainKeywordDefinitions[svmTerm.id]=svmTerm.definition;
  }
  const eq=s=>'<p style="text-align:center;font-size:1.1em;overflow-wrap:anywhere">'+(window.katex?katex.renderToString(s,{throwOnError:false,displayMode:true}):escapeHtml(s))+'</p>';
  const table=(headers,rows)=>'<table style="width:100%;table-layout:fixed;overflow-wrap:anywhere;border-collapse:collapse;border:1.5px solid #8f96a3;margin:1.2rem 0"><thead><tr>'+headers.map(x=>'<th style="border:1.5px solid #8f96a3;padding:.7rem .8rem;background:#e9eef7;color:#172640;text-align:center;vertical-align:middle;font-weight:700">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td style="border:1.5px solid #8f96a3;padding:.7rem .8rem;vertical-align:middle;line-height:1.7">'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const sec=(n,title,body)=>(n>1?'<hr class="svm-section-divider" style="border:0;border-top:1px solid var(--line, #b7bdc9);margin:2rem 0" aria-hidden="true">':'')+'<section class="keyword-section" style="padding-block:0.5rem"><h2>'+n+'. '+title+'</h2>'+body+'</section>';
  const svg=(body)=>'<svg viewBox="0 0 360 220" role="img" aria-label="SVM 分類幾何示意" style="width:100%;height:auto;max-width:620px;display:block;margin:auto">'+body+'</svg>';
  const points=(arr,c)=>arr.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+c+'"/>').join('');
  const line=(x,c,d='')=>'<path d="M'+x+' 15V190" stroke="'+c+'" stroke-width="2" '+(d?'stroke-dasharray="5 4"':'')+'/>';
  const diagram=svg('<rect x="135" y="15" width="90" height="175" fill="#159878" opacity=".12"/>'+line(135,'#3974bd',1)+line(180,'#159878')+line(225,'#d34c50',1)+points([[65,45],[90,100],[55,145],[135,65],[135,155]],'#3974bd')+points([[225,45],[225,145],[270,65],[290,110],[305,165]],'#d34c50')+'<g fill="none" stroke="currentColor">'+[[135,65],[135,155],[225,45],[225,145]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="9"/>').join('')+'</g><path d="M135 115H225" stroke="#a66c19"/><text x="180" y="109" text-anchor="middle" fill="#a66c19">Margin</text><g font-size="12" fill="currentColor" text-anchor="middle"><text x="135" y="208">f = −1</text><text x="180" y="208">f = 0</text><text x="225" y="208">f = +1</text></g>');
  const inputs=(kind,items)=>'<div data-svm-lab="'+kind+'" style="max-width:700px">'+items.map(([id,label,min,max,step,val])=>'<label style="display:block;margin:.6rem 0">'+label+' <output data-svm-value="'+id+'">'+val+'</output><input style="display:block;width:100%" type="range" data-svm-param="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"></label>').join('')+'<div data-svm-result aria-live="polite"></div></div>';
  const qs=[
    ['SVM 的主要最佳化目標？',['最大化權重','最大化分類間隔','增加網路層數'],1,'最大間隔等價於在限制下最小化權重範數。'],
    ['哪些點直接參與核 SVM 預測？',['所有資料等權重','平均點','支持向量'],2,'支持向量的對偶係數非零。'],
    ['Kernel Trick 的用途？',['隱式計算高維內積','降低輸入維度','不需訓練'],0,'不必顯式建立映射後向量。'],
    ['C 增大通常代表？',['降低違反間隔懲罰','提高違反間隔懲罰','取消核函數'],1,'C 大時更重視訓練間隔損失。'],
    ['RBF Gamma 過大可能造成？',['過度擬合','必定線性','特徵消失'],0,'局部影響範圍縮小，邊界可能變複雜。'],
    ['權重範數為 2，完整間隔為？',['0.5','1','4'],1,'2 / 2 = 1。'],
    ['連續值預測使用？',['SVC','PCA','SVR'],2,'SVR 為支持向量回歸。']
  ];
  function svmLesson(){
    return '<div class="svm-lesson">'+
    sec(1,'基本原理與重要名詞','<p>有許多條直線能分開兩類資料，SVM 尋找離最近資料點最遠的決策邊界（Maximum Margin Classification）。圈出的點是支持向量（Support Vector），綠線是決策超平面（Hyperplane），虛線間為完整分類間隔（Margin）。</p>'+diagram+table(['名詞','意義'],[['Decision Boundary','分類分界'],['Kernel Function','特徵空間內積'],['Slack Variable','違反間隔程度'],['Regularization','限制模型複雜度']]))+
    sec(2,'超平面與分類函數','<p>一維的超平面是點，二維是直線，三維是平面，n 維為 n−1 維仿射空間。</p>'+eq('f(\\mathbf x)=\\mathbf w^T\\mathbf x+b')+'<p>x 為輸入特徵，w 為超平面法向量，b 為偏差，T 為轉置。f 正值預測 +1、負值預測 −1、零為邊界。</p>'+eq('\\begin{aligned}f(3,2)&=2(3)+1(2)-6\\\\&=6+2-6=2\\end{aligned}')+'<p>例如 w=(2,1)、b=−6，輸入 (3,2) 判為 +1。</p>')+
    sec(3,'互動實驗：權重、偏差、輸入點',inputs('plane',[['w1','w₁',-4,4,.5,2],['w2','w₂',-4,4,.5,1],['b','b',-20,10,.5,-6],['x1','x₁',0,6,.1,3],['x2','x₂',0,6,.1,2]])+'<p>此處手動調整決策函數，並非重新訓練 SVM。</p>')+
    sec(4,'最大間隔與數學推導',eq('d=\\frac{|\\mathbf w^T\\mathbf x_0+b|}{\\|\\mathbf w\\|}')+eq('\\|\\mathbf w\\|=\\sqrt{\\sum_j w_j^2}')+'<p>x₀ 為任意點，d 為垂直距離。將正負兩側邊界正規化為 f=+1 和 f=−1，各離中心 1/||w||。</p>'+eq('M=\\frac{1}{\\|\\mathbf w\\|}+\\frac{1}{\\|\\mathbf w\\|}=\\frac{2}{\\|\\mathbf w\\|}')+eq('\\max M\\iff\\min_{\\mathbf w,b}\\frac12\\|\\mathbf w\\|^2')+'<p>M 為完整間隔。平方與 1/2 讓微分簡潔；最大間隔有助於泛化，但不保證測試表現。</p>')+
    sec(5,'Hard Margin SVM（硬間隔）',eq('\\min_{\\mathbf w,b}\\frac12\\|\\mathbf w\\|^2')+eq('y_i(\\mathbf w^T\\mathbf x_i+b)\\ge1,\\quad i=1,\\ldots,N')+'<p>i 為樣本索引，N 為樣本數，yᵢ 為 ±1 標籤。硬間隔需要資料完全線性可分，對離群值敏感。</p>')+
    sec(6,'Soft Margin SVM（軟間隔）',eq('y_i f(\\mathbf x_i)\\ge1-\\xi_i,\\quad\\xi_i\\ge0')+eq('\\min_{\\mathbf w,b,\\boldsymbol\\xi}\\left(\\frac12\\|\\mathbf w\\|^2+C\\sum_i\\xi_i\\right)')+'<p>ξᵢ 是第 i 筆樣本鬆弛變數，C>0 是間隔損失懲罰係數。</p>'+table(['最小可行 ξ','意義'],[['0','正確且在間隔邊界上或外'],['0 < ξ < 1','正確但在間隔內'],['1','位於決策邊界'],['> 1','分類錯誤']])+table(['參數','C 小','C 大'],[['正則化','較強','較弱'],['間隔','傾向寬','傾向窄'],['風險','欠擬合','過度擬合']]))+
    sec(7,'Hinge Loss（合頁損失）',eq('L=\\max(0,1-yf(\\mathbf x))')+eq('\\min_{\\mathbf w,b}\\frac12\\|\\mathbf w\\|^2+C\\sum_i\\max(0,1-y_i f(\\mathbf x_i))')+'<p>令 z=yf(x)；z≥1 無損失，0<z<1 正確但有間隔損失，z<0 分類錯誤。</p>'+inputs('hinge',[['z','z = y f(x)',-2,4,.1,.5]]))+
    sec(8,'Kernel Trick（核技巧）','<p>中心與外圍的資料無法用直線區分。映射到高維後可使用超平面。</p>'+svg('<circle cx="100" cy="100" r="62" fill="none" stroke="#159878" stroke-width="2"/>'+points([[80,90],[110,115],[95,70]],'#3974bd')+points([[100,25],[175,100],[100,175],[25,100]],'#d34c50')+'<path d="M185 100H210" stroke="currentColor"/><path d="M225 110L275 80L340 110L290 140Z" fill="#159878" opacity=".3"/>'+points([[250,45],[285,40],[315,60]],'#d34c50')+points([[260,155],[280,175],[315,160]],'#3974bd')+'<g fill="currentColor" font-size="12"><text x="35" y="210">二維圓形邊界</text><text x="220" y="210">高維平面</text></g>')+eq('\\phi(\\mathbf x)=(x_1,x_2,x_1^2+x_2^2)')+'<p>φ 是映射函數。點 (1,1) 映射後高度為 2，(3,4) 高度為 25。平面 z=9 對應原始空間半徑 3 的圓。</p>'+inputs('mapping',[['x','x₁',-4,4,.5,2],['y','x₂',-4,4,.5,1],['r','半徑 r',1,4,.5,3]])+eq('K(\\mathbf x_i,\\mathbf x_j)=\\phi(\\mathbf x_i)^T\\phi(\\mathbf x_j)')+'<p>核技巧直接計算映射空間內積，不必顯式建立高維向量。</p>')+
    sec(9,'常見核函數',table(['Kernel','公式與用途'],[['Linear',eq('x_i^Tx_j')+'線性或高維稀疏文字資料'],['Polynomial',eq('(\\gamma x_i^Tx_j+r)^d')+'特徵交互作用'],['RBF / Gaussian',eq('e^{-\\gamma\\|x_i-x_j\\|^2}')+'非線性分類'],['Sigmoid',eq('\\tanh(\\gamma x_i^Tx_j+r)')+'並非所有參數都形成有效正半定核']])+'<p>γ 為尺度係數，r 為常數偏移，d 為多項式次數；RBF 輸出在 (0,1]，越近越接近 1。</p>')+
    sec(10,'Gamma 互動實驗',eq('K=e^{-\\gamma d^2}')+'<p>此處 d 為兩點歐氏距離。Gamma 小影響範圍廣、邊界較平滑；Gamma 大影響範圍窄，可能過度擬合。</p>'+inputs('rbf',[['gamma','Gamma γ',.1,5,.1,1],['d','距離 d',0,5,.1,1.5]]))+
    sec(11,'模型訓練：Lagrange、Dual、KKT',eq('\\mathcal L=\\frac12\\|w\\|^2-\\sum_i\\alpha_i[y_i(w^Tx_i+b)-1]')+'<p>αᵢ≥0 為拉格朗日乘數。</p>'+eq('\\frac{\\partial\\mathcal L}{\\partial w}=w-\\sum_i\\alpha_i y_ix_i=0')+eq('\\frac{\\partial\\mathcal L}{\\partial b}=-\\sum_i\\alpha_i y_i=0')+eq('w=\\sum_i\\alpha_i y_ix_i')+eq('\\max_\\alpha\\left[\\sum_i\\alpha_i-\\frac12\\sum_{i,j}\\alpha_i\\alpha_j y_iy_jK(x_i,x_j)\\right]')+'<p>限制：Σαᵢyᵢ=0；Hard Margin αᵢ≥0，Soft Margin 0≤αᵢ≤C。KKT 互補鬆弛：硬間隔 αᵢ[yᵢf(xᵢ)−1]=0。αᵢ>0 的樣本為支持向量。</p>'+eq('f(x)=\\sum_{i\\in SV}\\alpha_i y_iK(x_i,x)+b')+'<p>SV 為支持向量索引集合。常用 QP、SMO 等凸最佳化求解。</p>')+
    sec(12,'訓練流程與多類別','<p>訓練資料 → 分割訓練/測試 → 標準化 → 選 Kernel、C、Gamma → 求解凸最佳化 → 得到支持向量與係數 → 決策函數 → 預測。</p>'+table(['方法','分類器數量','10 類'],[['OvR（One vs Rest）','k','10'],['OvO（One vs One）','k(k−1)/2','45']])+'<p>k 是類別數。scikit-learn SVC 內部採 OvO 訓練，預設可輸出 OvR 形式決策分數。</p>')+
    sec(13,'Python / Colab 實作','<p>非線性月牙資料：比較 linear、poly、rbf、sigmoid。程式輸出準確率、支持向量、分類圖與混淆矩陣。</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>'+escapeHtml('import numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.datasets import make_moons\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nfrom sklearn.metrics import accuracy_score, ConfusionMatrixDisplay\n\nC, GAMMA, KERNEL = 1.0, 1.0, "rbf"\nX, y = make_moons(n_samples=300, noise=0.15, random_state=42)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=.2, random_state=42, stratify=y)\nmodel = make_pipeline(StandardScaler(), SVC(C=C, gamma=GAMMA, kernel=KERNEL))\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)\nsvm = model.named_steps["svc"]\nprint("Accuracy:", accuracy_score(y_test, y_pred))\nprint("Support vectors:", svm.n_support_)\nxx, yy = np.meshgrid(np.linspace(X[:,0].min()-.5,X[:,0].max()+.5,300),np.linspace(X[:,1].min()-.5,X[:,1].max()+.5,300))\nZ = model.decision_function(np.c_[xx.ravel(),yy.ravel()]).reshape(xx.shape)\nplt.contourf(xx,yy,Z,levels=[-np.inf,0,np.inf],cmap="coolwarm",alpha=.18)\nplt.contour(xx,yy,Z,levels=[-1,0,1],colors=["blue","green","red"])\nplt.scatter(*X_train.T,c=y_train,cmap="coolwarm",s=20)\nplt.scatter(*X_test.T,c=y_test,cmap="coolwarm",marker="x")\nplt.scatter(*X_train[svm.support_].T,s=100,facecolors="none",edgecolors="black")\nplt.show()\nConfusionMatrixDisplay.from_predictions(y_test,y_pred)\nplt.show()')+'</code></pre><p>fit 訓練、predict 預測、decision_function 決策分數；support_ 是樣本索引，support_vectors_ 為標準化後特徵，n_support_ 為各類數量，dual_coef_ 為對偶係數。</p>')+
    sec(14,'特徵標準化',eq("x'=\\frac{x-\\mu}{\\sigma}")+'<p>μ 與 σ 為訓練資料平均與標準差。年收入與年齡的尺度差異可能讓收入主導距離；標準化能減少此問題。應先分割資料，只用訓練集估計標準化參數以避免 Data Leakage。</p>')+
    sec(15,'SVC、SVR、One-Class SVM',table(['模型','用途'],[['SVC','分類'],['SVR','連續值回歸'],['One-Class SVM','異常/新穎性偵測']])+eq('L_\\varepsilon=\\max(0,|y-f(x)|-\\varepsilon)')+'<p>ε 是 SVR 容許誤差範圍。</p>')+
    sec(16,'比較與應用',table(['模型','核心','非線性'],[['SVM','最大間隔','核函數'],['Logistic Regression','機率','特徵轉換'],['Decision Tree','條件分割','支援'],['Neural Network','多層特徵轉換','支援']])+'<p>核 SVM 訓練成本隨資料量增加，通常適合小中型資料集；線性 SVM 適合高維稀疏資料。SVC 預設不輸出機率。</p>'+table(['應用','特徵'],[['工業品檢','影像、尺寸、顏色'],['汽車電子異常','電壓、溫度、錯誤計數'],['預防維護','振動、頻譜、轉速'],['文字分類','TF-IDF'],['影像分類','HOG、CNN 特徵']]))+
    sec(17,'自我測驗（Self-Assessment）','<div data-svm-quiz>'+qs.map(([q,a,c,e],i)=>'<fieldset style="margin:1rem 0"><legend>'+(i+1)+'. '+q+'</legend>'+a.map((x,j)=>'<label style="display:block"><input type="radio" name="svm-q-'+i+'" value="'+j+'"> '+x+'</label>').join('')+'<p data-svm-feedback="'+i+'"></p></fieldset>').join('')+'<button type="button" data-svm-grade>批改答案</button> <button type="button" data-svm-reset>重新測驗</button><p data-svm-score aria-live="polite"></p></div>')+
    sec(18,'核心公式與觀念總結','<p>Hyperplane 建立分類邊界；Maximum Margin 尋找最大間隔；Support Vector 決定預測函數；Kernel Trick 處理非線性。C 控制違反間隔的懲罰，Gamma 控制 RBF 影響範圍。</p>'+eq('M=2/\\|w\\|,\\quad L=\\max(0,1-yf(x))')+'<button type="button" data-keyword-tab="interact">進入原有互動學習 →</button>')+'</div>';
  }
  keywordExample=function(term,practice){
    if(term.id!=='d3t10')return previousExample(term,practice);
    return svmLesson();
  };
  const summaryOriginal=keywordStudy.summary;
  keywordStudy.summary=function(term){return term.id==='d3t10'?'<p>'+escapeHtml(term.definition)+'</p><p>完整原理、最大間隔推導、核函數、四個互動實驗與 Python 範例。</p>':summaryOriginal(term);};
  function svmUpdate(lab){
    const v={};lab.querySelectorAll('[data-svm-param]').forEach(el=>{v[el.dataset.svmParam]=Number(el.value);lab.querySelector('[data-svm-value="'+el.dataset.svmParam+'"]').textContent=el.value});
    const out=lab.querySelector('[data-svm-result]'),fmt=x=>Number(x.toFixed(4)),kind=lab.dataset.svmLab;
    if(kind==='plane'){
      const {w1,w2,b,x1,x2}=v,n=Math.hypot(w1,w2),f=w1*x1+w2*x2+b;
      if(!n){out.textContent='權重向量不可全部為零。';return}
      const X=x=>30+30*x,Y=y=>190-30*y;
      const lines=[-1,0,1].map(k=>Math.abs(w2)>=Math.abs(w1)?'<line x1="30" y1="'+Y((k-b)/w2)+'" x2="210" y2="'+Y((k-b-6*w1)/w2)+'" stroke="'+(k===0?'#159878':k<0?'#3974bd':'#d34c50')+'" stroke-width="2" stroke-dasharray="'+(k===0?'none':'5 4')+'"/>':'<line x1="'+X((k-b)/w1)+'" y1="190" x2="'+X((k-b-6*w2)/w1)+'" y2="10" stroke="'+(k===0?'#159878':k<0?'#3974bd':'#d34c50')+'" stroke-width="2" stroke-dasharray="'+(k===0?'none':'5 4')+'"/>').join('');
      out.innerHTML=svg('<svg x="30" y="10" width="180" height="180" viewBox="30 10 180 180" overflow="hidden">'+lines+'<circle cx="'+X(x1)+'" cy="'+Y(x2)+'" r="6" fill="'+(f>=0?'#d34c50':'#3974bd')+'"/></svg><path d="M30 10V190H210" stroke="currentColor" fill="none"/><text x="215" y="205" fill="currentColor">x₁</text><text x="10" y="15" fill="currentColor">x₂</text>')+'<p>f = ('+w1+') × '+x1+' + ('+w2+') × '+x2+' + ('+b+') = '+fmt(f)+'</p><p>分類：'+(Math.abs(f)<1e-9?'邊界':f>0?'+1':'−1')+'；垂直距離 '+fmt(Math.abs(f)/n)+'；完整間隔 '+fmt(2/n)+'</p>';
    }else if(kind==='hinge'){
      const loss=Math.max(0,1-v.z),x=30+(v.z+2)*45,y=190-loss*50;
      out.innerHTML=svg('<path d="M30 10V190H300" stroke="currentColor" fill="none"/><path d="M30 40L165 190H300" stroke="#159878" stroke-width="2" fill="none"/><circle cx="'+x+'" cy="'+y+'" r="6" fill="#d97706"/><text x="300" y="209" fill="currentColor">z</text>')+'<p>L = max(0, 1 − ('+v.z+')) = '+fmt(loss)+'</p>';
    }else if(kind==='mapping'){
      const z=v.x*v.x+v.y*v.y,threshold=v.r*v.r;
      out.innerHTML=svg('<path d="M20 100H200M110 10V190" stroke="currentColor" opacity=".5"/><circle cx="110" cy="100" r="'+(v.r*20)+'" stroke="#159878" fill="#159878" fill-opacity=".1"/><circle cx="'+(110+20*v.x)+'" cy="'+(100-20*v.y)+'" r="5" fill="'+(z>threshold?'#d34c50':'#3974bd')+'"/><path d="M230 190V10" stroke="currentColor"/><rect x="255" y="'+(190-z*5)+'" width="40" height="'+z*5+'" fill="#3974bd"/><path d="M235 '+(190-threshold*5)+'H320" stroke="#159878" stroke-dasharray="5 4"/>')+'<p>z = '+v.x+'² + '+v.y+'² = '+fmt(z)+'；r² = '+fmt(threshold)+'；'+(z===threshold?'邊界':z>threshold?'外圍類別':'中心類別')+'</p>';
    }else{
      const k=Math.exp(-v.gamma*v.d*v.d),curve=Array.from({length:101},(_,i)=>(30+i*2.8)+','+(190-170*Math.exp(-v.gamma*(i*.05)**2))).join(' ');
      out.innerHTML=svg('<path d="M30 10V190H310" stroke="currentColor" fill="none"/><polyline points="'+curve+'" stroke="#159878" stroke-width="2" fill="none"/><circle cx="'+(30+56*v.d)+'" cy="'+(190-170*k)+'" r="5" fill="#d97706"/>')+'<p>K = exp(−'+v.gamma+' × '+v.d+'²) = '+k.toFixed(6)+'（核相似度，非機率）</p>';
    }
  }
  document.addEventListener('input',e=>{if(e.target.matches('[data-svm-param]'))svmUpdate(e.target.closest('[data-svm-lab]'));});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-svm-grade],[data-svm-reset]');if(!b)return;
    const quiz=b.closest('[data-svm-quiz]');if(!quiz)return;
    if(b.hasAttribute('data-svm-reset')){quiz.querySelectorAll('input').forEach(i=>i.checked=false);quiz.querySelectorAll('[data-svm-feedback],[data-svm-score]').forEach(p=>p.textContent='');return}
    let count=0;qs.forEach(([q,a,c,ex],i)=>{const selected=quiz.querySelector('input[name="svm-q-'+i+'"]:checked'),correct=selected&&Number(selected.value)===c;if(correct)count++;quiz.querySelector('[data-svm-feedback="'+i+'"]').textContent=(correct?'正確：':'正解：'+a[c]+'。')+ex;});quiz.querySelector('[data-svm-score]').textContent='得分：'+count+' / '+qs.length+'（'+Math.round(100*count/qs.length)+' 分）';
  });
  // Initialize only the new lesson when it is inserted; no continuous observer or navigation changes.
  const originalRender=renderKeyword;
  renderKeyword=function(){originalRender.apply(this,arguments);document.querySelectorAll('#keyword-body [data-svm-lab]').forEach(svmUpdate);};
}

/* RNN dedicated glossary lesson. */
{
 const previousExample=keywordExample, previousSummary=keywordStudy.summary, previousRender=renderKeyword;
 const id='d8t13', term=keywordCatalog.find(t=>t.id===id);
 if(term){term.definition='循環神經網路（RNN）使用共享權重，將前一時間步隱藏狀態與目前輸入結合，以學習序列中的時間關聯。';plainKeywordDefinitions[id]=term.definition;}
 const eq=s=>'<div style="text-align:center;margin:1rem 0;max-width:100%;overflow-wrap:anywhere">'+(window.katex?katex.renderToString(s,{throwOnError:false,displayMode:true,output:'html'}):escapeHtml(s))+'</div>';
 const table=(headers,rows)=>'<table style="width:100%;table-layout:fixed;overflow-wrap:anywhere;border-collapse:collapse;border:1.5px solid #8f96a3;margin:1.2rem 0"><thead><tr>'+headers.map(x=>'<th style="border:1.5px solid #8f96a3;padding:.65rem;background:#e9eef7;color:#172640;text-align:center">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td style="border:1.5px solid #8f96a3;padding:.65rem;vertical-align:middle;line-height:1.7">'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const sec=(n,title,body)=>(n>1?'<hr style="border:0;border-top:1px solid #b7bdc9;margin:2rem 0">':'')+'<section class="keyword-section" style="min-width:0;padding-block:.5rem"><h2>'+n+'. '+title+'</h2>'+body+'</section>';
 const svg=(body,h=200)=>'<svg viewBox="0 0 640 '+h+'" role="img" aria-label="RNN 教學圖解" style="display:block;width:100%;height:auto;max-width:760px;margin:1rem auto">'+body+'</svg>';
 const rect=(x,y,w,h,label,color='#0d9488')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="'+color+'" fill-opacity=".12" stroke="'+color+'"/><text x="'+(x+w/2)+'" y="'+(y+h/2+5)+'" text-anchor="middle" font-size="15" fill="currentColor">'+label+'</text>';
 const arrow=(x,y,a,b,color='#0d9488')=>{const angle=Math.atan2(b-y,a-x);return '<path d="M'+x+' '+y+'L'+a+' '+b+' M'+(a-8*Math.cos(angle-.5))+' '+(b-8*Math.sin(angle-.5))+'L'+a+' '+b+'L'+(a-8*Math.cos(angle+.5))+' '+(b-8*Math.sin(angle+.5))+'" stroke="'+color+'" stroke-width="1.8" fill="none"/>'};
 const sequence=(values=[1,2,3,4],states=null)=>svg(values.map((v,i)=>{const x=35+i*150;return rect(x,85,110,45,'h'+(i+1)+(states?' = '+states[i].toFixed(4):''))+rect(x,160,110,32,'x'+(i+1)+' = '+v,'#3974bd')+rect(x,10,110,32,'y'+(i+1),'#d97706')+arrow(x+55,160,x+55,130,'#3974bd')+arrow(x+55,85,x+55,42,'#d97706')+(i<values.length-1?arrow(x+110,107,x+150,107):'')}).join('')+arrow(2,107,35,107));
 const flow=labels=>svg(labels.map((l,i)=>rect(110,10+i*60,420,42,l,i===labels.length-1?'#d97706':'#0d9488')+(i<labels.length-1?arrow(320,52+i*60,320,70+i*60):'')).join(''),labels.length*60);
 const lab=(kind,items)=>'<div data-rnn-lab="'+kind+'" style="max-width:760px">'+items.map(([key,label,min,max,step,v])=>'<label style="display:block;margin:.65rem 0">'+label+'：<output data-rnn-value="'+key+'">'+v+'</output><input type="range" data-rnn-param="'+key+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'" style="display:block;width:100%"></label>').join('')+'<button type="button" data-rnn-reset>重設實驗</button><div data-rnn-result aria-live="polite"></div></div>';
 const chart=(series,min,max,xlabel,ylabel)=>{const X=i=>48+i*550/Math.max(1,series.length-1),Y=v=>165-(v-min)*140/(max-min||1);return svg('<path d="M48 20V165H598" fill="none" stroke="currentColor"/>'+[0,.25,.5,.75,1].map(t=>'<path d="M48 '+Y(min+t*(max-min))+'H598" stroke="currentColor" opacity=".12"/><text x="43" y="'+(Y(min+t*(max-min))+4)+'" text-anchor="end" font-size="10" fill="currentColor">'+Number((min+t*(max-min)).toPrecision(3))+'</text>').join('')+'<polyline points="'+series.map((v,i)=>X(i)+','+Y(v)).join(' ')+'" fill="none" stroke="#0d9488" stroke-width="2.5"/><text x="320" y="191" text-anchor="middle" font-size="13" fill="currentColor">'+xlabel+'</text><text x="50" y="12" font-size="12" fill="currentColor">'+ylabel+'</text>')};
 const code=String.raw`import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn

# 1. 實驗參數
MODEL_TYPE = "RNN"  # RNN / LSTM / GRU
SEQ_LEN = 20
HIDDEN_SIZE = 32
NUM_LAYERS = 1
EPOCHS = 200
LR = 0.01
torch.manual_seed(42)
np.random.seed(42)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", device)

# 2. 建立正弦波時間序列
time = np.linspace(0, 30, 600)
data = np.sin(time).astype(np.float32)
X, Y = [], []
for i in range(len(data) - SEQ_LEN):
    X.append(data[i:i + SEQ_LEN])
    Y.append(data[i + SEQ_LEN])
X = torch.tensor(np.array(X, dtype=np.float32)).unsqueeze(-1).to(device)
Y = torch.tensor(np.array(Y, dtype=np.float32)).unsqueeze(-1).to(device)

# 3. 依時間順序分割
split = int(len(X) * 0.8)
X_train, X_test = X[:split], X[split:]
Y_train, Y_test = Y[:split], Y[split:]

# 4. 建立模型
class SequenceModel(nn.Module):
    def __init__(self):
        super().__init__()
        cell = {"RNN": nn.RNN, "LSTM": nn.LSTM, "GRU": nn.GRU}[MODEL_TYPE]
        self.rnn = cell(input_size=1, hidden_size=HIDDEN_SIZE,
                        num_layers=NUM_LAYERS, batch_first=True)
        self.fc = nn.Linear(HIDDEN_SIZE, 1)

    def forward(self, x):
        out, state = self.rnn(x)
        return self.fc(out[:, -1, :])

model = SequenceModel().to(device)
print(model)
print("Parameters:", sum(p.numel() for p in model.parameters() if p.requires_grad))
print("Input shape:", X_train.shape)

# 5. Loss 與 Optimizer
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)
loss_history = []

# 6. 模型訓練
for epoch in range(EPOCHS):
    model.train()
    pred = model(X_train)
    loss = criterion(pred, Y_train)
    optimizer.zero_grad()
    loss.backward()
    nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
    loss_history.append(loss.item())
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS} | Loss: {loss.item():.6f}")

# 7. 單步預測評估
model.eval()
with torch.no_grad():
    prediction = model(X_test)
    test_loss = criterion(prediction, Y_test)
print("Test MSE:", test_loss.item())
prediction = prediction.cpu().numpy().ravel()
actual = Y_test.cpu().numpy().ravel()

# 8. 訓練 Loss
plt.figure(figsize=(10, 4))
plt.plot(loss_history)
plt.title(f"{MODEL_TYPE} Training Loss")
plt.xlabel("Epoch")
plt.ylabel("MSE Loss")
plt.grid()
plt.show()

# 9. 預測結果
plt.figure(figsize=(12, 4))
plt.plot(actual, label="Actual")
plt.plot(prediction, "--", label="Prediction")
plt.title(f"{MODEL_TYPE} Time Series Prediction")
plt.xlabel("Time Step")
plt.ylabel("Value")
plt.legend()
plt.grid()
plt.show()
`;
 const qs=[
 ['RNN 和前饋網路主要差異？',['不需要權重','傳遞前一隱藏狀態','只能處理圖片','不需要訓練'],1,'Hidden State 傳遞歷史資訊。'],
 ['歷史狀態轉換的權重？',['Wₓₕ','Wₕᵧ','Wₕₕ','bᵧ'],2,'Wₕₕ 負責循環狀態轉換。'],
 ['序列長度增加時，模型參數？',['維持不變','加倍','指數增加','減少'],0,'各時間步共享權重。'],
 ['RNN 的梯度計算方法？',['K-means','PCA','NMS','BPTT'],3,'沿時間展開的計算圖反向傳播。'],
 ['每步梯度乘 0.5，連乘 20 次？',['梯度爆炸','梯度消失','梯度固定','參數增加'],1,'0.5²⁰ 約為 9.54×10⁻⁷。'],
 ['LSTM 哪個閘門控制舊記憶？',['Forget Gate','Input Gate','Output Gate','Softmax'],0,'遺忘閘門決定保留比例。'],
 ['GRU 與 LSTM 的主要差異？',['無權重','無隱藏狀態','無獨立 Cell State，使用兩個閘門','不能處理序列'],2,'GRU 使用 Reset 與 Update Gate。'],
 ['整句情緒分類適合？',['One to Many','Many to One','Many to Many','不能使用 RNN'],1,'多個輸入對應一個分類結果。'],
 ['Gradient Clipping 主要改善？',['資料洩漏','特徵不足','梯度消失','梯度爆炸'],3,'裁剪過大梯度範數。'],
 ['單偏差 RNN，D=3、H=4，不含輸出層參數？',['12','16','32','48'],2,'HD+H²+H=12+16+4=32。']
 ];
 const quiz=()=>'<div data-rnn-quiz>'+qs.map(([q,a,c,e],i)=>'<fieldset style="margin:1rem 0"><legend>'+(i+1)+'. '+q+'</legend>'+a.map((v,j)=>'<label style="display:block"><input type="radio" name="rnn-q-'+i+'" value="'+j+'"> '+v+'</label>').join('')+'<p data-rnn-feedback="'+i+'"></p></fieldset>').join('')+'<button type="button" data-rnn-grade>批改答案</button> <button type="button" data-rnn-quiz-reset>重新測驗</button><p data-rnn-score aria-live="polite"></p></div>';
 function lesson(){
 const base=[1,2,3].reduce((a,x)=>[...a,Math.tanh(.5*x+.8*(a.at(-1)||0)+.1)],[]);
 return '<div class="rnn-lesson" style="min-width:0">'+
 sec(1,'為什麼需要 RNN？','<p>「我今天心情很好」與「我今天心情不好」的意義依賴上下文。一般獨立處理各詞的前饋網路沒有跨時間步的狀態；RNN 使用 Hidden State 使相同輸入在不同歷史下可能得到不同輸出。</p>'+sequence(['我','今天','心情','很好'])+'<p>目前狀態 = f(目前輸入, 過去狀態)。適用文字、語音、時間序列等有順序的資料。</p>')+
 sec(2,'循環架構與時間展開',svg(rect(260,65,120,55,'RNN Cell')+rect(280,145,80,35,'xₜ','#3974bd')+rect(280,5,80,35,'yₜ','#d97706')+arrow(320,145,320,120,'#3974bd')+arrow(320,65,320,40,'#d97706')+'<path d="M380 77H430Q460 77 460 110Q460 135 430 135H390V110" stroke="#0d9488" stroke-width="2" fill="none"/>'+arrow(390,110,380,110)+'<text x="475" y="110" fill="currentColor" font-size="15">hₜ₋₁ → hₜ</text>')+sequence()+'<p>時間展開圖的多個 Cell 共用同一組參數（Weight Sharing）。</p>'+table(['名詞','意義'],[['Time Step','時間步'],['Hidden State','歷史特徵狀態'],['RNN Cell','更新狀態的單元'],['Sequence','有順序的資料'],['Unrolling','時間展開'],['Weight Sharing','權重共享'],['BPTT','時間反向傳播']]))+
 sec(3,'數學公式及矩陣維度',eq('a_t=W_{xh}x_t+W_{hh}h_{t-1}+b_h')+eq('h_t=\\tanh(a_t)')+eq('o_t=W_{hy}h_t+b_y')+eq('\\hat y_t=\\operatorname{softmax}(o_t)')+'<p>分類可使用 Softmax，回歸可使用線性輸出。D、H、O 分別為輸入、隱藏、輸出維度。</p>'+table(['變數','維度','說明'],[['xₜ','D×1','目前輸入'],['hₜ₋₁、hₜ','H×1','前一／目前狀態'],['aₜ','H×1','激活前總和'],['Wₓₕ','H×D','輸入權重'],['Wₕₕ','H×H','循環權重'],['Wₕᵧ','O×H','輸出權重'],['bₕ','H×1','隱藏偏差'],['bᵧ、oₜ','O×1','輸出偏差／分數'],['t','純量','時間步索引']]))+
 sec(4,'RNN Cell 內部運算',svg(rect(30,15,220,42,'Wₓₕ xₜ','#3974bd')+rect(390,15,220,42,'Wₕₕ hₜ₋₁')+arrow(140,57,280,91)+arrow(500,57,360,91)+rect(245,91,150,40,'加總 + bₕ','#d97706')+arrow(320,131,320,150)+rect(245,150,150,40,'tanh','#9333ea')+arrow(320,190,320,210)+rect(245,210,150,40,'hₜ')+arrow(395,230,570,230)+'<text x="500" y="218" fill="currentColor" font-size="13">下一時間步</text>',265)+'<p>兩路輸入分別轉換目前資料及歷史資訊，合併後經過激活函數。hₜ 同時傳至下一步與輸出層。</p>')+
 sec(5,'tanh 激活函數',eq('\\tanh(x)=\\frac{e^x-e^{-x}}{e^x+e^{-x}}')+eq('\\frac{d\\tanh(x)}{dx}=1-\\tanh^2(x)')+'<p>e 為自然指數底數，x 為輸入。輸出介於 −1 與 1，具有非線性且以零為中心；飽和時導數接近零。</p>'+lab('tanh',[['x','輸入 x',-5,5,.1,.8]]))+
 sec(6,'逐步手算範例','<p>設定 Wₓₕ=0.5、Wₕₕ=0.8、bₕ=0.1、h₀=0、Wₕᵧ=1、bᵧ=0，輸入 [1,2,3]。</p>'+eq('h_t=\\tanh(0.5x_t+0.8h_{t-1}+0.1)')+eq('\\begin{aligned}h_1&=\\tanh(0.5+0+0.1)\\\\&='+base[0].toFixed(5)+'\\end{aligned}')+eq('\\begin{aligned}h_2&=\\tanh(1+0.8h_1+0.1)\\\\&='+base[1].toFixed(5)+'\\end{aligned}')+eq('\\begin{aligned}h_3&=\\tanh(1.5+0.8h_2+0.1)\\\\&='+base[2].toFixed(5)+'\\end{aligned}')+table(['時間步','輸入','隱藏狀態'],base.map((h,i)=>[i+1,i+1,h.toFixed(5)]))+'<p>最後狀態間接受所有較早輸入影響；數值以完整精度運算後四捨五入。</p>')+
 sec(7,'互動實驗：序列運算',lab('sequence',[['x1','x₁',-3,3,.5,1],['x2','x₂',-3,3,.5,2],['x3','x₃',-3,3,.5,3],['x4','x₄',-3,3,.5,0],['wx','Wₓₕ',-2,2,.1,.5],['wh','Wₕₕ',-2,2,.1,.8],['b','bₕ',-1,1,.1,.1],['t','查看時間步',1,4,1,1]])+'<p>將 Wₕₕ 設為零，觀察歷史輸入不再影響後續狀態。本實驗手動設定參數，不是訓練。</p>')+
 sec(8,'Hidden State 如何記憶？','<p>隱藏狀態不是保存所有歷史資料，而是壓縮成特徵向量。暫時移除非線性及偏差：</p>'+eq('h_t=W_{xh}x_t+W_{hh}h_{t-1}')+eq('h_2=W_{xh}x_2+W_{hh}W_{xh}x_1+W_{hh}^2h_0')+eq('h_t=W_{hh}^th_0+\\sum_{k=1}^tW_{hh}^{t-k}W_{xh}x_k')+'<p>k 為歷史時間步。線性簡化模型若 Wₕₕ=0.8、Wₓₕ=1，歷史輸入係數如下；實際非線性 RNN 不一定固定比例衰減。</p>'+chart(Array.from({length:8},(_,i)=>.8**(7-i)),0,1,'由較早到目前時間步','相對係數'))+
 sec(9,'權重共享與參數數量',eq('P_{RNN}=HD+H^2+H')+eq('P=HD+H^2+H+OH+O')+'<p>理論單偏差架構，D=3、H=4、O=2 時：12+16+4+8+2=42。PyTorch nn.RNN 預設兩組偏差，因此另增加 H。</p>'+lab('params',[['d','輸入 D',1,128,1,3],['h','隱藏 H',1,256,1,4],['o','輸出 O',1,100,1,2],['t','序列長度 T',1,100,1,10]]))+
 sec(10,'五種輸入輸出架構',[
 ['One to One（一對一）',[1],[1],'固定輸入與輸出，可作比較基準，不一定需要循環。'],
 ['One to Many（一對多）',[1,0,0,0],[1,1,1,1],'例如影像描述生成。'],
 ['Many to One（多對一）',[1,1,1,1],[0,0,0,1],'例如整句情緒分析。'],
 ['Many to Many（等長）',[1,1,1,1],[1,1,1,1],'例如逐詞標註。'],
 ['Many to Many（非等長）',[1,1,1,0,0],[0,0,0,1,1],'例如 Encoder–Decoder 翻譯。']
 ].map(([name,ins,outs,desc])=>'<h3>'+name+'</h3>'+svg(ins.map((v,i)=>{const x=320-(ins.length-1)*55+i*110-35;return rect(x,65,70,35,'h'+(i+1))+(v?rect(x,125,70,28,'x','#3974bd')+arrow(x+35,125,x+35,100,'#3974bd'):'')+(outs[i]?rect(x,5,70,28,'y','#d97706')+arrow(x+35,65,x+35,33,'#d97706'):'')+(i<ins.length-1?arrow(x+70,82,x+110,82):'')}).join(''),160)+'<p>'+desc+'</p>').join(''))+
 sec(11,'模型訓練流程與 Loss',flow(['輸入序列及標籤','初始化共享參數與狀態','前向傳播（逐時間步）','計算損失','BPTT 計算梯度','Optimizer 更新權重'])+eq('L=\\sum_{t=1}^T L_t')+eq('L_t=\\frac12(\\hat y_t-y_t)^2')+'<p>T 為序列長度，Lₜ 為單步損失，ŷₜ、yₜ 分別為預測與真值。Many-to-One 通常只計算最後輸出損失。</p>')+
 sec(12,'BPTT：時間反向傳播與 Jacobian',sequence()+svg(arrow(590,35,45,35,'#d34c50')+'<text x="320" y="22" text-anchor="middle" font-size="15" fill="#d34c50">梯度從後往前傳遞</text>',55)+eq('\\frac{\\partial L_T}{\\partial h_k}=\\frac{\\partial L_T}{\\partial h_T}\\prod_{t=k+1}^T\\frac{\\partial h_t}{\\partial h_{t-1}}')+'<p>此連乘為純量表示，L_T 為最後損失、h_k 為較早狀態。向量情況須依正確次序乘 Jacobian 矩陣。</p>'+eq('J_t=\\operatorname{diag}(1-h_t^2)W_{hh}')+'<p>Jₜ 為 H×H Jacobian；diag 將向量放到對角線，平方為逐元素平方。純量局部梯度如下：</p>'+eq('\\frac{\\partial h_t}{\\partial h_{t-1}}=(1-h_t^2)W_{hh}'))+
 sec(13,'Vanishing Gradient（梯度消失）','<p>若每步局部梯度倍率為 0.5，連乘使較早狀態收到很弱的訓練訊號。</p>'+table(['時間步數 n','0.5ⁿ'],[1,2,5,10,20].map(n=>[n,(.5**n).toPrecision(6)]))+'<p>長句前段資訊、長期感測器變化等依賴關係較難學習。</p>')+
 sec(14,'Exploding Gradient（梯度爆炸）與 Gradient Clipping','<p>倍率為 1.5 時，連乘可能造成權重更新過大、Loss 震盪或數值溢位。</p>'+table(['時間步數 n','1.5ⁿ'],[5,10,20].map(n=>[n,(1.5**n).toPrecision(7)]))+lab('gradient',[['q','固定梯度倍率 q',.1,2,.05,.5],['n','反向步數 n',1,50,1,20]])+eq('g\'=\\begin{cases}g,&\\|g\\|\\le c\\\\c\\frac{g}{\\|g\\|},&\\|g\\|>c\\end{cases}')+'<p>g 為原梯度、g′ 為裁剪後梯度、c 為最大範數。裁剪改善爆炸，不能直接解決消失。實際 Jacobian 並非固定倍率。</p>')+
 sec(15,'Truncated BPTT（截斷時間反向傳播）',svg(Array.from({length:9},(_,i)=>rect(20+i*68,22,52,34,String(i+1),['#3974bd','#0d9488','#9333ea'][Math.floor(i/3)])).join('')+[0,1,2].map(i=>arrow(208+i*204,78,20+i*204,78,'#d34c50')).join('')+'<text x="320" y="108" text-anchor="middle" font-size="14" fill="currentColor">每三步一段，梯度不跨區段</text>',120)+'<p>隱藏狀態可向前跨越區段，但梯度在區段邊界截斷，降低記憶體成本，也限制長距離依賴的直接學習。</p>')+
 sec(16,'LSTM（Long Short-Term Memory）',flow(['xₜ 與 hₜ₋₁','Forget / Input / Output Gate 與候選狀態','Cₜ = 舊記憶 × 遺忘閘門 + 新記憶 × 輸入閘門','hₜ = 輸出閘門 × tanh(Cₜ)'])+eq('f_t=\\sigma(W_f[h_{t-1},x_t]+b_f)')+eq('i_t=\\sigma(W_i[h_{t-1},x_t]+b_i)')+eq('\\tilde C_t=\\tanh(W_c[h_{t-1},x_t]+b_c)')+eq('C_t=f_t\\odot C_{t-1}+i_t\\odot\\tilde C_t')+eq('o_t=\\sigma(W_o[h_{t-1},x_t]+b_o)')+eq('h_t=o_t\\odot\\tanh(C_t)')+table(['變數','功能'],[['fₜ','遺忘閘門'],['iₜ','輸入閘門'],['oₜ','輸出閘門'],['Cₜ₋₁、Cₜ','前一／目前細胞狀態'],['C̃ₜ','候選細胞狀態'],['W、b','各閘門及候選的權重與偏差'],['σ、⊙','Sigmoid、逐元素乘法'],['[hₜ₋₁,xₜ]','向量串接']])+'<p>加法更新路徑有助於保留長期資訊，但不保證消除梯度消失。</p><button type="button" data-learn-keyword="d8t14">LSTM 詞條</button>')+
 sec(17,'互動實驗：LSTM 記憶閘門',lab('lstm',[['f','遺忘閘門 fₜ',0,1,.05,.8],['i','輸入閘門 iₜ',0,1,.05,.6],['o','輸出閘門 oₜ',0,1,.05,.9],['c','前一記憶 Cₜ₋₁',-2,2,.05,.5],['n','候選記憶 C̃ₜ',-1,1,.05,.7]])+'<p>本實驗直接設定閘門值。0 和 1 為極限示意，有限 Sigmoid 輸入不會精確達到兩端。</p>')+
 sec(18,'GRU（Gated Recurrent Unit）',flow(['xₜ 與 hₜ₋₁','Reset Gate 控制候選狀態','Update Gate 混合舊狀態與新狀態','輸出 hₜ'])+eq('r_t=\\sigma(W_r[h_{t-1},x_t]+b_r)')+eq('z_t=\\sigma(W_z[h_{t-1},x_t]+b_z)')+eq('\\tilde h_t=\\tanh(W_h[r_t\\odot h_{t-1},x_t]+b_h)')+eq('h_t=(1-z_t)\\odot h_{t-1}+z_t\\odot\\tilde h_t')+'<p>rₜ 為重設閘門，zₜ 為更新閘門，此處表示新狀態比例；PyTorch 的 z 定義相反，候選狀態的重設位置也有實作差異。GRU 無獨立 Cell State。</p><button type="button" data-learn-keyword="d8t15">GRU 詞條</button>')+
 sec(19,'RNN、LSTM、GRU 比較',table(['項目','RNN','LSTM','GRU'],[['閘門','0','3','2'],['Hidden State','有','有','有'],['Cell State','無','有','無'],['長期依賴','較弱','較強','較強'],['參數與運算','較少','較多','居中'],['梯度消失改善','有限','有','有']])+eq('P_{RNN}=H(D+H+1)')+eq('P_{LSTM}=4H(D+H+1)')+eq('P_{GRU}=3H(D+H+1)')+table(['D=32、H=64','參數（不含輸出）'],[['RNN','6,208'],['GRU','18,624'],['LSTM','24,832']])+'<p>此為單偏差理論值，框架實作可不同。</p>')+
 sec(20,'Bidirectional RNN（雙向循環神經網路）',svg([0,1,2,3].map(i=>{const x=35+i*150;return rect(x,15,110,35,'y'+(i+1),'#d97706')+rect(x,65,110,35,'反向 h'+(i+1),'#9333ea')+rect(x,125,110,35,'正向 h'+(i+1),'#3974bd')+rect(x,185,110,35,'x'+(i+1))+arrow(x+55,185,x+55,160)+arrow(x+55,65,x+55,50)+(i<3?arrow(x+110,142,x+150,142,'#3974bd')+arrow(x+150,82,x+110,82,'#9333ea'):'')}).join(''),230)+eq('h_t=[\\overrightarrow h_t;\\overleftarrow h_t]')+'<p>兩組獨立 RNN 正向與反向處理同一序列，串接輸出，適合離線序列標註。即時零未來資訊的預測不適合完整 BiRNN。</p>')+
 sec(21,'RNN、CNN、Transformer 比較',table(['項目','RNN','CNN','Transformer'],[['核心','循環狀態','卷積核','Attention'],['常見資料','時間序列','影像／序列','文字／多模態'],['平行運算','受限制','可','訓練時可'],['長距離關係','基本 RNN 較弱','依感受野','通常較強'],['串流狀態','固定大小','依架構','通常 KV Cache']])+'<p>Self-Attention 可直接建立不同位置的關聯，利於大型模型平行訓練。RNN 仍適合小模型、即時訊號及低記憶體裝置。</p>')+
 sec(22,'Python／Colab 實作：時間序列預測','<p>使用真實前 20 筆正弦波觀測預測下一筆，支援 RNN、LSTM、GRU 三種模型。這是單步預測，非遞迴多步預測。需 PyTorch，請在 Colab 或本機執行。</p><pre><code class="language-python">'+escapeHtml(code)+'</code></pre>')+
 sec(23,'Python 架構與 Tensor 維度',flow(['輸入 Batch × 20 × 1','RNN / LSTM / GRU，H=32','Output：Batch × 20 × 32','取 out[:, −1, :]','Linear(32,1)','預測 Batch × 1'])+table(['程式參數','說明'],[['MODEL_TYPE','切換三種架構'],['SEQ_LEN','序列長度'],['HIDDEN_SIZE','隱藏維度'],['NUM_LAYERS','循環層數'],['EPOCHS、LR','訓練輪數與學習率'],['batch_first','Batch、Sequence、Feature'],['loss.backward()','BPTT'],['clip_grad_norm_()','梯度裁剪'],['optimizer.step()','更新權重']])+'<p>比較三種模型的 Loss、參數及預測結果，正弦波不一定能充分反映長期記憶能力。</p>')+
 sec(24,'應用：汽車電子與設備異常偵測',flow(['電壓、溫度、Sync Loss、背光狀態','時間視窗 × 特徵','RNN / LSTM / GRU','正常／疑似異常'])+table(['時間','電壓 V','Sync Loss','背光','錯誤計數'],[['t₁','12.2','0','1','0'],['t₂','12.1','0','1','0'],['t₃','11.9','1','0','1'],['t₄','12.0','1','0','2'],['t₅','12.2','0','0','0'],['t₆','12.2','0','0','0']])+'<p>以上為假設教學資料。歷史狀態有助辨識同步遺失後背光未恢復。AI 只作輔助診斷，不取代確定性功能安全監控。</p>')+
 sec(25,'優點與限制',table(['優點','限制'],[['不同長度序列','時間步具有前後依賴'],['歷史狀態傳遞','梯度消失／爆炸'],['參數共享','長期依賴較難'],['即時串流','訓練保存中間狀態'],['固定大小推論狀態','平行化受限']]))+
 sec(26,'自我測驗（Self-Assessment）',quiz())+
 sec(27,'核心公式總整理',table(['功能','公式'],[['隱藏狀態',eq('h_t=\\tanh(W_{xh}x_t+W_{hh}h_{t-1}+b_h)')],['輸出',eq('o_t=W_{hy}h_t+b_y')],['總損失',eq('L=\\sum_tL_t')],['tanh 導數',eq('1-\\tanh^2(x)')],['Jacobian',eq('\\operatorname{diag}(1-h_t^2)W_{hh}')],['參數',eq('H(D+H+1)')],['LSTM',eq('C_t=f_t\\odot C_{t-1}+i_t\\odot\\tilde C_t')],['GRU',eq('h_t=(1-z_t)\\odot h_{t-1}+z_t\\odot\\tilde h_t')]]))+
 sec(28,'學習重點總結','<p>掌握 Hidden State、Recurrent Connection、Weight Sharing、BPTT、Vanishing／Exploding Gradient 及 LSTM／GRU 六大觀念。</p><button type="button" data-keyword-tab="interact">進入原有互動學習 →</button>')+'</div>';
 }
 function update(l){
 const v={};l.querySelectorAll('[data-rnn-param]').forEach(el=>{v[el.dataset.rnnParam]=Number(el.value);l.querySelector('[data-rnn-value="'+el.dataset.rnnParam+'"]').textContent=el.value});
 const out=l.querySelector('[data-rnn-result]'),f=n=>Number(n.toFixed(5));let html='';
 switch(l.dataset.rnnLab){
 case 'tanh':{const a=Math.tanh(v.x);html=chart(Array.from({length:101},(_,i)=>Math.tanh(-5+i*.1)),-1,1,'x：−5 至 5','tanh(x)')+eq('\\tanh('+v.x+')='+f(a))+eq('1-\\tanh^2('+v.x+')='+f(1-a*a));break;}
 case 'sequence':{const xs=[v.x1,v.x2,v.x3,v.x4],rows=[];let prev=0;for(let i=0;i<xs.length;i++){const a=v.wx*xs[i]+v.wh*prev+v.b,h=Math.tanh(a);rows.push([i+1,xs[i],prev,a,h]);prev=h}const row=rows[v.t-1];html=sequence(xs,rows.map(r=>r[4]))+eq('\\begin{aligned}a_'+v.t+'&=('+v.wx+')('+row[1]+')+('+v.wh+')('+f(row[2])+')+('+v.b+')\\\\&='+f(row[3])+'\\\\h_'+v.t+'&=\\tanh(a_'+v.t+')='+f(row[4])+'\\end{aligned}')+chart([0,...rows.map(r=>r[4])],-1,1,'時間步 h₀ 至 h₄','Hidden State')+table(['t','xₜ','hₜ₋₁','aₜ','hₜ'],rows.map(r=>r.map(f)));break;}
 case 'params':{const parts=[v.h*v.d,v.h*v.h,v.h,v.o*v.h,v.o],sum=parts.reduce((a,b)=>a+b,0);html=table(['項目','參數'],['輸入權重','循環權重','隱藏偏差','輸出權重','輸出偏差'].map((s,i)=>[s,parts[i].toLocaleString()]))+eq('P='+parts.join('+')+'='+sum)+'<p>序列長度 '+v.t+'，參數數量不變；PyTorch 雙偏差版本另加 '+v.h+'。</p>';break;}
 case 'gradient':{const a=Array.from({length:v.n+1},(_,i)=>v.q**i),g=a.at(-1);html=chart(a,0,Math.max(1,...a),'反向步數 0 至 '+v.n,'梯度倍率')+eq('g_n=('+v.q+')^{'+v.n+'}='+g.toExponential(5))+'<p>'+(v.q<1?'梯度逐步衰減':v.q>1?'梯度逐步放大':'梯度不變')+'</p>';break;}
 case 'lstm':{const old=v.f*v.c,newv=v.i*v.n,c=old+newv,h=v.o*Math.tanh(c);html=svg(rect(20,15,250,40,'舊記憶 × f = '+f(old),'#3974bd')+rect(370,15,250,40,'新記憶 × i = '+f(newv),'#9333ea')+arrow(145,55,270,85)+arrow(495,55,370,85)+rect(245,85,150,40,'Cₜ = '+f(c))+arrow(320,125,320,150)+rect(215,150,210,40,'hₜ = '+f(h),'#d97706'))+eq('\\begin{aligned}C_t&=('+v.f+')('+v.c+')+('+v.i+')('+v.n+')\\\\&='+f(old)+'+('+f(newv)+')='+f(c)+'\\\\h_t&='+v.o+'\\tanh('+f(c)+')='+f(h)+'\\end{aligned}');break;}
 }
 out.innerHTML=html;
 }
 keywordExample=function(t,p){return t.id===id?lesson():previousExample(t,p);};
 keywordStudy.summary=function(t){return t.id===id?'<p>'+escapeHtml(t.definition)+'</p><p>完整 28 節、5 個互動實驗、PyTorch 實作與 10 題測驗。</p>':previousSummary(t);};
 renderKeyword=function(){previousRender.apply(this,arguments);document.querySelectorAll('#keyword-body [data-rnn-lab]').forEach(update);};
 document.addEventListener('input',e=>{if(e.target.matches('[data-rnn-param]'))update(e.target.closest('[data-rnn-lab]'));});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-rnn-reset],[data-rnn-grade],[data-rnn-quiz-reset]');if(!b)return;
 if(b.hasAttribute('data-rnn-reset')){const l=b.closest('[data-rnn-lab]');l.querySelectorAll('input').forEach(i=>i.value=i.defaultValue);update(l);return}
 const q=b.closest('[data-rnn-quiz]');if(!q)return;
 if(b.hasAttribute('data-rnn-quiz-reset')){q.querySelectorAll('input').forEach(i=>i.checked=false);q.querySelectorAll('[data-rnn-feedback],[data-rnn-score]').forEach(p=>p.textContent='');return}
 let n=0;qs.forEach(([title,a,c,ex],i)=>{const selected=q.querySelector('input[name="rnn-q-'+i+'"]:checked'),correct=selected&&Number(selected.value)===c;if(correct)n++;q.querySelector('[data-rnn-feedback="'+i+'"]').textContent=(correct?'正確：':'正解：'+a[c]+'。')+ex;});q.querySelector('[data-rnn-score]').textContent='得分：'+n+' / '+qs.length+'（'+n*10+' 分）';
 });
}

/* Shared glossary presentation: preserve dedicated lessons and existing term-specific data. */
{
 const priorExample=keywordExample,priorRender=renderKeyword;
 const dedicated=new Set(['d3t10','d8t13']);
 const esc=escapeHtml;
 const heading=(n,title,html)=>'<section class="keyword-section glossary-chapter"><h2>'+n+'. '+title+'</h2>'+html+'</section>';
 const paragraph=x=>'<p>'+esc(x)+'</p>';
 function flow(steps){
  return '<ol class="glossary-flow" aria-label="方法步驟圖">'+steps.map((s,i)=>'<li><b>STEP '+(i+1)+'</b><span>'+esc(s)+'</span></li>').join('')+'</ol>';
 }
 const style=document.createElement('style');
 style.id='glossary-study-standard';
 style.textContent='#keyword-content .glossary-chapter{padding:1rem 0;margin:0;min-width:0}#keyword-content .glossary-chapter+.glossary-chapter{border-top:1px solid #aeb7c4;margin-top:1.1rem;padding-top:1.6rem}#keyword-content .glossary-flow{display:grid;gap:18px;list-style:none;padding:0;max-width:680px;margin:1rem auto}#keyword-content .glossary-flow li{position:relative;display:flex;align-items:center;gap:12px;border:1px solid #91aaa9;border-radius:8px;padding:12px;line-height:1.7}#keyword-content .glossary-flow li+li:before{content:"↓";position:absolute;top:-21px;left:50%;line-height:20px;color:#64748b}#keyword-content .glossary-flow b{flex-shrink:0;font-size:.75rem;color:#527777}#keyword-content table{border-collapse:collapse;border:1.5px solid #8f96a3;width:100%}#keyword-content th,#keyword-content td{border:1.5px solid #8f96a3;padding:.6rem;white-space:normal;overflow-wrap:anywhere;vertical-align:middle}#keyword-content th{background:#e9eef7;color:#172640;font-weight:700;text-align:center}#keyword-content .lab-table-wrap,#keyword-content .cnn-layer-table{overflow:visible;max-width:100%;min-width:0}#keyword-content .glossary-chapter .method-handbook{padding:0;margin:0;border:0;background:transparent}#keyword-content .glossary-chapter .method-handbook>section,#keyword-content .glossary-chapter .method-handbook>details{border-top:1px solid #b7bdc9;padding:1rem 0;margin:0}#keyword-content .keyword-math,#keyword-content .katex-display,#keyword-content .formula-explanation{overflow:visible!important;max-width:100%;min-width:0}#keyword-content .katex-display{white-space:normal}#keyword-content .katex-display>.katex{white-space:normal}#keyword-content .katex-display>.katex>.katex-html{white-space:normal}#keyword-content svg{max-width:100%;height:auto}#keyword-content .glossary-chapter h3{margin-top:1rem}#keyword-content .glossary-chapter .muted{line-height:1.8}';
 if(!document.getElementById(style.id))document.head.append(style);
 keywordExample=function(t,d){
  if(dedicated.has(t.id))return priorExample(t,d);
  const e=methodEngine(t),p=e&&methodLessons[e.id];
  let n=0,sections=[];
  const add=(title,html)=>sections.push(heading(++n,title,html));
  if(p){
   add('問題背景與核心觀念（Motivation & Principle）',paragraph(p.why)+paragraph(p.principle)+(d?.example?'<h3>具體應用情境</h3>'+paragraph(d.example):'')+'<p class="muted">本詞的正式定義見頁首。下方共用機制算例只示範與本詞有關的部分。</p>');
   add('運作流程（Data Flow）',flow(p.steps));
   const inputs=labCaseDefaults(t,e);
   add('輸入、符號與變數（Inputs & Symbols）',labTable(['輸入名稱','符號','意義與用途','預設值'],methodInputRows(e,inputs))+'<p class="muted">預設值為示範起點，非通用最佳參數。</p>');
   const guide=keywordFormulaGuide(t);
   if(guide)add('公式用途與推導線索（Formula Guide）',guide.replace(/<details class="keyword-formulas">/,'<details class="keyword-formulas" open>'));
   const trace=keywordStudy.walkthrough(t);
   if(trace)add('本詞專屬逐步算例（Term-Specific Example）',flow(trace[0])+paragraph(trace[1]));
   add('完整實例與計算過程（Worked Example）',methodWorkedExample(t,e,inputs));
   add('互動學習（Interactive Learning）','<p>使用同一實驗引擎調整輸入，對照圖形、中間步驟與結果。一次只改變一項條件。</p>'+ (typeof methodPracticeComparison==='function'?methodPracticeComparison(t,e,inputs):'')+'<button type="button" class="primary" data-open-lab="'+esc(t.id)+'">開啟完整互動實驗 →</button>');
   add('應用、假設與限制（Applications & Limits）','<h3>適用情境</h3>'+paragraph(p.use)+'<h3>限制與假設</h3>'+paragraph(p.limit)+(d?.expected?'<h3>驗收依據</h3>'+paragraph(d.expected):''));
  }else{
   add('核心觀念（Concept）',paragraph(plainKeywordDefinitions[t.id]||t.definition));
   if(d?.example)add('實際應用情境（Example）',paragraph(d.example));
   const trace=keywordStudy.walkthrough(t);
   if(trace)add('逐步算例（Worked Example）',flow(trace[0])+paragraph(trace[1]));
   if(d?.action)add('操作與實作指引（Practice）',paragraph(d.action));
   if(d?.expected)add('結果判讀與驗收（Verification）',paragraph(d.expected));
  }
  add('自我測驗與實作（Self-Assessment）','<p>先完成情境判讀，確認能解釋本詞與相關概念的差異，再依實作指引核對輸入與輸出。</p><button type="button" data-keyword-tab="interact">進入自我測驗 →</button> <button type="button" data-keyword-tab="practice">實作指引 →</button>');
  const sources=curriculum[t.domainId]?.sourceIds||[];
  if(sources.length)add('參考資料（References）','<ul>'+sources.map(i=>learningSources[i]).filter(Boolean).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.title)+'</a></li>').join('')+'</ul>');
  return '<div class="glossary-standard">'+sections.join('')+'</div>';
 };
 renderKeyword=function(){
  priorRender.apply(this,arguments);
  // No mutation observer: only normalize existing glossary DOM after navigation.
  const body=document.getElementById('keyword-body');if(!body)return;
  body.querySelectorAll('.glossary-chapter .keyword-formulas').forEach(d=>{d.open=true});
  // Scale only overwide mathematical expressions, not their surrounding text.
  body.querySelectorAll('.katex-display').forEach(d=>{
   const math=d.firstElementChild;if(!math)return;
   const w=d.clientWidth;if(w>0&&math.scrollWidth>w){math.style.fontSize=Math.max(.6,w/math.scrollWidth)*100+'%'}
  });
 };
}

/* 2026-11-27 audit: explicit experimental coverage for imported terms.
   Related labs are demonstrations, not full implementations of the imported model. */
{
 const related={
 'fluxgloss-01':'learning-plan','fluxgloss-08':'embedding','fluxgloss-15':'conditioning','fluxgloss-18':'conditioning','fluxgloss-19':'conditioning','fluxgloss-21':'generation-ode','fluxgloss-24':'distill','fluxgloss-26':'boxes','fluxgloss-27':'roi','fluxgloss-28':'conditioning','fluxgloss-29':'segmentation','fluxgloss-30':'segmentation','fluxgloss-31':'segmentation','fluxgloss-32':'conditioning','fluxgloss-33':'conditioning','fluxgloss-34':'convolution-grid','fluxgloss-35':'boxes','fluxgloss-36':'roi','fluxgloss-39':'prompt','fluxgloss-40':'boxes','fluxgloss-41':'json','fluxgloss-43':'prompt','fluxgloss-45':'prompt','fluxgloss-46':'prompt','fluxgloss-47':'ablation','fluxgloss-49':'roofline','fluxgloss-51':'calc-memory','fluxgloss-52':'float-format','fluxgloss-56':'parallel-checkpoint','fluxgloss-60':'generation-ode','fluxgloss-61':'generation-ode','fluxgloss-62':'latent'
 };
 const notes={
 'fluxgloss-01':['先確定任務與輸入格式，再選模型，最後以未見樣本核對輸出。','模型名稱不能保證能力；辨識模型和生成模型的輸出不等價。'],
 'fluxgloss-08':['將兩段文字各編為同維度向量，計算餘弦相似度，再依分數排序。','向量相似不等於內容完全相同；零向量的餘弦相似度未定義。'],
 'fluxgloss-15':['以原圖為起點，指定要變更的屬性、區域及要保留的內容，對照修改前後。','整圖生成不保證保留人臉、背景或細節。'],
 'fluxgloss-18':['將參考圖編成模型支援的條件表示，與文字及原圖條件共同傳入生成流程。','條件格式、權重與控制精度取決於模型。'],
 'fluxgloss-19':['先指定每張參考圖各自提供的屬性，再核對輸出是否保留這些屬性。','參考圖互相矛盾或輸入次序不同可能影響結果。'],
 'fluxgloss-21':['令 x(t)=(1−t)x₀+t x₁，則理想直線速度 dx/dt=x₁−x₀。以 x₀=0、x₁=1 示範，速度為 1。','真實 Rectified Flow 學的是隨時間、位置變化的速度場；簡例不是模型訓練。'],
 'fluxgloss-24':['固定教師輸出及資料，以學生模型學習教師的分布或中間特徵，最後獨立評估。','蒸餾不保證更小模型完全保留教師能力。'],
 'fluxgloss-26':['外接框可用 (x₁,y₁,x₂,y₂)；以右下界不包含的座標約定，寬=x₂−x₁、高=y₂−y₁。','框內不一定全是物件；座標約定與縮放必須一致。'],
 'fluxgloss-27':['以左上 (x,y) 與寬高 (w,h) 裁切；NumPy 使用 image[y:y+h,x:x+w]，貼回時恢復偏移。','先限制在原圖邊界，空區域不能送模型。'],
 'fluxgloss-28':['將允許編輯像素設為 1，保留區設為 0；逐像素核對遮罩與原圖尺寸。','某些工具使用反向黑白約定，先驗證再處理。'],
 'fluxgloss-29':['將像素賦予類別或實例編號，再依目標類別取得遮罩。','類別編號不是亮度或機率。'],
 'fluxgloss-30':['提供正點、負點或方框提示，取得候選遮罩，再比較邊緣與目標區覆蓋。','共用分割實驗只示範標籤與遮罩，不會執行 SAM。'],
 'fluxgloss-31':['固定同一圖片、提示與標註，比較候選遮罩的細部邊界和交並比。','HQ-SAM 等模型的改善幅度依資料和任務而異；本頁不載入權重。'],
 'fluxgloss-32':['逐通道計算 C=αF+(1−α)B；F 是前景、B 是背景、α 是前景覆蓋比例。','本式假設不透明背景且在適當色彩空間運算；不直接等同所有 RGBA 混合。'],
 'fluxgloss-33':['將二值遮罩邊緣轉成平滑的 α 過渡，保留核心區域。','羽化太寬會使細帶消失；過窄可能留下硬邊。'],
 'fluxgloss-34':['高斯核的權重與 exp(−r²/(2σ²)) 成比例，正規化後加權鄰域像素。r 是距離，σ 控制分布寬度。','σ 增大通常增加平滑程度，但核大小、邊界處理也影響結果。'],
 'fluxgloss-35':['辨認前後物件的遮擋順序，先合成背景，再以遮罩保留前方物件。','被遮擋區的真實外觀無法僅從可見像素確認。'],
 'fluxgloss-36':['針孔模型中 X 像素位置的相對值 u=fX/Z；f 為焦距、X 為橫向位置、Z 為深度。','平面裁切與透視投影不同；相關 ROI 實驗只用來核對座標。'],
 'fluxgloss-39':['先辨識可見屬性，再產生提示詞，將不確定欄位標為未知。','模型生成的描述不一定與圖像一致，必須核對參考圖。'],
 'fluxgloss-40':['解析語句中的物件與方向，回傳位置並與原圖核對。','注意畫面左右與人物自身左右不同；外接框不代表精準輪廓。'],
 'fluxgloss-41':['定義屬性欄位，填入可見證據，再驗證資料型別與必要欄位。','缺少證據應標示未知，不能為了填滿欄位而猜測。'],
 'fluxgloss-43':['分開列出必須修改、必須保留及禁止修改的條件，逐項驗收。','文字約束不等於硬性像素限制，重要區域另用遮罩或規則。'],
 'fluxgloss-45':['將提示拆成屬性、對象與範圍；同一對象的互斥值需先消解。','不要把模型任意選擇的結果當成符合全部條件。'],
 'fluxgloss-46':['保留初始需求，每輪重寫後比較屬性、位置及限制是否變更。','文字相似度不能取代逐項要求核對。'],
 'fluxgloss-47':['定義可觀察的參考特徵，逐項核對，記錄符合、不符及不可判定。','主觀相似不能代替結構、材質及顏色的獨立評估。'],
 'fluxgloss-49':['確認 CUDA 裝置、模型及張量所在裝置，固定輸入比較 CPU/GPU 延遲。','CUDA 可用不代表所有算子都在 GPU；共用實驗是理論估算。'],
 'fluxgloss-51':['分別量測系統 RAM 與 VRAM，在模型載入及推論時記錄峰值。','純權重容量不包含活化值、暫存、框架及系統開銷。'],
 'fluxgloss-52':['FP32 每個元素 4 bytes；N 個元素的純資料容量為 4N bytes。','浮點精度與實際運算精度可能不同；容量不代表總記憶體。'],
 'fluxgloss-56':['將部分權重暫存於 CPU RAM，需要時移回 GPU，記錄記憶體與延遲。','卸載通常降低部分 VRAM 壓力，但增加傳輸成本。'],
 'fluxgloss-60':['固定模型、種子、提示及其他設定，只改取樣步數，記錄耗時與品質。','步數較多不保證品質較好；蒸餾模型可能只需少量步數。'],
 'fluxgloss-61':['常見 CFG 形式為 ε=εᵤ+s(ε꜀−εᵤ)，s 是引導倍率，εᵤ、ε꜀ 是無條件、條件預測。','不同架構可能使用不同引導方式；此公式不是 FLUX 所有版本的通式。'],
 'fluxgloss-62':['像素數為 W×H，W 與 H 是影像寬高；若為 RGB FP32 張量，純資料容量為 W×H×3×4 bytes。','像素數不是模型顯存需求，生成成本還受 latent 與模型架構影響。']
 };
 const models={
 'fluxgloss-21':[['a','起點 x₀',0,-5,5,.1],['b','終點 x₁',1,-5,5,.1],['t','時間 t',.5,0,1,.05]],
 'fluxgloss-26':[['a','左上 x₁',120,0,1000,10],['b','左上 y₁',400,0,1000,10],['c','寬',100,1,1000,1],['d','高',90,1,1000,1]],
 'fluxgloss-32':[['a','前景 F',200,0,255,1],['b','背景 B',100,0,255,1],['t','透明度 α',.25,0,1,.05]],
 'fluxgloss-34':[['a','標準差 σ',1,.2,5,.1],['b','鄰域距離 r',1,0,5,.1]],
 'fluxgloss-36':[['a','焦距 f',100,10,500,10],['b','橫向位置 X',2,-5,5,.1],['c','深度 Z',4,.1,10,.1]],
 'fluxgloss-52':[['a','元素數（百萬）',1000,1,2000,1]],
 'fluxgloss-61':[['a','無條件預測 εᵤ',.2,-2,2,.1],['b','條件預測 ε꜀',.6,-2,2,.1],['t','引導倍率 s',3,0,10,.1]],
 'fluxgloss-62':[['a','寬 W',512,64,2048,64],['b','高 H',512,64,2048,64]]
 };
 const old=keywordExample,previous=renderKeyword;
 const fmt=n=>Number(n.toFixed(5)).toLocaleString('en-US');
 const build=(id)=>'<div data-flux-study="'+id+'">'+models[id].map(([k,label,v,min,max,step])=>'<label style="display:block;margin:.75rem 0">'+label+'：<output data-flux-val="'+k+'">'+v+'</output><input style="display:block;width:100%" type="range" data-flux-param="'+k+'" value="'+v+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>').join('')+'<p data-flux-result aria-live="polite"></p><div data-flux-visual></div></div>';
 function update(l){const v={};l.querySelectorAll('[data-flux-param]').forEach(i=>{v[i.dataset.fluxParam]=Number(i.value);l.querySelector('[data-flux-val="'+i.dataset.fluxParam+'"]').textContent=i.value});let text='',visual='';
 const bar=(n,max)=>'<div style="height:12px;background:#e9eef7;border-radius:5px"><div style="height:100%;border-radius:5px;background:#0d9488;width:'+Math.max(0,Math.min(100,n/max*100))+'%"></div></div>';
 switch(l.dataset.fluxStudy){
 case 'fluxgloss-21':text='x(t) = (1−'+v.t+') × '+v.a+' + '+v.t+' × '+v.b+' = '+fmt((1-v.t)*v.a+v.t*v.b)+'；速度 = '+fmt(v.b-v.a);visual=bar(v.t,1);break;
 case 'fluxgloss-26':text='右下界 = ('+(v.a+v.c)+', '+(v.b+v.d)+')；面積 = '+v.c+' × '+v.d+' = '+fmt(v.c*v.d)+' 像素位置';visual='<svg viewBox="0 0 320 160" style="width:100%;max-width:480px"><rect x="10" y="10" width="300" height="140" fill="none" stroke="#94a3b8"/><rect x="'+(10+v.a*.15)+'" y="'+(10+v.b*.07)+'" width="'+v.c*.15+'" height="'+v.d*.07+'" fill="#0d9488" fill-opacity=".2" stroke="#0d9488"/></svg>';break;
 case 'fluxgloss-32':{const c=v.t*v.a+(1-v.t)*v.b;text='C = '+v.t+' × '+v.a+' + (1−'+v.t+') × '+v.b+' = '+fmt(c);visual='<div style="display:flex;gap:8px">'+[v.a,v.b,c].map((x,i)=>'<div style="flex:1;text-align:center"><div style="height:42px;background:rgb('+[x,x,x].map(Math.round).join(',')+');border:1px solid #94a3b8"></div>'+['前景','背景','合成'][i]+'</div>').join('')+'</div>';break;}
 case 'fluxgloss-34':{const g=Math.exp(-v.b*v.b/(2*v.a*v.a));text='未正規化相對權重 = exp(−'+v.b+'² / (2 × '+v.a+'²)) = '+fmt(g);visual=bar(g,1);break;}
 case 'fluxgloss-36':text='u = '+v.a+' × '+v.b+' / '+v.c+' = '+fmt(v.a*v.b/v.c)+'（相對主點的像素位置）';break;
 case 'fluxgloss-52':text=fmt(v.a)+' 百萬元素 × 4 bytes = '+fmt(v.a*4)+' MB（十進位），約 '+fmt(v.a*4e6/2**30)+' GiB';break;
 case 'fluxgloss-61':text='ε = '+v.a+' + '+v.t+' × ('+v.b+' − '+v.a+') = '+fmt(v.a+v.t*(v.b-v.a));break;
 case 'fluxgloss-62':text='像素數 = '+v.a+' × '+v.b+' = '+fmt(v.a*v.b)+'；RGB FP32 張量 = '+fmt(v.a*v.b*12)+' bytes';break;
 }
 l.querySelector('[data-flux-result]').textContent=text;l.querySelector('[data-flux-visual]').innerHTML=visual;
 }
 keywordExample=function(t,d){let html=old(t,d);const note=notes[t.id];if(!note)return html;const engine=labEngines.find(e=>e.id===related[t.id]);const term=engine&&labCases.find(c=>c.engineId===engine.id);const more='<section class="keyword-section glossary-chapter"><h2>補充：運作原理、限制與驗證</h2><h3>運作方式</h3><p>'+escapeHtml(note[0])+'</p><h3>假設與限制</h3><p>'+escapeHtml(note[1])+'</p>'+(models[t.id]?'<h3>專屬互動算例</h3>'+build(t.id):'')+(term?'<h3>相關機制實驗</h3><p>此實驗示範相關機制，並非直接執行本詞的完整模型。</p><button type="button" data-open-lab="'+escapeHtml(term.id)+'">'+escapeHtml(engine.title)+' →</button>':'')+'</section>';
 return html.replace(/<\/div>$/,more+'</div>');};
 renderKeyword=function(){previous.apply(this,arguments);document.querySelectorAll('#keyword-body [data-flux-study]').forEach(update);};
 document.addEventListener('input',e=>{if(e.target.matches('[data-flux-param]'))update(e.target.closest('[data-flux-study]'));});
}

/* In-place visual experiments use the same controls and preset as the lab. */
{
 const previous=keywordExample,previousRender=renderKeyword;
 const active=new WeakMap();
 const safe=escapeHtml;
 function controls(e,v){return e.controls.map(c=>{
 const name=safe(c.label),key=safe(c.id),value=v[c.id];
 if(c.type==='checkbox')return '<label><input type="checkbox" data-glossary-control="'+key+'" '+(value?'checked':'')+'> '+name+'</label>';
 if(c.type==='select')return '<label>'+name+'<select data-glossary-control="'+key+'">'+c.options.map(x=>{const i=x.indexOf(':'),k=i<0?x:x.slice(0,i),label=i<0?x:x.slice(i+1);return '<option value="'+safe(k)+'" '+(k===value?'selected':'')+'>'+safe(label)+'</option>'}).join('')+'</select></label>';
 if(c.type==='textarea')return '<label>'+name+'<textarea data-glossary-control="'+key+'" maxlength="4000">'+safe(value)+'</textarea></label>';
 return '<label>'+name+'<input type="number" data-glossary-control="'+key+'" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+value+'"></label>';
 }).join('')}
 function paint(host,session){const {e,v}=session,output=host.querySelector('[data-glossary-result]');
 if(session.traceId!=null&&typeof calculationViews!=='undefined')calculationViews.delete(session.traceId);
 try{const r=e.compute({...v});output.innerHTML=renderVisualGuide(e,v,r,'glossary')+renderLabResult(r,false)+(r.calculation?'<details><summary>完整計算步驟與公式代入</summary>'+renderCalculation(r.calculation)+'</details>':'');if(r.calculation&&typeof calculationViewCounter!=='undefined')session.traceId=calculationViewCounter;}
 catch(err){output.innerHTML='<p role="alert">'+safe(err.message)+'</p>'}}
 function mount(host){const t=keywordCatalog.find(x=>x.id===host.dataset.glossaryLive),e=t&&methodEngine(t);if(!e)return;const v=labCaseDefaults(t,e),session={e,v,t};active.set(host,session);host.querySelector('[data-glossary-controls]').innerHTML=controls(e,v);paint(host,session)}
 keywordExample=function(t,d){const html=previous(t,d);if(!html.includes('class="glossary-standard"')||!keywordStudy.hasMethod(t))return html;
 const e=methodEngine(t),section='<section class="keyword-section glossary-chapter"><h2>即時圖解與數值實驗（Live Experiment）</h2><p>以下採用與本詞相關的實驗設定，並非完整模型訓練。輸入及圖解位於同一區域，可直接比較修改前後的結果。</p><div data-glossary-live="'+safe(t.id)+'"><div class="guide-workspace"><section><h3>實驗輸入</h3><div class="guide-controls" data-glossary-controls></div><button type="button" data-glossary-reset>重設輸入</button></section><section data-glossary-result aria-live="polite"></section></div></div></section>';
 return html.replace(/<\/div>$/,section+'</div>');};
 renderKeyword=function(){document.querySelectorAll('#keyword-body [data-glossary-live]').forEach(host=>{const session=active.get(host);if(session?.traceId!=null&&typeof calculationViews!=='undefined')calculationViews.delete(session.traceId)});previousRender.apply(this,arguments);document.querySelectorAll('#keyword-body [data-glossary-live]').forEach(mount)};
 document.addEventListener('change',event=>{const el=event.target;if(!el.matches('[data-glossary-control]'))return;const host=el.closest('[data-glossary-live]'),session=active.get(host);if(!session)return;const key=el.dataset.glossaryControl,c=session.e.controls.find(c=>c.id===key);if(!c)return;session.v[key]=c.type==='checkbox'?el.checked:c.type==='number'?Number(el.value):el.value;session.v=sanitizeLabValues(session.e,session.v,labCaseDefaults(session.t,session.e));paint(host,session)});
 document.addEventListener('click',event=>{const b=event.target.closest('[data-glossary-reset]');if(b){const host=b.closest('[data-glossary-live]'),prior=active.get(host);if(prior?.traceId!=null&&typeof calculationViews!=='undefined')calculationViews.delete(prior.traceId);mount(host)}});
}
