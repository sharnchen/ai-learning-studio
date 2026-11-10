# Google 登入：GitHub Pages 固定入口

首頁與登入後學習頁均使用 https://sharnchen.github.io/ai-learning-studio/ 。

在 Google Cloud → Google Auth Platform → 用戶端 → AILEARNING → 已授權的 JavaScript 來源，新增：

```text
https://sharnchen.github.io
```

此欄位僅填來源，不含 /ai-learning-studio 路徑。若要開放所有 Google 帳號，確認 External 並依 Google Console 要求完成正式發布。Google 帳號選擇仍會顯示 Google 的官方登入視窗；網站頂層網址保持 GitHub Pages。

網站採 Google Identity Services callback 與後端簽章驗證，不需要在網頁放置 Client Secret，不使用舊 Cloudflare Access callback。完整認證、短效工作階段與驗收說明見 [README.md](README.md)。舊 configure-google-oauth.mjs 是已停用 Access 架構的管理工具，請勿執行。
