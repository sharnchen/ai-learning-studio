'use strict';
// Extend existing regularization glossary entries; preserve term IDs and progress.
(function(){
const details={
d5t24:['避免模型只背熟訓練題目，而是能回答沒看過的新題目。','正則化（Regularization）是降低過擬合、改善泛化的策略總稱。可使用 L1／L2 懲罰、權重衰減、Dropout、資料增強、提早停止等方式。先比較訓練損失與驗證損失：若訓練持續改善但驗證惡化，可能出現過擬合。'],
d5t25:['對權重的絕對值收取額外成本，讓部分不重要的權重變成零。','L1：L_total = L_data + λ × Σ|wᵢ|。例如權重 [2, -1]，λ=0.1，則額外懲罰 0.1×(2+1)=0.3。L1 常有利於產生稀疏參數，但不能保證所有不重要特徵都被剔除。'],
d5t26:['權重越大，受到的額外懲罰越重，避免模型依賴極端參數。','L2：L_total = L_data + λ × Σ(wᵢ²)。例如權重 [2, -1]，λ=0.1，則懲罰 0.1×(4+1)=0.5。若此定義不含 1/2，L2 梯度額外增加 2λw；若採 (λ/2)Σw²，則增加 λw。λ=0 表示沒有此懲罰；λ 過大可能欠擬合。'],
d5t27:['每次更新權重時，順便讓權重稍微縮小。','以 SGD 且損失使用 (λ/2)Σw² 為例，更新可寫成 w ← (1−ηλ)w−η∇L_data。AdamW 採解耦式權重衰減，不能直接等同 Adam 加入 L2 懲罰；實作時需確認哪些 bias／normalization 參數不做衰減。'],
d5t28:['模型在驗證集開始退步時，就停止繼續練習。','Early Stopping（提早停止）：監測驗證損失，設定 patience，例如連續 5 個 epoch 沒有改善就停止，並還原驗證表現最佳的權重。不要用測試集來反覆決定停止時機。'],
d5t32:['考試題背得很熟，但換一份新題目就答不好。','Overfitting（過擬合）常見訊號是訓練誤差下降、驗證誤差上升。改善方式包括增加多樣化資料、減少模型複雜度、資料增強、正則化與提早停止。訓練／驗證資料洩漏也可能使評估失真。'],
d4t11:['訓練前設定的控制旋鈕，例如學習率與正則化強度 λ。','固定 λ 通常視為超參數，透過驗證集搜尋或貝葉斯最佳化調整。若希望 λ 自動學習，可使用雙層最佳化（bilevel optimization）：內層以訓練損失更新模型權重 w，外層以驗證損失更新 λ，並透過超梯度求導；可用 softplus(a) 保證 λ≥0。不能單純把 λ 放入同一個訓練損失一起最小化，否則當正則項非負時容易把 λ 推向 0。'],
d6t15:['把資料輪流分成訓練組和驗證組，挑選比較可靠的設定。','Cross-Validation（交叉驗證）可用來比較 λ，例如 0、0.0001、0.001、0.01、0.1。每個候選值在各折訓練後評估，選擇平均驗證表現較佳者；最後仍須使用未參與調參的測試集做獨立評估。']
};
for(const t of keywordCatalog){const d=details[t.id];if(d)plainKeywordDefinitions[t.id]=d[0];}
const formulae={
d5t25:[['L1 正則化',String.raw`L_{\mathrm{total}}=L_{\mathrm{data}}+\lambda\sum_i |w_i|`],['計算範例',String.raw`0.1\,(|2|+|-1|)=0.3`]],
d5t26:[['L2 正則化',String.raw`L_{\mathrm{total}}=L_{\mathrm{data}}+\lambda\sum_i w_i^2`],['計算範例',String.raw`0.1\,(2^2+(-1)^2)=0.5`],['梯度（無 1/2 係數）',String.raw`\nabla_w L_{\mathrm{total}}=\nabla_w L_{\mathrm{data}}+2\lambda w`],['另一常見定義',String.raw`L_{\mathrm{total}}=L_{\mathrm{data}}+\frac{\lambda}{2}\sum_i w_i^2`]],
d5t27:[['SGD 權重衰減',String.raw`w_{t+1}=(1-\eta\lambda)w_t-\eta\nabla_w L_{\mathrm{data}}(w_t)`]],
d4t11:[['內層：訓練模型權重',String.raw`w^*(\lambda)=\operatorname*{arg\,min}_w\left[L_{\mathrm{train}}(w)+\lambda R(w)\right]`],['外層：驗證集調整正則化強度',String.raw`\lambda^*=\operatorname*{arg\,min}_{\lambda\ge0}L_{\mathrm{val}}(w^*(\lambda))`],['非負參數化',String.raw`\lambda=\operatorname{softplus}(a)=\ln(1+e^a)`]],
d6t15:[['候選正則化係數',String.raw`\lambda\in\{0,10^{-4},10^{-3},10^{-2},10^{-1}\}`]]
};
function renderMath(items){return items.map(([label,latex])=>{try{return '<div class="keyword-math" style="margin:12px 0;overflow-x:auto"><div style="font-weight:600;margin-bottom:5px">'+escapeHtml(label)+'</div>'+ (typeof katex!=='undefined'?katex.renderToString(latex,{displayMode:true,throwOnError:false,output:'htmlAndMathml'}):'<code>'+escapeHtml(latex)+'</code>')+'</div>';}catch{return '<p>'+escapeHtml(label+': '+latex)+'</p>';}}).join('');}
const previous=keywordDefinitions;
keywordDefinitions=function(term){const base=previous(term),d=details[term.id];return d?base+'<div class="keyword-extra" style="margin-top:10px;line-height:1.85"><strong>原理、公式與實例</strong>'+renderMath(formulae[term.id]||[])+'<p>'+escapeHtml(d[1])+'</p></div>':base;};
})();
