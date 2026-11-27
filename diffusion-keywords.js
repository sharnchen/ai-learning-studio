'use strict';
// Extend existing glossary entries without changing IDs, catalog size, or saved progress.
(function(){
  const additions={
    d13t4:{plain:'用文字描述畫面，模型從雜訊逐步產生影像。',detail:'Stable Diffusion／SDXL 文生圖：提示詞 → Text Encoder（文字編碼器）→ 潛在雜訊 → 去噪網路 → VAE Decoder → RGB 圖片。純文生圖不需要先用 VAE Encoder 編碼一張原始照片。'},
    d13t5:{plain:'拿現有圖片當底稿，依文字要求修改內容。',detail:'圖生圖：原圖 → VAE Encoder → 潛在表示加噪 → 依文字條件去噪 → VAE Decoder。去噪強度通常越高，原圖構圖越可能改變。'},
    d13t11:{plain:'把圖片濃縮成特徵，再嘗試還原圖片。',detail:'Autoencoder 包含 Encoder（編碼器）與 Decoder（解碼器）。Encoder 將輸入映射為潛在表示，Decoder 由潛在表示重建輸入；一般自動編碼器不必具備 VAE 的機率分布設計。'},
    d13t12:{plain:'先把影像壓成較小的特徵圖，最後再把特徵圖還原成圖片。',detail:'VAE（Variational Autoencoder，變分自動編碼器）由影像 Encoder 和 Decoder 組成。Encoder 估計潛在分布的平均值 μ 與變異數 σ²；訓練時可用重參數化 z = μ + σ × ε，其中 ε ~ N(0,I)，並結合重建損失與 KL 散度。SDXL 常見 VAE 將 1024×1024×3 影像編成 128×128×4 潛在張量，再由 Decoder 重建；這是張量元素數量比 48:1，不等於檔案壓縮比或顯存節省倍數。細鞋帶可能因有損重建而模糊，但並非小於 8 像素的細節一定消失。'},
    d13t13:{plain:'從亂糟糟的雜訊開始，逐步整理出清楚的畫面。',detail:'擴散模型學習去噪或相關生成動態。以 Stable Diffusion 1.5、SDXL 為例，主要去噪骨幹是 U-Net；其他模型可使用 Transformer。SD 1.5 典型基礎尺寸 512×512，SDXL 典型基礎尺寸 1024×1024，實際品質仍依模型與設定而定。'},
    d13t14:{plain:'不直接在整張大圖片上反覆修改，而是在縮小的特徵空間裡生成。',detail:'Stable Diffusion 是 Latent Diffusion Model（LDM，潛在擴散模型）的代表。文字經 Text Encoder 變成條件，U-Net 在 latent（潛在表示）中逐步去噪，最後 VAE Decoder 還原為 RGB 影像。文字編碼器與 VAE 影像編碼器負責不同工作；SDXL 常使用兩組文字編碼器。'},
    d13t15:{detail:'DiT 是以 Transformer 作為去噪骨幹的架構，不等同 VAE、Text Encoder 或取樣器；不能把所有擴散模型都當成 U-Net。'},
    d13t17:{plain:'像把大張照片整理成小張、濃縮過的特徵地圖。',detail:'以常見 SDXL VAE 為例，長與寬各縮為 1/8，1024÷8=128，因此 1024×1024 RGB 圖像對應 128×128×4 的 latent。潛在空間不是一般可直接觀看的 RGB 圖。'},
    d13t18:{detail:'潛在表示是 Encoder 產生或去噪過程更新的特徵張量。例如 SDXL 1024×1024 影像的常見 latent 形狀為 4×128×128（通道在前）；它與 128×128×4 是不同維度排列的表示法。'},
    d13t19:{detail:'圖生圖通常先把原圖編碼成 latent，再依強度加噪；文生圖則通常從隨機 latent 雜訊開始。噪聲程度影響保留原始內容的能力。'},
    d13t20:{detail:'去噪網路根據目前狀態、時間步及文字等條件，預測更新所需的資訊；早期常形成大致構圖，後期逐步完善材質與細節，但這是概念性描述，不代表每次生成都有固定五個階段。'},
    d13t21:{detail:'Scheduler 決定去噪時使用的時間步、噪聲尺度與更新安排；不同實作對 Scheduler 與 Sampler 的命名和分工可能不同。'},
    d13t22:{detail:'Sampler 根據模型預測與數值方法逐步更新樣本；步數增加不保證品質持續提高，也會影響推論時間。'},
    d13t23:{detail:'CFG 調整生成結果遵循提示詞的程度；太高可能出現過度飽和、變形或細節劣化。不同模型未必使用同一套 CFG 公式。'},
    d13t26:{plain:'只重畫指定的局部，其他區域盡量保留。',detail:'局部重繪可分六步：① 檢查遮罩是否完整覆蓋目標與殘影，避免誤遮保留區域；② 保留周圍環境與陰影等上下文；③ 裁切放大目標區域，搭配參考圖及姿態／邊緣條件進行局部生成；④ 依原裁切座標與縮放比例貼回，對齊物件邊界；⑤ 輕度羽化邊界並校正光線、色溫、陰影；⑥ 檢查結構連續性、細節一致性及是否多生成物件。單純放大整張圖無法保證細節清晰，VAE 解碼與二次縮放也可能造成模糊。'},
    d13t28:{detail:'生成條件可來自文字、原圖、遮罩、姿態、深度、邊緣或參考物件。除了描述目標外觀，還應指定物件位置、結構與相機視角。'}
  };
  for(const term of keywordCatalog){
    const extra=additions[term.id];
    if(!extra)continue;
    if(extra.plain)plainKeywordDefinitions[term.id]=extra.plain;
  }
  const original=keywordDefinitions;
  keywordDefinitions=function(term){
    const base=original(term);
    const extra=additions[term.id];
    if(!extra)return base;
    return base+'<div class="keyword-extra" style="margin-top:10px;line-height:1.85"><strong>原理與實際應用</strong><p>'+escapeHtml(extra.detail)+'</p></div>';
  };
})();
