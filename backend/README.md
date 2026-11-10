# AI 問答與 Google 登入
正式登入採網站自己的 Google Identity Services / OpenID Connect，不使用 Cloudflare Access 的 Email 允許名單或登入畫面。所有 Google 帳號皆可登入（Google OAuth 專案也須允許 External 並完成適當發布設定）。

## Google Console 必要設定
使用既有 Web application OAuth Client ID，在「已授權的 JavaScript 來源」新增：
`https://ai-learning-studio-api.liesharn.workers.dev`
此版本採 GIS popup callback，由同來源 JavaScript POST ID token 至 /auth/google；不使用原 Access callback，不需要把 Client Secret 放進網站或 Worker。不要刪除其他應用仍在使用的來源或重新導向 URI。

若 OAuth 專案仍是 Testing，先加入測試使用者；若要讓所有 Google 使用者登入，需按 Google Console 的要求將 External 應用發布為 In production。測試名單限制由 Google 控制，網站無法繞過。

## 後端設定
TUTOR_AUTH_MODE=google，GOOGLE_CLIENT_ID=Google Web Client ID（公開識別碼）。
SESSION_SIGNING_KEY=隨機生成的後端 Secret；AI_API_KEY 保存在 Worker Secret。Cloudflare 管理帳號與管理工作階段不會共用給使用者。
每人依 Google sub 限流 6 次/分鐘，全站綁定限流 60 次/分鐘（Cloudflare rate-limit 綁定為分散式近似限制，非精確計費上限）。Google 驗證入口另按 IP 限流 10 次/分鐘；所有人共用站主的 Gemini 專案配額。
生產環境必須先部署 google 模式與 Secret，再解除舊 Access App 的 Worker 保護，避免未驗證的模型端點暴露。

## 驗證與工作階段
/auth/login 產生 10 分鐘隨機 nonce，HttpOnly/Secure/SameSite=Lax Cookie，傳入 Google 登入請求。
/auth/google 只接受同來源 JSON POST；限制 request 大小；驗證 nonce、Google RS256 簽章、公鑰、iss、aud、azp、iat、exp、email_verified。以 sub 作使用者識別，不將 Email 當帳號主鍵。Google 公鑰依 Cache-Control 透過 Worker cache 保存。
成功後簽發 8 小時 HMAC Cookie（HttpOnly、Secure、SameSite=Lax），清除 nonce。不儲存 Google token、Client Secret 或對話於瀏覽器儲存。/session 只回目前身分；未登入 /tutor 回 401，跨來源 POST 回 403。
/auth/logout 接受同來源 POST 清除 Cookie。登出清除該瀏覽器 Cookie；已被竊取的有效 Cookie 不會即時撤銷，輪替 SESSION_SIGNING_KEY 可使所有工作階段失效。
/studio/ 僅代理固定 GitHub Pages 的 HTML/JS/CSS，不轉送瀏覽器 Cookie。學習紀錄依瀏覽器及網站來源保存，對話僅在分頁記憶體。

## 測試
`node scripts/test-google-auth.mjs`
測試真實 RSA 簽章、錯誤 audience/issuer/expiry/nonce/signature、其他 Google sub、工作階段防竄改、CSRF、未登入拒絕與登入頁。另須在正式 Google 頁面完成登入，再送出實際 Gemini 問題；僅出現按鈕不代表已驗收完整登入。
