'use strict';

(function () {
  const cnnId = 'd7t10';
  const examples = {
    d7t11: '用 3 × 3 卷積核逐格乘上影像區塊，再加總及加上偏置。若區塊只有上排 [1, 1, 1]，卷積核上排為 [1, 1, 1]、中排為 0、下排為 [−1, −1, −1]，偏置為 0，輸出就是 3。若亮線移到下排，輸出就是 −3。',
    d7t12: '第一層卷積的每個核讀取一個灰階通道，第二層的每個核同時讀取前一層的 32 個通道。第二層每個核有 3 × 3 × 32 個權重及 1 個偏置。',
    d7t14: '一個卷積核在所有位置計算出的數值構成一張特徵圖。第一層用 32 個核，得到 32 張 28 × 28 特徵圖。',
    d7t15: '輸入灰階圖有 1 個通道。第一次卷積輸出 32 個特徵通道，第二次卷積輸出 64 個特徵通道。',
    d7t16: '示例的卷積視窗每次移動 1 格。最大池化視窗每次移動 2 格，因此在這個例子中，池化後的寬與高各減半。',
    d7t17: '使用 3 × 3 卷積核、步幅 1 時，每邊補 1 格零值可保持輸入的高與寬。',
    d7t19: '池化分別在各通道內聚合區域數值。這個 CNN 使用最大池化，28 × 28 × 32 因此縮為 14 × 14 × 32。',
    d7t20: '例如 2 × 2 視窗內的值是 [0, 3; 1, 2]，最大池化輸出 3。搭配步幅 2，14 × 14 × 64 變成 7 × 7 × 64。',
    d7t23: '依固定順序把 7 × 7 × 64 的特徵張量轉為長度 3,136 的向量。各數值維持原值，索引仍對應原先的位置與通道。',
    d4t7: '將 3,136 個特徵轉為 10 個類別分數（logits）。每個類別各有 3,136 個權重與一個偏置，共 (3,136 + 1) × 10 = 31,370 個參數。',
    d4t13: 'ReLU(z) = max(0, z)。卷積輸出 3 時保留 3，輸出 −3 時變成 0。兩層卷積後都使用 ReLU 加入非線性。',
    d4t18: 'Softmax 將十個類別分數 zᵢ 轉為 pᵢ = exp(zᵢ) ÷ Σⱼ exp(zⱼ)。所有類別機率總和為 1，取最高者作為預測。',
    d4t27: '訓練時隨機將展平向量中的部分特徵設為 0。若丟棄率為 0.25，常見實作會把保留值乘以 1 ÷ 0.75 以維持期望尺度。推論使用完整向量。',
    d5t21: '標籤為 5 時，分類損失為 −ln(p₅)。若 p₅ = 0.8，損失約 0.223。若 p₅ = 0.1，損失約 2.303。',
    d4t20: '反向傳播從分類損失求出卷積核與全連接層各參數的梯度，再由最佳化器更新參數。'
  };

  const stages = [
    ['輸入', '28 × 28 × 1', '', '784 個灰階像素，可將 0～255 縮放至 0～1。', '0'],
    ['卷積 ① + ReLU', '28 × 28 × 32', 'd7t11', '32 個卷積核可學到對橫線、直線或邊緣的反應。', '320'],
    ['最大池化 ①', '14 × 14 × 32', 'd7t20', '每張特徵圖的 2 × 2 區域取最大值。', '0'],
    ['卷積 ② + ReLU', '14 × 14 × 64', 'd7t12', '每個核整合前一層 32 個通道，可學到轉角或曲線等組合。', '18,496'],
    ['最大池化 ②', '7 × 7 × 64', 'd7t20', '高與寬再減半，保留 64 個通道。', '0'],
    ['展平', '3,136', 'd7t23', '將空間位置與通道依固定順序排成向量。', '0'],
    ['Dropout', '3,136', 'd4t27', '訓練時隨機停用部分特徵。', '0'],
    ['全連接層', '10 個分數', 'd4t7', '整合筆畫特徵，為 0～9 各算一個分數。', '31,370'],
    ['Softmax 輸出', '10 個機率', 'd4t18', '將分數轉為機率，取機率最高的類別。', '0']
  ];

  let diagramCount = 0;
  function drawFlow(columns, name, diagramId) {
    const marker = 'cnn-arrow-' + name + '-' + diagramId;
    const columnWidth = columns === 1 ? 288 : 186;
    const boxWidth = columnWidth - 18;
    const nodes = stages.map(([label, shape], index) => {
      const column = index % columns;
      const x = 9 + column * columnWidth;
      const y = 8 + Math.floor(index / columns) * 86;
      const center = x + boxWidth / 2;
      const color = index === 0 ? '#eaf0ff' : index < 5 ? '#e5f5ef' : '#eee8fc';
      let connector = '';
      if (index < stages.length - 1) {
        if (columns === 1) connector = 'M' + center + ' ' + (y + 56) + ' v28';
        else if (column < columns - 1) connector = 'M' + (x + boxWidth) + ' ' + (y + 28) + ' h16';
        else connector = 'M' + center + ' ' + (y + 56) + ' v15 H' + (9 + boxWidth / 2) + ' v13';
      }
      return '<g><rect x="' + x + '" y="' + y + '" width="' + boxWidth + '" height="56" rx="10" fill="' + color + '" stroke="#9aaac2"/>'
        + '<text x="' + center + '" y="' + (y + 23) + '" font-weight="700">' + escapeHtml(label) + '</text>'
        + '<text x="' + center + '" y="' + (y + 44) + '">' + escapeHtml(shape) + '</text>'
        + (connector ? '<path d="' + connector + '" fill="none" stroke="#627594" stroke-width="1.5" marker-end="url(#' + marker + ')"/>' : '') + '</g>';
    }).join('');
    return '<svg class="cnn-flow-' + name + '" aria-hidden="true" viewBox="0 0 ' + columns * columnWidth + ' ' + (Math.ceil(stages.length / columns) * 86 - 14)
      + '" text-anchor="middle" font-size="14" fill="#172640"><defs><marker id="' + marker
      + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#627594"/></marker></defs>' + nodes + '</svg>';
  }

  function architectureDiagram() {
    const diagramId = ++diagramCount;
    return '<figure class="cnn-diagram">' + drawFlow(3, 'desktop', diagramId) + drawFlow(1, 'mobile', diagramId)
      + '<figcaption>手寫數字辨識的九個處理步驟。各層的輸出尺寸與說明見下表。</figcaption></figure>';
  }

  function termButton(id, text) {
    return '<button type="button" data-learn-keyword="' + id + '">' + escapeHtml(text) + '</button>';
  }

  function architectureDetails() {
    const rows = stages.map(([name, shape, id, explanation, params]) =>
      '<tr><th scope="row">' + escapeHtml(name) + '</th><td>' + escapeHtml(shape) + '</td><td>' + escapeHtml(explanation) + '</td><td>' + params + '</td><td>'
      + (id ? termButton(id, '詞條') : '—') + '</td></tr>'
    ).join('');
    return '<section class="keyword-section"><h2>手寫數字辨識 CNN 結構圖</h2>'
      + '<figure class="cnn-diagram"><a href="cnn-handwritten.html" target="_blank" rel="noopener"><img src="assets/cnn-handwritten-architecture.jpg" width="2047" height="667" style="display:block;width:100%;height:auto" alt="CNN 手寫數字辨識的卷積、池化、展平與分類架構"></a><figcaption><a href="cnn-handwritten.html" target="_blank" rel="noopener">開啟完整圖文說明</a></figcaption></figure>'
      + architectureDiagram()
      + '<p>這個例子使用兩層 3 × 3 卷積（步幅 1、每邊補 1 格），卷積核數分別為 32 與 64。兩次最大池化都用 2 × 2 視窗、步幅 2。</p>'
      + '<div class="cnn-layer-table" tabindex="0" role="region" aria-label="可橫向捲動的 CNN 層級表"><table><thead><tr><th scope="col">操作</th><th scope="col">輸出形狀</th><th scope="col">處理方式</th><th scope="col">可訓練參數</th><th scope="col">詳細說明</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      + '<p>兩層卷積各有 (3 × 3 × 1 + 1) × 32 = 320 和 (3 × 3 × 32 + 1) × 64 = 18,496 個參數。全連接層有 (3,136 + 1) × 10 = 31,370 個參數，合計 50,186。每個算式的 +1 為偏置。</p>'
      + '<h3>手算卷積、ReLU 與最大池化</h3><p>局部影像只有上排 [1, 1, 1]，卷積核上排為 1、中排為 0、下排為 −1。逐格相乘加總得到 3，通過 ReLU 後仍為 3。若相同亮線移到下排，卷積值是 −3，ReLU 輸出 0。若池化讀到 [0, 3; 1, 2]，輸出最大值 3。</p>'
      + '<h3>從預測到訓練</h3><p>以數字 5 為例，模型可先找局部橫線與直線，再組合出轉角與下方彎弧。Softmax 將 10 個分數轉為機率。如果正解是 5，預測 p₅ = 0.8 時，交叉熵約為 0.223。p₅ 降至 0.1 時，損失升為 2.303。反向傳播求梯度，再由最佳化器更新參數。</p>'
      + termButton('d4t13', 'ReLU') + ' ' + termButton('d5t21', '類別交叉熵') + ' ' + termButton('d4t20', '反向傳播') + '</section>';
  }

  const previousDefinitions = keywordDefinitions;
  keywordDefinitions = function (term) {
    const base = previousDefinitions(term);
    if (term.id === cnnId) return base + architectureDetails();
    const example = examples[term.id];
    return example ? base + '<section class="keyword-section"><h3>手寫數字辨識範例</h3><p>'
      + escapeHtml(example) + '</p>' + termButton(cnnId, '查看 CNN 結構圖') + '</section>' : base;
  };

  const previousLearningButton = keywordLearningButton;
  keywordLearningButton = function (term) {
    const buttons = previousLearningButton(term);
    return term.id === cnnId ? buttons.replace('實例・互動・實作', 'CNN 結構圖與實例') : buttons;
  };

  const cnn = keywordCatalog.find(term => term.id === cnnId);
  if (cnn) cnn.definition += ' 以手寫數字辨識為例，兩組卷積、ReLU 與最大池化從 28 × 28 灰階影像擷取筆畫，經展平、Dropout 與全連接層後，由 Softmax 輸出 0～9 的機率。';
})();
