'use strict';
// Extend the two original entries; preserve their IDs, links and saved progress.
(() => {
 const prior=keywordExample;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const section=(n,title,body)=>'<section class="keyword-section transformer-chapter"><h2>'+n+'. '+esc(title)+'</h2>'+body+'</section>';
 const table=(headers,rows)=>'<div class="transformer-table"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const eq=(latex,reading)=>'<div class="transformer-equation">'+(window.katex?window.katex.renderToString(latex,{output:'mathml',displayMode:true,throwOnError:true,trust:false}):esc(reading))+'</div><p>'+esc(reading)+'</p>';
 const code=s=>'<pre><code class="language-python">'+esc(s)+'</code></pre>';
 const related=()=>'<p>接著閱讀：</p><div><button type="button" data-learn-keyword="d8t5">Tokenizer（分詞器）</button><button type="button" data-learn-keyword="d8t7">BPE</button><button type="button" data-learn-keyword="d8t8">Vocabulary 與 Vocabulary size</button></div>';
 const bpePython=`from collections import Counter
words = [(tuple("low"), 5), (tuple("lower"), 2), (tuple("new"), 3)]
merges = []
for step in range(2):
    counts = Counter()
    for tokens, frequency in words:
        for pair in zip(tokens, tokens[1:]):
            counts[pair] += frequency
    # 本例用字典序處理同分；不同工具可能有不同約定。
    pair = min(counts, key=lambda p: (-counts[p], p))
    merges.append(pair)
    updated = []
    for tokens, frequency in words:
        result, i = [], 0
        while i < len(tokens):
            if i + 1 < len(tokens) and tokens[i:i+2] == pair:
                result.append("".join(pair))
                i += 2
            else:
                result.append(tokens[i])
                i += 1
        updated.append((tuple(result), frequency))
    words = updated
    print("Merge", step + 1, pair, "count", counts[pair])
print("Training segmentation:", words)
tokens = list("lowest")
for pair in merges:
    result, i = [], 0
    while i < len(tokens):
        if i + 1 < len(tokens) and tuple(tokens[i:i+2]) == pair:
            result.append("".join(pair))
            i += 2
        else:
            result.append(tokens[i])
            i += 1
    tokens = result
print("lowest:", tokens)
assert merges == [("l", "o"), ("lo", "w")]
assert tokens == ["low", "e", "s", "t"]
# 字元級教學實作；假設新文字的各字元已在初始字母表中。`;
 const tokenizerPython=`vocab = ["<PAD>", "<開始>", "我", "喜歡", "AI", "。", "<結束>"]
token_to_id = {token: i for i, token in enumerate(vocab)}
# 此處指定切分結果，只示範查 ID 與解碼；沒有實作 BPE。
tokens = ["我", "喜歡", "AI", "。"]
ids = [token_to_id[t] for t in tokens]
print("Token IDs:", ids)
print("Decoded:", "".join(vocab[i] for i in ids))
batch = [ids, [token_to_id["AI"], token_to_id["。"]]]
width = max(len(row) for row in batch)
input_ids = [row + [0] * (width - len(row)) for row in batch]
attention_mask = [[1] * len(row) + [0] * (width - len(row)) for row in batch]
print("input_ids:", input_ids)
print("attention_mask:", attention_mask)
assert ids == [2, 3, 4, 5]
assert attention_mask == [[1, 1, 1, 1], [1, 1, 0, 0]]`;
 const definitions={d8t7:'BPE（Byte Pair Encoding）從初始單位反覆統計並合併常見相鄰配對，建立子詞詞彙表與合併優先順序；使用時套用固定規則。',d8t5:'Tokenizer（分詞器）依模型相容規則把文字切成 Token、對應 Token ID，並將輸出 ID 解碼為文字；可使用 BPE、WordPiece 或 Unigram 等方法。'};
 for(const t of keywordCatalog)if(definitions[t.id]){t.definition=definitions[t.id];plainKeywordDefinitions[t.id]=definitions[t.id];}
 function bpe(){return '<div data-tokenization-lesson="d8t7">'+[
 section(1,'BPE 是什麼？方法從哪裡來？','<p>BPE 全名為 Byte Pair Encoding，最初用於資料壓縮，後來被用於文字子詞切分。核心做法是反覆合併常見的相鄰單位，讓常見片段使用較少 Token 表示；不是理解語意後才切詞。</p>'),
 section(2,'為何不直接一字元或一單字一個 Token？',table(['方法','playing 的可能表示','取捨'],[['字元級','p · l · a · y · i · n · g','基本單位少，但序列較長'],['單字級','playing','序列較短，但詞彙表大且可能遇到未收錄詞'],['子詞級','play · ing','常見片段合併，少見詞可拆成小單位']])+'<p>play 與 ing 只是可能結果，不是 BPE 必然學到的切分。結果取決於資料、詞彙表上限、初始單位與預切分限制。</p>'),
 section(3,'準備可以手算的訓練資料',table(['文字','出現次數','初始切分'],[['low','5','l · o · w'],['lower','2','l · o · w · e · r'],['new','3','n · e · w']])+'<p>以下從字元開始、不跨單字合併。這是教學設定，不是所有 BPE 的必要限制。</p>'),
 section(4,'第一次統計：必須考慮文字出現次數',table(['配對','計算來源','次數'],[['l ＋ o','low 5 次＋lower 2 次','7'],['o ＋ w','low 5 次＋lower 2 次','7'],['w ＋ e','lower 2 次','2'],['e ＋ r','lower 2 次','2'],['n ＋ e','new 3 次','3'],['e ＋ w','new 3 次','3']])+'<p>此處每個列出的配對在單一單字內各出現一次；一般情況同一配對可能在一個單字中出現多次，也要計入。不是只數「有幾種單字含有它」。</p>'),
 section(5,'第一輪合併與同分處理','<p>l＋o 與 o＋w 同為 7 次。此例採字典序處理同分，選 l＋o → lo。更新後：low＝[lo,w]；lower＝[lo,w,e,r]；new＝[n,e,w]。合併選擇與優先順序要保存，供日後處理新文字。</p>'),
 section(6,'第二輪：重新統計再合併','<p>更新後 lo＋w 出現 5＋2＝7 次，因此合併為 low。此時 low＝[low]；lower＝[low,e,r]；new＝[n,e,w]。每輪必須依更新後的 Token 序列計數，不能一直使用最初的配對表。</p><p>持續合併直到達到設定的詞彙表大小、無可合併配對或其他停止條件。基本單位通常仍須保留以表示少見片段；常見實作會新增合併 Token，而不是只留下最後完整單字。</p>'),
 section(7,'演算法拆解與完整資料流',table(['階段','操作','保存或產生的結果'],[['初始化','選定初始字元或位元組及前處理','初始符號表與切分序列'],['統計','計算相鄰 Token 配對次數','本輪配對頻率'],['選擇','依頻率及同分約定選配對','一條有順位的合併規則'],['更新','套用合併並重新統計','更新的 Token 序列'],['停止與保存','達到目標或停止條件','詞彙表、ID、規則與處理設定']])+'<p>相鄰配對重疊時，合併要遵守實作約定；不能讓同一個原始位置同時參與兩個合併。下方程式採由左到右的非重疊替換。</p>'),
 section(8,'新文字 lowest 如何處理？','<p>只使用已學到的兩條規則：l＋o → lo，再 lo＋w → low。假設 e、s、t 等字元也已在初始詞彙表，新文字便依序變成 [l,o,w,e,s,t] → [lo,w,e,s,t] → [low,e,s,t]。</p><p>這個階段不重新統計使用者輸入，也不自動新增 lowest Token。訓練 Tokenizer 決定規則；使用 Tokenizer 則套用規則。兩者不可混淆。</p>'),
 section(9,'字元級與 Byte-level BPE','<p>字元級 BPE 以字元為初始單位；Byte-level BPE 則常以 256 種位元組值的表示為基礎。文字先編碼成位元組後再合併，一個中文字可能對應多個 Token，多個字也可能合成一個 Token。單一 Token 的位元組不一定能獨立解碼成完整 Unicode 字元。</p><p>採字元級而缺少某個初始字元時，如何表示未知字元要看實作是否提供未知標記或 byte fallback；不能一概保證任意文字都可表示。</p>'),
 section(10,'BPE、Vocabulary 與語言模型的關係','<p>BPE 是方法；Vocabulary 是 Token 與 ID 的集合；Tokenizer 是整合切分、ID 對應及解碼的工具。訓練語言模型時，才讓模型學習 Token 的上下文關係及下一個 Token 的分布。BPE 配對頻率不是語言模型的注意力權重或生成機率。</p>'+related()),
 section(11,'可直接執行的 Python 合併實驗','<p>標準函式庫即可執行，不需 GPU。預期兩輪合併次數皆為 7，lowest 結果為 [low,e,s,t]。把 low 的頻率改小，觀察合併順序是否改變；改動資料後，原本的斷言也需依新結果重新核對。</p>'+code(bpePython)),
 section(12,'應用、限制與自我檢核','<p>BPE 常用於語言模型的子詞切分。多語言及程式碼比例、預切分與詞彙表大小都會影響序列長度。常見片段被合併不代表它是完整單字或具有獨立意義；改變 Tokenizer 後也不能直接沿用不相容的 Token ID。</p>'+table(['問題','答案'],[['每輪都沿用初始頻率嗎？','不，合併後要重新統計。'],['新句子會自動增加 Token 嗎？','一般使用時不會；規則與詞彙表已固定。'],['BPE 是否一定按文法切成詞根詞綴？','不是，合併主要來自資料中的相鄰頻率。']]))
 ].join('')+'</div>';}
 function tokenizer(){return '<div data-tokenization-lesson="d8t5">'+[
 section(1,'Tokenizer 是什麼？','<p>Tokenizer（分詞器）是文字與模型之間的轉換介面：將文字轉為 Token ID，再把模型產生的 ID 解碼為文字。Token 可以是字、子詞、單字、標點、位元組或特殊標記，不能直接把 Token 數當作中文字數或英文單字數。</p>'),
 section(2,'為什麼需要這個轉換？','<p>神經網路以數值運算。文字先被切分並查成 ID，Embedding 才能依編號取出向量。Tokenizer 決定表示規則，Embedding 提供向量，語言模型根據上下文預測；三者各有不同職責。</p>'),
 section(3,'從輸入文字到模型輸出',table(['階段','操作'],[['文字輸入','收到使用者的文字或經格式化的對話'],['Tokenizer 編碼','依固定規則切分並對應 input_ids'],['Embedding','依 ID 查出每個位置的向量'],['模型','計算下一個 Token 的候選分數'],['解碼策略','依設定選擇下一個 Token ID'],['Tokenizer 解碼','將累積的 ID 序列還原成文字']])+'<p>Tokenizer 的 decode 是 ID 與文字的轉換；生成時的取樣或選擇策略則決定下一個 ID，兩種「解碼」用法不能混為一談。</p>'),
 section(4,'一張完整的 Token ID 對照表',table(['Token','ID'],[['<PAD>','0'],['<開始>','1'],['我','2'],['喜歡','3'],['AI','4'],['。','5'],['<結束>','6']])+'<p>假設「我喜歡 AI。」被切成 [我,喜歡,AI,。]，ID 為 [2,3,4,5]；若另加入開始與結束標記，則為 [1,2,3,4,5,6]。本例刻意指定切分與空格處理；真實分詞器可能不同，也不一定加入這些標記。此表與 Vocabulary 詞條的六項示例是分開設定，不能混用 ID。</p>'),
 section(5,'內部流程：每一步處理什麼？',table(['步驟','目的','限制'],[['正規化','依設定調整文字表示','有些設計不做；可能影響原文可還原程度'],['預切分','依空白、標點或規則劃分範圍','可能限制跨邊界合併'],['子詞切分','套用 BPE、WordPiece、Unigram 等方法','不等於按文法切單字'],['對應 ID','以詞彙表查編號','ID 大小不代表語意重要性'],['後處理','加入特殊 Token、填補或截斷','須符合模型與任務設定'],['解碼','把 ID 序列轉成文字','特殊 Token 可依選項保留或略過']])+'<p>不同 Tokenizer 可能省略其中部分步驟，或採不同處理規則；不能要求所有模型都用同一流程細節。</p>'),
 section(6,'Tokenizer 與 BPE 到底差在哪？',table(['名稱','角色'],[['Tokenizer','整合規則、詞彙表、特殊標記與解碼的工具'],['BPE','建立及套用相鄰片段合併規則的方法'],['Vocabulary','Token 與 ID 的對照集合'],['Vocabulary size','詞彙表包含的 Token 種類數量'],['Embedding','依 ID 查向量的模型層']])+'<p>Tokenizer 可以使用 BPE，但也可能使用 WordPiece、Unigram 或其他方法。訓練 Tokenizer 與訓練語言模型是不同工作。</p>'+related()),
 section(7,'Token ID 如何變成向量？',eq('E\\in\\mathbb R^{V\\times d},\\qquad \\operatorname{Embedding}(i)=E_{i,:}','Token ID i 取出 Embedding 矩陣第 i 列的所有分量')+'<p>E 是查表矩陣，V 是模型可查的嵌入列數，d 是向量維度；i 是 Token ID，冒號表示該列全部欄位，索引由 0 起算。本例七項詞彙、d＝3 時矩陣為 7×3。ID＝4 取第五列；假設該列是 [0.2,−0.5,0.8]，模型便讀入這個向量。向量是模型參數，不是 Tokenizer 計算出的語意；i 必須落在可查範圍內。</p>'),
 section(8,'input_ids 與 attention_mask',table(['輸入','input_ids','attention_mask'],[['我喜歡 AI。','[2,3,4,5]','[1,1,1,1]'],['AI。','[4,5,0,0]','[1,1,0,0]']])+'<p>此例採右側填補，PAD ID＝0。input_ids 是實際編號；常見介面的 attention_mask 用 1 標有效位置、0 標填補位置。遮罩中的 0 不代表文字 Token 的 ID 必須是 0。不同模型或 API 的遮罩格式與填補方向可能不同，須依介面定義。</p>'),
 section(9,'填補遮罩與因果遮罩不同','<p>填補遮罩排除沒有實際內容的 PAD 位置；因果遮罩限制某位置只能讀取允許的過去位置，避免預測時偷看未來。兩者可以同時存在。不能把 [1,1,0,0] 直接當成所有注意力計算通用的矩陣格式。</p>'),
 section(10,'特殊 Token、截斷與對話格式','<p>開始、結束、角色與控制 Token 取決於模型設計。對話模型還可能使用 Chat Template 格式化角色與輪次。文字看起來像標記，不代表一定被當作特殊 Token。過長輸入若截斷會丟失資訊；是否加入特殊 Token、是否填補及截斷長度，都要明確設定。</p><p>Vocabulary size 是可用 Token 的種類數；本次序列長度是用了多少個 Token；Context length 是模型或服務支援的上下文長度。三者不是同一數量。</p>'),
 section(11,'可直接執行的 Python 示範','<p>此程式驗證查 ID、解碼、右填補與遮罩，只需要 Python 標準功能，不會下載模型，也沒有實作真實語言的自動切分。</p>'+code(tokenizerPython)),
 section(12,'實際應用與容易出錯的地方','<p>應使用與模型相容的 Tokenizer。兩個模型即使詞彙表大小相同，同一 ID 也可能代表不同片段。新增 Token 還須檢查模型嵌入及輸出尺寸，不能只改清單。一般推論不會因輸入新句子就更新詞彙表。</p><p>正規化、空格清理及特殊 Token 處理可能使 decode(encode(text)) 不完全等於原字串；位元組級 Token 也可能需要合併整段後才能正確顯示字元。記錄模型與 Tokenizer 版本，有助重現結果。</p>'),
 section(13,'試著動手與自我檢核','<p>把第二筆輸入改成只有 [AI]，預期 ID 為 [4,0,0,0]、遮罩為 [1,0,0,0]。再說明：PAD ID 與遮罩的 0 為何是不同概念？</p>'+table(['問題','答案'],[['Tokenizer 自己產生語意向量嗎？','不是，Embedding 提供向量。'],['ID 100 比 ID 10 更重要嗎？','不是，只是查表索引。'],['可以任意混用不同模型的 Tokenizer 嗎？','不可以；ID 與模型參數必須相容。'],['有 BPE 就有完整 Tokenizer 嗎？','不一定，還須詞彙表、ID、前後處理與解碼設定。']]))
 ].join('')+'</div>';}
 keywordExample=function(t,practice){return t.id==='d8t7'?bpe():t.id==='d8t5'?tokenizer():prior(t,practice);};
})();
