# 啟用 AI 自由問答與動態反問

目前 GitHub Pages 的預設模式是本地教材檢索／預設分支反問，**尚未連接生成式模型**。本資料夾提供可獨立部署的 Cloudflare Worker；此後端不會因推送 GitHub Pages 而自動執行。

1. 在 Cloudflare Workers 建立 JavaScript Worker，將 `tutor-worker.mjs` 內容貼入並部署。
2. 設定一般環境變數：`AI_PROVIDER` 為 `gemini` 或 `groq`；`AI_MODEL` 填該帳號實際可用且有免費額度的文字模型 ID；`ALLOWED_ORIGIN` 為 `https://sharnchen.github.io`（Origin 不含路徑）。不要假設所有模型都免費。
3. 在 Worker 的 Secrets 設定 `AI_API_KEY`（模型服務金鑰）及 `TUTOR_ACCESS_TOKEN`（自行產生的獨立存取碼）。不要提交到 GitHub。可配置 `TUTOR_RATE_LIMITER` 平台限流 binding；若未配置，仍受模型服務限額控制。
4. 在學習網站「雙向學習問答 → AI 連線設定」輸入 `https://實際Worker網址/tutor` 與後端存取碼。**存取碼不是模型 API Key**。設定僅存在本分頁記憶體，重整後重填。
5. 送出問題或點選「請反問我一題」。畫面顯示「AI 生成」才是模型回應；錯誤／429 額度耗盡會明確回報，不會用本地教材冒充。

只有你設定的後端會收到提問、最近最多10則對話、目前教材與相關實驗輸入／結果。自由文字仍需人工核對。免費額度、適用地區、資料使用政策依供應商與帳號而定；請勿輸入學生個資。

存取碼適合個人或小組試用；全校公開服務應改成個別帳號驗證及集中式配額。Origin 檢查不是使用者身分驗證。Worker secrets 保留在伺服器，前端設定不包含供應商金鑰。

官方資料：
- Gemini 定價：https://ai.google.dev/gemini-api/docs/pricing
- Gemini OpenAI 相容 API：https://ai.google.dev/gemini-api/docs/openai
- Groq 速率限制：https://console.groq.com/docs/rate-limits
- Groq API：https://console.groq.com/docs/api-reference
- 本機 Qwen：https://ollama.com/library/qwen3 （本機運算免雲端 Token 費，但需自備硬體；本 Worker 未直接連接個人電腦的 localhost。）

後端測試採 mock provider 驗證路由、CORS、存取碼、請求限制與供應商呼叫格式；未使用真實 API 金鑰驗證模型回覆。

## 已配置的正式服務
Worker：`ai-learning-studio-api`。網址：`https://ai-learning-studio-api.liesharn.workers.dev/tutor`。
網站已預填該網址；仍先使用教材模式，填入獨立存取碼並套用後才啟用 AI。新增「檢查後端狀態」會讀取 `/health`，只回報缺少的設定名稱，不公開秘密值。
正式配置為 `AI_PROVIDER=gemini`、`AI_MODEL=gemini-3.8-flash`、`ALLOWED_ORIGIN=https://sharnchen.github.io`。獨立存取碼已配置為 Secret，不存入原始碼。**目前尚缺使用者的 `AI_API_KEY`；未驗證真實模型推論。**
已設6次／60秒的每IP限流（依Cloudflare節點計數，並非全域嚴格配額）、固定雜湊長度的常數時間存取碼比較、請求串流大小限制、Worker Logs及抽樣Traces。服務不記錄問題、答案或金鑰到應用程式日誌。

## 已完成真實推論驗證
已改用 Gemini 原生 `generateContent` API；目前正式模型為 `gemini-3.1-flash-lite`，thinking level 為 low、輸出上限4096。`AI_API_KEY` 已轉為 Secret，保留既有存取碼。真實網站測試已取得繁體中文梯度上升解釋及延伸反問。先前「尚缺金鑰／未驗證」記錄為舊狀態，以本節為準。
「驗證模型設定」會透過後端、以目前金鑰查詢模型清單，供帳號權限排查；列出模型不保證該帳號有推論配額。模型API錯誤分別顯示無此模型、金鑰權限、額度、暫時不可用或空回答，不再全部誤報為網址／存取碼問題。Gemini 可見答案只取非 thought 的文字，不傳回思考內容。
