# AI 問答登入與後端設定

公開教材保留於 https://sharnchen.github.io/ai-learning-studio/ 。AI 問答的安全入口為 https://ai-learning-studio-api.liesharn.workers.dev/studio/#tutor 。使用者由公開教材按「登入並開啟 AI 問答」即可進入，所選主題以非敏感 query 參數傳遞。

## 登入與名單

Cloudflare Access 應用程式：`AI Learning Studio Login`。使用 Email 一次性驗證碼，登入工作階段最長 8 小時，Cookie 使用 HttpOnly。Access 政策套用到整個 `ai-learning-studio-api` Worker，包含 production 與其他 hostname；不新增公開 bypass。

允許名單在 Cloudflare Zero Trust → Access → Applications → AI Learning Studio Login → Policies → Allowed learner emails → Include → Emails 維護。僅新增管理者確定授權的 Email，勿改成 Everyone。學生或同事不需取得模型金鑰或共用後端存取碼。每人每分鐘最多 6 次問答；所有人的模型用量共用同一 Gemini API 專案額度。

## Worker 設定

- `TUTOR_AUTH_MODE=access`、`ACCESS_AUD` 為該 Access 應用的 audience。
- `AI_PROVIDER=gemini`、`AI_MODEL` 填目前可用文字模型。
- `AI_API_KEY` 保存在 Worker Secrets。原 `TUTOR_ACCESS_TOKEN` 仍保留於 Secrets，正式 Access 模式不將它傳給前端，也不接受它替代使用者登入。
- `TUTOR_RATE_LIMITER` 綁定每分鐘 6 次的速率限制；Access 模式按登入 Email 分開計數。

Worker 以平台提供的 `ctx.access` 檢查應用 audience 與已驗證身分，不信任使用者自行傳入的 Email／JWT header。API 的 POST 另檢查同來源 Origin，以防跨網站提交。`/session` 只回傳目前登入者身分；回應皆禁止快取。

## 教材與問答的來源

`/studio/` 從固定的公開 GitHub Pages 位置讀取 allowlist 中的 HTML、JS、CSS；不轉送瀏覽器的 Cookie、Authorization 或任意 URL。問答在相同 Worker 網域使用 Cookie，不依賴第三方 Cookie。原公開教材的學習紀錄仍保留在 GitHub Pages 的瀏覽器儲存；安全入口的學習紀錄獨立，必要時可用匯出／匯入搬移。

前端會清除舊版本暫存在 sessionStorage 的後端存取碼，不再提供金鑰／存取碼輸入欄位。對話僅存在目前分頁記憶體，不會存入共用後端。退出登入使用 Cloudflare Access 的 `/cdn-cgi/access/logout`。

## 驗證

執行 `node scripts/test-tutor-worker.mjs`、`node scripts/test-tutor-connection.cjs` 與 `node scripts/test-tutor.cjs`。測試涵蓋未登入拒絕、錯誤 audience、跨來源提交拒絕、分開限流、固定來源資產代理、舊憑證清除與登入到期。

正式端需由允許名單內的使用者完成 Email 驗證後，按「測試 AI 實際回答」。健康檢查不等同模型生成成功，未完成登入或配額用完時不得冒充模型回答。
