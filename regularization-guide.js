'use strict';
(function setupRegularizationGuide(){
  'use strict';
  const style=`.rg{margin:26px 0;padding:18px;border:1px solid #dedbf2;border-radius:15px;background:#fcfbff;color:#273047;line-height:1.75}
.rg h2{font-size:1.35rem;margin:0 0 9px;color:#302a67}.rg h3{font-size:1.12rem;margin:0 0 8px;color:#373073}.rg p{margin:8px 0}.rg section{padding:16px 0;border-top:1px solid #e5e2f3}.rg section:first-of-type{border-top:0}.rg .rg-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;margin:10px 0}.rg .rg-card{padding:12px;border:1px solid #e6e5f0;background:white;border-radius:10px;min-width:0}.rg .rg-kpi{font-variant-numeric:tabular-nums;font-size:1.18rem;font-weight:700;color:#392c94}.rg label{display:block;font-weight:600;margin:10px 0 4px}.rg input[type=range]{display:block;width:100%;accent-color:#6045c4;min-height:28px}.rg button{background:#5c44bd;border:0;color:white;border-radius:8px;padding:9px 13px;cursor:pointer;margin-top:9px}.rg button:hover{background:#443295}.rg button:focus-visible,.rg input:focus-visible{outline:2px solid #4833a4;outline-offset:2px}.rg .rg-equation{padding:10px;overflow:auto;background:#f3f1ff;border-radius:8px;text-align:center;font-size:1.06rem}.rg .rg-result{border-left:3px solid #6b51cc;padding:8px 12px;background:#f5f3ff;margin-top:10px;font-variant-numeric:tabular-nums}.rg .rg-small{font-size:.9rem;color:#565e70}.rg .rg-list{padding-left:22px}.rg .rg-code{overflow:auto;background:#232638;color:#f7f7fe;padding:12px;border-radius:9px;white-space:pre;font-size:.82rem;line-height:1.5}.rg svg{max-width:100%;height:auto}.rg .rg-series{font-size:.88rem}.rg .rg-drop-row{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}.rg .rg-token{border-radius:7px;background:#eee9ff;padding:4px 9px;font-variant-numeric:tabular-nums}.rg .rg-token.off{background:#fce7e7;color:#8e3434}.rg details{margin:10px 0}.rg summary{cursor:pointer;font-weight:600}@media(max-width:720px){.rg{padding:12px}.rg .rg-grid{grid-template-columns:1fr}.rg .rg-code{font-size:.75rem}}`;
  if(!document.getElementById('regularization-guide-style')){const e=document.createElement('style');e.id='regularization-guide-style';e.textContent=style;document.head.appendChild(e)}
  let seed=42,patience=3,lambda=.01,dropRate=.2,hyperLambda=.1,hyperHistory=[];
  const train=[1.40,1.20,1.06,.94,.84,.77,.70,.64,.60,.57,.54,.52,.50,.48];
  const valid=[1.43,1.25,1.07,.91,.78,.70,.66,.68,.72,.76,.81,.88,.97,1.07];
  const fmt=x=>Number(x).toFixed(4).replace(/0+$/,'').replace(/\.$/,'');
  function oneStep(lam){const initial=.5,rate=.2;const w=initial-rate*(2*(initial-2)+2*lam*initial);return {w,validation:(w-1)**2,hypergradient:2*(w-1)*(-2*rate*initial)}}
  function chart(){
    const W=540,H=215,pad=38, min=0,max=1.5;
    const x=i=>pad+i*(W-2*pad)/(train.length-1),y=v=>H-pad-(v-min)/(max-min)*(H-2*pad);
    const path=a=>a.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
    let best=Infinity,bestEpoch=0,miss=0,stop=train.length;
    for(let i=0;i<valid.length;i++){if(valid[i]<best){best=valid[i];bestEpoch=i+1;miss=0}else miss++;if(miss>=patience){stop=i+1;break}}
    const graph='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="訓練損失持續下降，驗證損失在第七輪達最低值，之後上升">'
    +'<line x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+(H-pad)+'" stroke="#a4a8b8"/>'
    +'<line x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(H-pad)+'" stroke="#a4a8b8"/>'
    +'<path d="'+path(train)+'" fill="none" stroke="#2563a6" stroke-width="3"/>'
    +'<path d="'+path(valid)+'" fill="none" stroke="#b04571" stroke-width="3"/>'
    +'<line x1="'+x(stop-1)+'" x2="'+x(stop-1)+'" y1="'+pad+'" y2="'+(H-pad)+'" stroke="#7a59b7" stroke-dasharray="5 4"/>'
    +'<circle cx="'+x(bestEpoch-1)+'" cy="'+y(best)+'" r="5" fill="#b04571"/>'
    +'<text x="'+pad+'" y="'+(H-12)+'" font-size="12" fill="#5f6472">1</text>'
    +'<text x="'+(W-pad-18)+'" y="'+(H-12)+'" font-size="12" fill="#5f6472">14 輪</text>'
    +'<text x="'+(pad+4)+'" y="'+(pad-9)+'" font-size="12" fill="#5f6472">Loss</text>'
    +'</svg>';
    return {graph,stop,bestEpoch,best,stopped:stop<train.length};
  }
  function render(id){
    if(![7,40,41].includes(Number(id)))return '';
    return `<article class="rg" aria-label="正則化與 Lambda 自動學習完整教材">
      <h2>正則化實作教室：從 L2 到自動學習 λ</h2>
      <p>這是本課的進階補充。<strong>過擬合（Overfitting）</strong> 是訓練表現好、遇到未見過的資料卻變差；<strong>正則化（Regularization）</strong> 是限制模型過度貼合資料的做法。以下四個實驗都在瀏覽器以固定數字演示，<strong>不會訓練真實神經網路</strong>。</p>
      <section><h3>1．L2 正則化：讓過大的權重付出代價</h3>
       <p>L2 Regularization 在預測損失之外，加上權重平方和的懲罰。λ（Lambda）是「懲罰有多重」的控制鈕。</p>
       <div class="rg-equation"><math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>L</mi><mtext>總</mtext></msub><mo>=</mo><msub><mi>L</mi><mtext>預測</mtext></msub><mo>+</mo><mi>λ</mi><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msubsup><mi>w</mi><mi>i</mi><mn>2</mn></msubsup></math></div>
       <p>例：權重 w = [10, 2]，原本預測損失 0.5，權重平方和 = 10² + 2² = 104。</p>
       <label for="rg-lambda">λ = <output id="rg-lambda-label">0.01</output></label><input id="rg-lambda" type="range" min="0" max="0.1" step=".001" value=".01">
       <div class="rg-grid"><div class="rg-card"><span class="rg-small">L2 懲罰：λ × 104</span><div class="rg-kpi" id="rg-l2">1.04</div></div><div class="rg-card"><span class="rg-small">總損失：0.5 + 懲罰</span><div class="rg-kpi" id="rg-total">1.54</div></div></div>
       <p class="rg-small">λ=0 不施加 L2 懲罰；λ 過大可能造成欠擬合。真正選擇 λ 要看驗證集，不能只比較不同 λ 下的總訓練損失。</p>
       <details><summary>PyTorch 怎麼寫？</summary><pre class="rg-code"># 明確使用 L = MSE + λ × Σ(w²)
lam = 0.001
prediction_loss = torch.nn.functional.mse_loss(prediction, target)
penalty = sum(p.square().sum() for p in model.parameters()
              if p.requires_grad)
loss = prediction_loss + lam * penalty
loss.backward()
optimizer.step()

# 另一種：SGD(weight_decay=c) 加入 c*w 到梯度；
# 在此公式慣例下，等同 λ=c/2（不含排除參數的差異）。
# AdamW 的 weight_decay 是「解耦權重衰減」，
# 不能直接視為對同一 L2 目標求梯度。</pre></details>
      </section>
      <section><h3>2．Dropout：訓練時隨機遮住部分神經元輸出</h3>
       <p>Dropout（隨機失活）不是永久刪除神經元。訓練時以機率 p 將部分激活值設為 0；常見的 <em>Inverted Dropout</em> 會把留下的值除以 (1−p)，推論時關閉遮罩。</p>
       <label for="rg-drop">Dropout 比例 p = <output id="rg-drop-label">0.2</output></label><input id="rg-drop" type="range" min="0" max=".8" step=".1" value=".2">
       <p>原始輸出：1、2、3、4、5。以下顯示這一次訓練遮罩（單次不一定剛好遮掉 p 比例）。</p>
       <div class="rg-drop-row" id="rg-drop-tokens"></div><button type="button" id="rg-resample">重新抽取遮罩</button><div class="rg-result" id="rg-drop-meaning"></div>
       <p class="rg-small">PyTorch 用 <code>nn.Dropout(p=0.2)</code>；執行 <code>model.eval()</code> 時關閉一般 Dropout。</p>
      </section>
      <section><h3>3．Early Stopping：驗證表現不再改善就停止</h3>
       <p>Early Stopping（提早停止）觀察驗證損失，不是只看訓練損失。<em>Patience</em> 是「允許連續幾輪沒有改善」。停止後通常還原驗證最好的 checkpoint。</p>
       <label for="rg-patience">耐心值 Patience = <output id="rg-patience-label">3</output> 輪</label><input id="rg-patience" type="range" min="1" max="6" step="1" value="3">
       <div id="rg-early-chart"></div><p class="rg-series"><span style="color:#2563a6">●</span> 訓練損失　<span style="color:#b04571">●</span> 驗證損失　<span style="color:#7a59b7">┊</span> 停止輪次</p>
       <div class="rg-result" id="rg-early-summary"></div><p class="rg-small">圖上是預先設定的14輪教學曲線，不是股價資料或 Colab 真實訓練。驗證集選停止輪次；測試集留到最後一次評估。</p>
      </section>
      <section><h3>4．λ 能自己學嗎？分成兩條路</h3>
       <div class="rg-grid"><div class="rg-card"><strong>自動搜尋 λ（Hyperparameter Search）</strong><p>例如用 Optuna 試不同 λ，以驗證損失選較好的參數；Optuna 不代表 λ 本身會在反向傳播中更新。</p><button type="button" id="rg-gridsearch">比較候選 λ</button><div id="rg-grid-result" class="rg-small" aria-live="polite"></div></div>
       <div class="rg-card"><strong>雙層最佳化（Bilevel Optimization）</strong><p>內層用訓練損失更新權重 w；外層透過可微分的內層更新，用驗證損失的超梯度調 λ。</p><div class="rg-small">下面以一次可微分的梯度步驟示範，不是完整的多輪訓練。</div></div></div>
       <p><strong>為什麼不能用訓練損失直接學 λ？</strong> 若 L = L預測 + λΣw²，固定 w 時 ∂L/∂λ = Σw² ≥ 0；直接對 λ 做同一個損失的梯度下降，只會傾向把 λ 降到 0。</p>
       <p><strong>雙層玩具模型：</strong>目前權重 w₀ = 0.5，訓練目標值是 2，驗證目標值是 1；內層學習率 η = 0.2，外層學習率 α = 0.5。</p>
       <div class="rg-equation">w′ = w₀ − η × [2(w₀−2) + 2λw₀]<div class="rg-small">L<sub>驗證</sub> = (w′−1)²；dL<sub>驗證</sub>/dλ = 2(w′−1)(−2ηw₀)</div></div>
       <div class="rg-grid"><div class="rg-card"><div class="rg-small">目前 λ</div><div class="rg-kpi" id="rg-hyper-lambda"></div></div><div class="rg-card"><div class="rg-small">更新一步的驗證損失</div><div class="rg-kpi" id="rg-hyper-val"></div></div></div>
       <div class="rg-result" id="rg-hyper-details" aria-live="polite"></div><button type="button" id="rg-hyper-step">外層更新 λ 一步</button> <button type="button" id="rg-hyper-reset">重設 λ</button><p id="rg-hyper-history" class="rg-small"></p>
       <p class="rg-small">真實的 CNN/RNN 要處理多步梯度、λ 的非負限制、計算成本和驗證集偏差。可用 Softplus 將自由參數映射為非負 λ；這個示例採 λ ≥ 0 截斷。股價資料要按時間順序切分，避免未來資訊洩漏。</p>
       <details><summary>實作建議：先簡單再進階</summary><ol class="rg-list"><li>基線：先看訓練／驗證曲線，使用 Early Stopping。</li><li>再用 Optuna 或網格搜尋 λ，透過時間序列驗證選擇設定。</li><li>若確實要反向傳播學 λ，使用可微分的內層權重更新計算 Hypergradient，外層只看驗證資料。</li><li>最後固定選好的設定，僅用未參與選參的測試期間做一次評估。</li></ol></details>
      </section>
      <section><h3>自我檢核</h3><p><strong>情境：</strong>訓練損失還在下降，驗證損失已持續上升。應先嘗試什麼？</p><details><summary>展開參考答案</summary><p>可先還原最佳驗證 checkpoint 並使用 Early Stopping；再比較適度 L2、Dropout 與較簡單的模型。別直接用測試集反覆調 λ。</p></details></section>
    </article>`;
  }
  function rng(v){let x=(v+0x6D2B79F5)|0;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296}
  function update(){
    const root=document.querySelector('#lesson-content .rg');if(!root)return;
    const set=(id,value)=>{const el=root.querySelector('#'+id);if(el)el.textContent=value};
    set('rg-lambda-label',fmt(lambda));set('rg-l2',fmt(lambda*104));set('rg-total',fmt(.5+lambda*104));
    set('rg-drop-label',fmt(dropRate));
    const values=[1,2,3,4,5],drops=values.map((v,i)=>rng(seed*31+i*13)<dropRate),out=values.map((v,i)=>drops[i]?0:v/(1-dropRate));
    root.querySelector('#rg-drop-tokens').innerHTML=out.map((v,i)=>'<span class="rg-token'+(drops[i]?' off':'')+'" title="原始 '+values[i]+'">'+fmt(v)+'</span>').join('');
    set('rg-drop-meaning','本次遮住 '+drops.filter(Boolean).length+'/5 個激活；推論模式保留原始值 1、2、3、4、5（不用隨機遮罩）。');
    set('rg-patience-label',patience);
    const c=chart();root.querySelector('#rg-early-chart').innerHTML=c.graph;
    set('rg-early-summary','最佳驗證損失在第 '+c.bestEpoch+' 輪（'+fmt(c.best)+'）；Patience = '+patience+' → '+(c.stopped?'第 '+c.stop+' 輪停止':'14 輪內尚未觸發停止')+'；還原第 '+c.bestEpoch+' 輪模型。');
    const h=oneStep(hyperLambda);
    set('rg-hyper-lambda',fmt(hyperLambda));set('rg-hyper-val',fmt(h.validation));
    set('rg-hyper-details','內層更新後 w′ = '+fmt(h.w)+'；超梯度 = '+fmt(h.hypergradient)+'。外層更新：λ新 = max(0, λ − 0.5 × 超梯度)。');
    set('rg-hyper-history',hyperHistory.length?'已更新 '+hyperHistory.length+' 次；最近 λ：'+hyperHistory.slice(-6).map(fmt).join(' → '):'尚未更新 λ。');
  }
  document.addEventListener('input',e=>{
    if(!e.target.closest('.rg'))return;
    const id=e.target.id;
    if(id==='rg-lambda')lambda=Number(e.target.value);
    else if(id==='rg-drop')dropRate=Number(e.target.value);
    else if(id==='rg-patience')patience=Number(e.target.value);
    else return;
    update();
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||!b.closest('.rg'))return;
    if(b.id==='rg-resample')seed+=1;
    else if(b.id==='rg-gridsearch'){
      const values=[0,.01,.1,.5,1],rows=values.map(l=>({l,v:oneStep(l).validation})),best=rows.reduce((a,b)=>a.v<b.v?a:b);
      const output=document.querySelector('#lesson-content #rg-grid-result');
      if(output)output.textContent='固定玩具資料：'+rows.map(x=>'λ='+fmt(x.l)+' → 驗證損失 '+fmt(x.v)).join('；')+'。候選最佳 λ='+fmt(best.l)+'。這是網格搜尋示範，不是 Optuna 真實執行。';
      return;
    }else if(b.id==='rg-hyper-step'){const h=oneStep(hyperLambda);hyperLambda=Math.max(0,Math.min(2,hyperLambda-.5*h.hypergradient));hyperHistory.push(hyperLambda)}
    else if(b.id==='rg-hyper-reset'){hyperLambda=.1;hyperHistory=[]}
    else return;
    update();
  });
  window.RegularizationGuide={render,mount:update};
})();
