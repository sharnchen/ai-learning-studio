# Google 帳號登入（OAuth / OpenID Connect）

## 狀態與用途
網站已有 Cloudflare Access 工作階段驗證，Google 身分驗證接在 Access 層；不在公開網頁交換 OAuth 密碼或儲存 Client Secret。Google 憑證尚未申請，因此目前仍使用 Email 驗證碼。新增 Google 後，登入者仍須符合現有 Email 允許名單；不會自動開放所有 Gmail 帳號。

登入流程：公開教材的「登入並開啟 AI 問答」→ Cloudflare Access → Google 帳號選擇／同意 → Access 驗證與允許名單 → 安全問答頁 → 同來源 Cookie 呼叫 Worker。Google 使用者不需要 Cloudflare 帳號，模型仍由站主的 Cloudflare Worker 和 Gemini API 提供。

## 申請憑證
在 Google Cloud Console 的 Google Auth Platform 建立專案／應用，名稱 AI Learning Studio。
- Audience 選 External，供一般 Google 帳號使用。測試狀態先加入測試者 Email；對外提供前依 Google 規定完成發布設定。
- Client 類型選 Web application。
- Authorized redirect URI 必須完整填入：
  `https://polished-field-c593.cloudflareaccess.com/cdn-cgi/access/callback`
- 若設定 Authorized JavaScript origins，填：
  `https://polished-field-c593.cloudflareaccess.com`
- 僅使用登入所需的 openid、email、profile；不要求 Gmail 信件或 Google Drive 權限。
- Google Client ID / Client Secret 與 Gemini API Key 是不同憑證。

## 建議啟用方式
將 Client ID 與 Client Secret 直接填入 Cloudflare Zero Trust → Integrations → Identity providers → Add → Google。憑證不要貼到對話、存進 GitHub、瀏覽器儲存或 Worker 公開變數。

完成後在 Access → Applications → AI Learning Studio Login 的登入方式加入該 Google provider，取消自動跳轉單一登入方式；先保留 Email OTP。Email 允許政策、8 小時工作階段、Worker audience、HttpOnly Cookie、每人每分鐘 6 次問答保持不變。通過測試後才考慮移除 OTP。

## 管理者腳本
`node scripts/configure-google-oauth.mjs` 預設只檢查／預覽；加 `--apply` 才修改。JSON 經 stdin 輸入，不能用命令列參數帶入秘密：
- cloudflare_api_token：僅授權指定帳號的 Access IdPs / Apps 所需權限。
- google_provider_id：若已在 Cloudflare 填好憑證，僅提供 provider ID 即可。
- 或 google_client_id、google_client_secret：直接建立 Google provider。
使用密碼管理器或安全程式提供 stdin，勿將實際憑證寫成 JSON 檔案或留在 shell 歷史。腳本不輸出憑證或原始 API 錯誤內容。
若新增 provider 成功但綁定失敗，重新執行前先從 Cloudflare 確認 provider ID，避免重複建立。

## 驗收
1. 無痕視窗由安全入口登入，能看到 Google 選項。
2. 允許名單內 Google Email 登入後，/session 顯示正確 Email，實際問題由 Gemini 回答。
3. 名單外帳號拒絕；偽造 Email header、過期登入或跨來源 POST 仍拒絕。
4. 登出後受保護頁面重新要求登入；網頁原始碼、Network 與 GitHub 不含 Client Secret 或 Gemini API Key。
5. 既有 Email 驗證碼可用；政策規則、audience 與每人限流保持不變。

尚無有效憑證時不能驗證 Google callback 或宣稱 Google 登入已上線。

官方設定說明：https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/
