# Google 登入設定

本網站已改用 Google Identity Services 直接登入，舊 Cloudflare Access OAuth callback 不再用於網站登入。

完整設定與驗收請見 [README.md](README.md)。

必要 JavaScript 來源：`https://ai-learning-studio-api.liesharn.workers.dev`。

不用在網站中保存 Client Secret。舊 configure-google-oauth.mjs 腳本僅適用已停用的 Access 架構，勿執行。