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

  return {summary, guide, hasMethod};
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
  const table=(headers,rows)=>'<table style="width:100%;table-layout:fixed;overflow-wrap:anywhere"><thead><tr>'+headers.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const sec=(n,title,body)=>'<section class="keyword-section"><h2>'+n+'. '+title+'</h2>'+body+'</section>';
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
    sec(17,'iPAS 自我測驗（自編練習，非官方考古題）','<div data-svm-quiz>'+qs.map(([q,a,c,e],i)=>'<fieldset style="margin:1rem 0"><legend>'+(i+1)+'. '+q+'</legend>'+a.map((x,j)=>'<label style="display:block"><input type="radio" name="svm-q-'+i+'" value="'+j+'"> '+x+'</label>').join('')+'<p data-svm-feedback="'+i+'"></p></fieldset>').join('')+'<button type="button" data-svm-grade>批改答案</button> <button type="button" data-svm-reset>重新測驗</button><p data-svm-score aria-live="polite"></p></div>')+
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
