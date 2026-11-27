'use strict';
// Extend the existing Vocabulary entry; keep its persistent ID and progress.
(() => {
 const id='d8t8', prior=keywordExample;
 const term=keywordCatalog.find(t=>t.id===id);if(!term)return;
 term.definition='詞彙表（Vocabulary）是 Token 與 ID 的對照集合；Vocabulary size（詞彙表大小、詞表大小）是其中不同 Token 的總數，不是上下文長度或嵌入維度。';
 plainKeywordDefinitions[id]='詞彙表列出分詞器可以使用的 Token 與編號；Vocabulary size 是這份清單共有多少種 Token。';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const section=(n,title,body)=>'<section class="keyword-section transformer-chapter"><h2>'+n+'. '+esc(title)+'</h2>'+body+'</section>';
 const table=(headers,rows)=>'<div class="transformer-table"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const eq=(latex,reading)=>'<div class="transformer-equation">'+(window.katex?window.katex.renderToString(latex,{output:'mathml',displayMode:true,throwOnError:true,trust:false}):esc(reading))+'</div><p>'+esc(reading)+'</p>';
 const python=`import math
vocab = ["<開始>", "我", "喜歡", "AI", "。", "<結束>"]
token_to_id = {token: i for i, token in enumerate(vocab)}
tokens = ["我", "喜歡", "AI", "。"]
ids = [token_to_id[token] for token in tokens]
print("Vocabulary size:", len(vocab))
print("Token IDs:", ids)
V, d = 10_000, 512
print("Embedding parameters:", V * d)
print("FP16 weight MiB:", round(V * d * 2 / 1024**2, 5))
logits = [0., 0., 0., 2., 0., 0.]
m = max(logits)
weights = [math.exp(z - m) for z in logits]
probabilities = [w / sum(weights) for w in weights]
print("Probabilities:", [round(p, 4) for p in probabilities])
print("Sum:", round(sum(probabilities), 6))
# 分詞已手動指定；這不是 BPE 或真實語言模型，也沒有訓練。`;
 keywordExample=function(t,practice){if(t.id!==id)return prior(t,practice);
 return '<div data-vocabulary-lesson="d8t8">'+[
 section(1,'Vocabulary 與 Vocabulary size 是什麼？','<p>Vocabulary（詞彙表）是 Token 與 Token ID 的對照集合。Vocabulary size（詞彙表大小）是其中不同 Token 的總數，以下用 V 表示。這裡的 V 是一個數量，不是注意力機制的 Value 矩陣。</p><p>它不等於模型認識的單字數。Token 可以是字、單字、子詞、標點、位元組或特殊標記，實際單位由 Tokenizer 決定。</p>'),
 section(2,'為什麼模型需要詞彙表？','<p>神經網路處理數值，不能直接把中文字串當作矩陣輸入。因此 Tokenizer 先把文字切成 Token，再轉成 ID；Embedding 依 ID 查表取得向量。生成時，模型預測候選 Token 的分數，再由解碼流程選擇 ID 並還原文字。</p><p>固定詞彙表中的小單位可以組合成沒見過的詞或句子，因此詞彙表大小不等於模型能理解的語意數量。</p>'),
 section(3,'六個 Token 的完整對照例',table(['Token','Token ID'],[['<開始>','0'],['我','1'],['喜歡','2'],['AI','3'],['。','4'],['<結束>','5']])+'<p>這張表有六種 Token，所以 V＝6。假設「我喜歡 AI。」切成 [我, 喜歡, AI, 。]，則 ID 序列為 [1,2,3,4]，長度 L＝4。若加上開始與結束標記，長度變成 6，但詞彙表大小仍為 6。此例的空格處理與切分是教學指定，不能套用到所有 Tokenizer。</p>'),
 section(4,'逐步拆解：文字如何進出模型？',table(['步驟','本例操作','得到什麼'],[['1. 切分','把句子切成四個指定 Token','[我, 喜歡, AI, 。]'],['2. 查編號','逐一使用同一張詞彙表查詢','[1,2,3,4]'],['3. 查嵌入','第 i 個 ID 取 Embedding 的第 i 列','每個 Token 變成 d 維向量'],['4. 模型運算','依上下文更新向量表示','供下一 Token 預測的隱藏向量'],['5. 預測及解碼','產生候選分數、選 ID、還原文字','下一 Token；反覆進行形成序列']])+'<p>Token ID 只是查表編號：ID 100 不表示比 ID 10 更重要、語意更大或更接近其他 Token。</p>'),
 section(5,'Embedding 的尺寸與參數量',eq('E\\in\\mathbb R^{V\\times d},\\qquad P_E=Vd','Embedding 有 V 列、d 欄；參數量為 V 乘 d')+table(['符號','意義'],[['E','Embedding 查表矩陣'],['V','詞彙表大小；此式假設每個 Token 各占一列'],['d','每個 Token 的嵌入維度'],['P_E','此張查表矩陣的參數數量']])+ '<p>例如 V＝10,000、d＝512：E 的尺寸為 10,000×512，參數量為 10,000×512＝5,120,000，即 512 萬。這只計算 Embedding，不是整個模型的參數量。</p>'),
 section(6,'容量如何計算？',eq('M=Vd\\,b','權重所需 bytes＝Token 數 × 嵌入維度 × 每參數 bytes')+'<p>b 是每個參數使用的 bytes。若 V＝10,000、d＝512、每參數 2 bytes，純權重為 10,240,000 bytes，約 9.765625 MiB；1 MiB＝1,048,576 bytes。這不含梯度、最佳化器、激活與 KV Cache。量化格式另可能需要比例因子等額外資料。</p>'),
 section(7,'輸出層為何也受影響？',eq('h\\in\\mathbb R^{d},\\quad W_{out}\\in\\mathbb R^{d\\times V},\\quad z=hW_{out}+b_{out}\\in\\mathbb R^{V}','以列向量表示時，d 維隱藏向量經輸出矩陣產生 V 個分數')+'<p>h 是目前位置的隱藏向量，W 的 out 下標標記輸出矩陣，z 是 logits，b 的 out 下標標記 V 維偏置；部分模型省略此偏置。這裡假設隱藏維度也為 d。以 V＝6 為例，每個位置有六個候選分數；不是一次產生六個文字 Token。</p>'),
 section(8,'Softmax 如何把分數變成機率？',eq('p_i=\\frac{e^{z_i}}{\\sum_{j=1}^{V}e^{z_j}}','第 i 個候選的指數值，除以全部 V 個候選指數值的總和')+'<p>i 是目前候選 ID，j 是加總索引，zᵢ 是候選分數，pᵢ 是其機率，e 約為 2.71828。例如六個 logits 為 [0,0,0,2,0,0]，ID 3 的機率為 e²／(5＋e²)≈0.5964，其餘各約 0.0807。總和為 1。這是指定分數的示範，不是真實模型預測；解碼還可能使用溫度、Top-k、Top-p 或禁止特定 Token。</p>'),
 section(9,'與 Context length、Embedding dimension 的差異',table(['概念','回答的問題','示例'],[['Vocabulary size V','共有多少種候選 Token？','10,000 種'],['Sequence length L','這次輸入或輸出含幾個 Token？','本例輸入 4 個'],['Context length','模型或服務最多支援多長的上下文？','假設上限 2,048 個 Token'],['Embedding dimension d','一個 Token 用幾個數值表示？','512 維']])+'<p>四者可以取不同數值。V＝10,000 不代表一次能讀取 10,000 個 Token；擴大詞彙表也不會自動延長模型的上下文。</p>'),
 section(10,'詞彙表越大越好嗎？','<p>較大詞彙表可能把常見片段合成較長 Token，讓同一段文字的序列較短，但通常增加嵌入與候選輸出相關容量；若新增 Token 很少在訓練中出現，其表示也可能學得不足。較小詞彙表通常切分較細、序列可能較長。實際取捨須用目標語言與資料測量，不能只看 V 判斷品質。</p><p>若模型共用輸入 Embedding 與輸出權重（Weight tying），不能把兩張表當成完全獨立參數重複加總；不共用時，輸出矩陣通常另需 d×V 個權重。</p>'),
 section(11,'使用現有模型時應注意什麼？','<p>Tokenizer、Token ID 與模型的 Embedding 必須相容。新增 Token 不只是在清單多寫一行，還要檢查模型可用的嵌入列數及輸出尺寸，並讓新向量得到適當訓練或初始化。不能拿另一個模型的 ID 序列直接當作同義輸入。</p><p>不同工具對基礎詞彙表、後加 Token、特殊 Token 與預留列的計數方式可能不同；分詞器回報的大小不一定等於模型矩陣的列數。比較數值前，須確認是否包含後加或特殊 Token，並檢查 ID 是否落在模型支援範圍。</p>'),
 section(12,'可直接執行的 Python 驗證','<p>以下只用 Python 標準函式庫，不需要 GPU。它驗證 ID、參數量、容量與機率；沒有執行真實 Tokenizer。</p><pre><code class="language-python">'+esc(python)+'</code></pre>'),
 section(13,'試著動手與自我檢核','<p>把 Python 範例的 d 從 512 改為 256，再執行：詞彙表仍有六種 Token；容量計算範例仍用 V＝10,000，但參數數量減半為 2,560,000。這是兩個分開指定的教學規模，並非六個 Token 突然變成一萬個。</p>'+table(['問題','解答'],[['V＝50,000 就能一次讀取 50,000 個 Token 嗎？','不能；還要看 Context length。'],['ID 越大代表詞義越重要嗎？','不是，ID 只是索引。'],['重複輸入同一 Token 十次，V 會增加十嗎？','不會；序列長度增加，詞彙表種類數不變。'],['嵌入維度減半，是否代表詞彙表也減半？','不會；V 與 d 是不同設定。']]))
 ].join('')+'</div>';
 };
})();
