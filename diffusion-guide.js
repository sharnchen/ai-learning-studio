'use strict';
(function setupDiffusionGuide(){
  'use strict';
  const lesson=lessons.find(item=>item.id===64);
  if(lesson){
    lesson.title='Stable Diffusion／SDXL 與 VAE、Encoder、Decoder';
    lesson.sub='圖像生成流程、潛在擴散、編碼與還原、人物局部修補 · 含互動示意';
    lesson.body='Stable Diffusion 是潛在擴散模型（Latent Diffusion Model, LDM）：主要在經 VAE 壓縮的潛在空間中，依文字條件逐步去噪生成圖片。SDXL 是 Stable Diffusion XL 的模型系列，典型基礎生成尺寸約 1024×1024。VAE 由影像 Encoder（編碼器）與 Decoder（解碼器）組成；文字 Encoder 是另一個元件，不可混為一談。';
    lesson.example='以 SDXL 產生 1024×1024 圖像為例，常見 VAE 潛在張量是 128×128×4；純文生圖可從隨機潛在雜訊開始，最後由 VAE Decoder 還原。要修改人物的鞋子時，通常先把原圖經 VAE Encoder 編碼，再配合遮罩與去噪網路做局部修補，最後解碼、對齊與融合。';
    lesson.minutes=65;
  }
  const css=[
    '.sdg{margin:24px 0;border:1px solid #d9dbea;border-radius:14px;padding:18px;background:#fcfdff;line-height:1.8;color:#243044}',
    '.sdg *{box-sizing:border-box}.sdg h2{font-size:1.3rem;margin:0 0 8px}.sdg h3{font-size:1.12rem;margin:0 0 10px}',
    '.sdg section{margin:20px 0 0;padding-top:16px;border-top:1px solid #e2e5ed}.sdg p{margin:8px 0}',
    '.sdg .sdg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0}',
    '.sdg .sdg-card{border:1px solid #e0e3ef;border-radius:11px;padding:13px;background:white;min-width:0}',
    '.sdg .sdg-card strong{display:block;margin-bottom:5px}.sdg .sdg-small{color:#5b6879;font-size:.91em}',
    '.sdg .sdg-flow{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:12px 0;padding:12px;background:#f3f6fd;border-radius:10px}',
    '.sdg .sdg-step{border:1px solid #bbcce5;background:#fff;padding:8px 11px;border-radius:8px;flex:1 1 115px;text-align:center;font-size:.92em}',
    '.sdg .sdg-arrow{font-weight:bold;color:#50719f}.sdg code,.sdg .sdg-formula{display:block;background:#eef2fa;padding:9px 11px;border-radius:7px;white-space:normal;overflow-wrap:anywhere;font-family:ui-monospace,Consolas,monospace}',
    '.sdg select,.sdg input[type=range]{max-width:100%;width:100%;margin:7px 0}.sdg .sdg-output{font-weight:700;color:#224e89}',
    '.sdg .sdg-version{width:100%;border-collapse:collapse;font-size:.94em}.sdg .sdg-version th,.sdg .sdg-version td{border-bottom:1px solid #e0e4ef;padding:8px;vertical-align:top;text-align:left}',
    '.sdg ol{padding-left:1.4rem}.sdg li{margin:6px 0}.sdg details{padding:9px 0}.sdg summary{cursor:pointer;font-weight:700}',
    '@media(max-width:650px){.sdg{padding:12px}.sdg .sdg-grid{grid-template-columns:1fr}.sdg .sdg-flow{display:grid;grid-template-columns:1fr}.sdg .sdg-step{flex:auto}.sdg .sdg-arrow{text-align:center;transform:rotate(90deg)}.sdg .sdg-version{font-size:.86em}}'
  ].join('');
  if(!document.getElementById('diffusion-guide-css')){
    const style=document.createElement('style');style.id='diffusion-guide-css';style.textContent=css;document.head.appendChild(style);
  }
  function render(id){
    if(Number(id)!==64)return '';
    return [
      '<article class="sdg" aria-label="Stable Diffusion、SDXL、VAE、編碼器與解碼器完整教學">',
      '<h2>Stable Diffusion 與 VAE：從雜訊變成圖片</h2>',
      '<p><strong>白話理解：</strong>先把圖片的資訊壓成小張「特徵地圖」，讓生成網路在這個較小的空間裡工作；它從雜訊逐步收斂成有結構的特徵，最後由解碼器還原成大家看到的圖片。這不是逐像素拿筆畫畫。</p>',
      '<p><strong>正式定義：</strong>Stable Diffusion 是以文字等條件引導的潛在擴散模型（Latent Diffusion Model, LDM）。SDXL（Stable Diffusion XL）是其中較大、以高解析度生成為主要設計目標的模型系列；不同家族的骨幹與編碼器不能一概視為相同。</p>',
      '<section><h3>1．各個模型元件負責什麼？</h3>',
      '<div class="sdg-grid">',
      '<div class="sdg-card"><strong>Text Encoder（文字編碼器）</strong>將提示詞轉成語意表示，告訴生成模型「要畫什麼」。SDXL 基礎架構會使用兩個文字編碼器。<p class="sdg-small">注意：它不負責把照片壓縮。</p></div>',
      '<div class="sdg-card"><strong>Denoiser（去噪網路）</strong>根據目前的雜訊狀態、時間步與文字條件，預測去噪所需資訊。傳統 SD、SDXL 主要採 U-Net；其他擴散家族可能採 DiT 等架構。</div>',
      '<div class="sdg-card"><strong>VAE Encoder（影像編碼器）</strong>把輸入影像壓成潛在表示（Latent Representation）。常用於圖生圖與局部重繪，純文字生圖通常不會用它編碼原始照片。</div>',
      '<div class="sdg-card"><strong>VAE Decoder（影像解碼器）</strong>把完成的潛在表示重建成 RGB 圖片。因為壓縮是有損的，極細線條、文字或鞋帶可能變得較不清楚。</div>',
      '</div></section>',
      '<section><h3>2．切換生成方式，看資料怎麼流動</h3>',
      '<label for="sdg-mode">選擇工作流程</label>',
      '<select id="sdg-mode"><option value="txt">文生圖（Text-to-Image）</option><option value="img">圖生圖（Image-to-Image）</option><option value="mask">局部重繪（Inpainting／換鞋）</option></select>',
      '<div class="sdg-flow" id="sdg-flow" aria-live="polite"></div>',
      '<p class="sdg-small" id="sdg-mode-note"></p>',
      '<label for="sdg-stage">去噪階段示意（0＝隨機潛在雜訊，4＝已完成並可解碼）</label>',
      '<input id="sdg-stage" type="range" min="0" max="4" step="1" value="0">',
      '<div class="sdg-card" role="status"><strong id="sdg-stage-title">階段 0：潛在雜訊</strong><p id="sdg-stage-text"></p></div>',
      '<p class="sdg-small">這是教學用的概念階段切換，不是實際模型推論，也不代表每個採樣器固定只有五步。</p>',
      '</section>',
      '<section><h3>3．VAE 的 Encoder 與 Decoder：壓縮多少？</h3>',
      '<p><strong>一般 Autoencoder（自編碼器）：</strong>編碼後得到一組表示，再交給 Decoder 重建。<strong>VAE（Variational Autoencoder，變分自編碼器）：</strong>Encoder 估計潛在分布的平均值 μ 與變異數 σ²；訓練時可透過重參數化技巧取樣，並以 KL 散度正則化潛在分布。</p>',
      '<div class="sdg-formula" role="img" aria-label="z 等於 μ 加上 σ 乘以 ε，其中 ε 服從標準常態分布">z = μ + σ × ε，ε ~ N(0, I)</div>',
      '<p class="sdg-small">μ 是平均值；σ 是標準差；ε 是標準常態雜訊。使用 VAE 時的潛在縮放、取樣策略依實作而定。</p>',
      '<label for="sdg-size">選擇正方形輸入影像尺寸</label>',
      '<select id="sdg-size"><option value="512">512 × 512</option><option value="768">768 × 768</option><option value="1024" selected>1024 × 1024（SDXL 常見）</option><option value="1536">1536 × 1536</option></select>',
      '<div class="sdg-flow" aria-label="影像編碼與重建流程"><span class="sdg-step" id="sdg-rgb">RGB 圖像</span><span class="sdg-arrow" aria-hidden="true">→</span><span class="sdg-step">VAE Encoder</span><span class="sdg-arrow" aria-hidden="true">→</span><span class="sdg-step" id="sdg-latent">潛在特徵</span><span class="sdg-arrow" aria-hidden="true">→</span><span class="sdg-step">VAE Decoder</span><span class="sdg-arrow" aria-hidden="true">→</span><span class="sdg-step">RGB 重建圖</span></div>',
      '<p class="sdg-output" id="sdg-count" aria-live="polite"></p>',
      '<p class="sdg-small">典型 SDXL VAE 在長、寬方向各壓縮 8 倍，潛在特徵一般為 4 通道；像素 RGB 標量數與潛在標量數相比是 48:1，但<strong>這不是檔案壓縮比，也不能直接推算 VRAM 使用量</strong>。尺寸 1536 僅用來展示比例，並非每個 checkpoint 的原生最佳尺寸。</p>',
      '<details><summary>為什麼 VAE 不是直接吐出固定的編碼？</summary><p>一般自編碼器可將輸入直接映射到固定表示；VAE 使用條件分布（常以 μ 和 σ² 表示）並加入重建損失與 KL 散度項。這讓潛在表示有統計結構，但也可能帶來重建模糊。推論時可以採用均值或特定取樣方式；不代表每次輸入同一圖都一定要隨機改動。</p></details>',
      '</section>',
      '<section><h3>4．SD 1.5 與 SDXL 有什麼差別？</h3>',
      '<table class="sdg-version"><thead><tr><th>比較</th><th>Stable Diffusion 1.5</th><th>SDXL 1.0</th></tr></thead><tbody>',
      '<tr><td>典型基礎生成尺寸</td><td>512 × 512</td><td>1024 × 1024</td></tr>',
      '<tr><td>主要去噪骨幹</td><td>U-Net</td><td>更大的 U-Net</td></tr>',
      '<tr><td>文字條件</td><td>主要一組 CLIP 文字編碼</td><td>兩組文字編碼與額外條件設計</td></tr>',
      '<tr><td>可選的細化</td><td>常用其他後處理或模型</td><td>可搭配 Refiner 第二階段細化；不是必須</td></tr>',
      '<tr><td>資源與表現</td><td>模型較輕、社群資源廣</td><td>一般更吃顯存，構圖與細節潛力通常較好；品質仍取決於微調模型、提示詞、採樣與設定</td></tr>',
      '</tbody></table>',
      '</section>',
      '<section><h3>5．人物換鞋時如何保住鞋帶與腳趾？</h3>',
      '<ol><li><strong>先保住構圖：</strong>保持人物、腳踝、兩腳位置與相機視角；先選定新鞋參考圖，左右腳分別檢查。</li>',
      '<li><strong>準確分離遮罩：</strong>遮住需要移除的原鞋與鞋帶，避免把腳趾、腳背、地板全部不必要地覆蓋。原鞋輪廓可能比新鞋大，需檢查殘影區。</li>',
      '<li><strong>局部放大後重繪：</strong>在保留周邊上下文的前提下高解析度裁切雙腳或各腳，再用合適的 Inpainting、姿態／邊緣控制及參考鞋圖生成。擴大整張圖不保證鞋帶更清楚。</li>',
      '<li><strong>貼回同座標並融合：</strong>依原裁切座標／縮放比例回貼，遮罩邊緣做適度羽化，校正光照、陰影與色溫；同時檢查是否多長出一隻鞋。</li>',
      '<li><strong>最後針對細節檢查：</strong>比較腳趾數量、鞋帶連續性、鞋跟落地和兩鞋一致性。必要時只對問題區域二次小範圍修補。</li></ol>',
      '<p><strong>關鍵觀念：</strong>VAE 可能造成高頻細節損失，但不是小於 8 像素的細節必然消失。最終畫質還取決於去噪網路、遮罩、局部尺寸、採樣與融合方法。</p>',
      '</section>',
      '<section><h3>6．立即自我檢核</h3>',
      '<details><summary>Q1：純文生圖一定需要先使用 VAE Encoder 嗎？</summary><p>不需要。典型潛在文生圖直接從隨機潛在雜訊開始，完成去噪後才交給 VAE Decoder；文字 Encoder 仍會處理提示詞。</p></details>',
      '<details><summary>Q2：1024 × 1024 圖片為什麼會變成 128 × 128 × 4？</summary><p>常見 SDXL VAE 在長、寬方向各壓成 1/8：1024 ÷ 8 = 128；潛在張量使用 4 個通道。因此 128 × 128 × 4 = 65,536 個標量。</p></details>',
      '<details><summary>Q3：換鞋生成後鞋帶模糊，單靠提高解析度就夠了嗎？</summary><p>不夠。先檢查遮罩是否包含舊鞋、生成的腳與鞋是否對齊、VAE 與去噪品質、是否有局部重繪，以及貼回融合造成的二次模糊。</p></details>',
      '</section></article>'
    ].join('');
  }
  function mount(){
    const root=document.querySelector('#lesson-content .sdg');
    if(!root)return;
    const workflows={
      txt:{steps:['提示詞 → Text Encoder','從隨機 latent noise 開始','U-Net 逐步去噪','VAE Decoder → RGB 圖'],note:'純文生圖通常不需要原圖與 VAE Encoder。SDXL 可額外搭配 Refiner，但不屬於必經步驟。'},
      img:{steps:['原始圖片 → VAE Encoder','對 latent 加入雜訊＋文字條件','U-Net／採樣器去噪','VAE Decoder → 修改後圖片'],note:'圖生圖需先編碼原始圖片；強度越高通常改變越大，但不是線性且不保證保持原構圖。'},
      mask:{steps:['照片＋鞋子遮罩','VAE Encoder＋參考／文字條件','僅針對目標區域做 Inpainting','VAE Decoder＋對齊融合'],note:'遮罩與實際保留區域的處理依 pipeline 而不同；超出遮罩的上下文也可能受 VAE 重建或融合影響。'}
    };
    const stages=[
      ['階段 0：隨機潛在雜訊','特徵目前沒有明顯可辨認的語意或輪廓。'],
      ['階段 1：建立粗略結構','去噪逐漸形成大構圖、物體位置與視角。'],
      ['階段 2：物體與形狀收斂','人物、衣服、鞋型等結構逐步更一致。'],
      ['階段 3：局部細節完善','紋理、材質、鞋帶及陰影進一步被修正。'],
      ['階段 4：潛在結果完成','採樣結束；VAE Decoder 會把潛在表示轉回 RGB 圖像。']
    ];
    const mode=root.querySelector('#sdg-mode'),stage=root.querySelector('#sdg-stage'),size=root.querySelector('#sdg-size');
    function updateMode(){
      const data=workflows[mode.value];
      root.querySelector('#sdg-flow').innerHTML=data.steps.map(t=>'<span class="sdg-step">'+t+'</span>').join('<span class="sdg-arrow" aria-hidden="true">→</span>');
      root.querySelector('#sdg-mode-note').textContent=data.note;
    }
    function updateStage(){
      const d=stages[Number(stage.value)];
      root.querySelector('#sdg-stage-title').textContent=d[0];
      root.querySelector('#sdg-stage-text').textContent=d[1];
    }
    function updateSize(){
      const s=Number(size.value),l=s/8,rgb=s*s*3,latent=l*l*4;
      root.querySelector('#sdg-rgb').textContent=s+' × '+s+' × 3';
      root.querySelector('#sdg-latent').textContent=l+' × '+l+' × 4';
      root.querySelector('#sdg-count').textContent='RGB：'+rgb.toLocaleString()+' 個標量；latent：'+latent.toLocaleString()+' 個標量；數量比 '+(rgb/latent).toFixed(0)+'：1';
    }
    mode.addEventListener('change',updateMode);
    stage.addEventListener('input',updateStage);
    size.addEventListener('change',updateSize);
    updateMode();updateStage();updateSize();
  }
  window.DiffusionGuide={render,mount};
})();