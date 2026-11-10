# AI Learning Studio：固定 GitHub Pages 入口
首頁、Google 登入畫面與登入後教材均使用 https://sharnchen.github.io/ai-learning-studio/ 。首頁用同來源 login.html iframe 顯示品牌登入介面；瀏覽器頂層網址不會跳到 Cloudflare。Google 帳號選擇視窗仍由 Google 提供。登入後驗證工作階段，再移除登入畫面並顯示學習首頁。課程導覽仍使用同一路徑下的 #home、#courses、#tutor 等頁內位置。

## Google Console
Google Auth Platform → 用戶端 → AILEARNING → 已授權的 JavaScript 來源，新增：
`https://sharnchen.github.io`
來源不得包含 /ai-learning-studio 路徑；儲存後依 Google 提示等待生效。OAuth 類型為 Web application；若要開放所有 Google 帳號，External 應用需完成 Google 要求的發布設定。本站不要求重新提供 Client Secret，也不使用舊 Cloudflare Access callback。
舊 Worker /auth/login、/studio/ 及 / 入口重新導向公開 GitHub Pages 首頁。

## 認證
- GET /public/challenge：僅允許 GitHub Pages origin，回傳十分鐘 HMAC 簽署的 nonce 挑戰與公開 Client ID。
- POST /public/login：驗證挑戰目的、簽章、有效期限與 Google ID token 的 nonce、Google RS256 簽章、iss、aud、azp、iat、exp、email_verified。
- Google sub 作使用者主鍵。成功後回傳一小時網站工作階段憑證；僅存於 GitHub Pages 的 sessionStorage，不存 API key、Client Secret、後端共用存取碼或 Google token。
- GET /public/session、POST /public/tutor 使用 Authorization Bearer；不依賴第三方 Cookie。Origin 與 CORS 限定 https://sharnchen.github.io，不接受萬用來源。所有憑證放在 POST body 或 header，不放網址。
- 登出清除分頁工作階段，重新整理會先由後端確認身分。這是短效 bearer 工作階段，若遭竊取可在期限內使用；保護前端免受 XSS，輪替 SESSION_SIGNING_KEY 可撤銷所有工作階段。
- 未登入模型端點回401，跨來源回403，錯誤簽章或挑戰不可登入。Google公鑰取用使用 Workers 支援的 manual redirect，且拒絕重新導向。
- 每 Google sub 每分鐘6次、全站近似每分鐘60次，登入入口按IP每分鐘10次。皆保留原有綁定。模型額度由站主 Gemini 專案共用。

Cloudflare 管理連線不會提供給使用者。AI_API_KEY 與 SESSION_SIGNING_KEY 只在 Worker Secrets。
GitHub Pages 本質上公開提供教材檔案；登入介面控制正常使用流程，不能將靜態教材當成保密內容。AI後端則一律強制驗證登入。

## 檢查
node scripts/test-google-auth.mjs
node scripts/test-public-auth.mjs
測試涵蓋 Google 簽章、挑戰防竄改與用途隔離、跨來源拒絕、CORS preflight、一小時工作階段、未登入拒絕、模型代理，以及舊網址導回 GitHub Pages。正式端仍須在 Google Console 授權新來源後完成一次實際 Google 登入與 AI 問答驗收。
