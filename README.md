# AI 學習所 · AI Learning Studio

繁體中文 AI 自學網站，24 個單元，從 AI 基礎到神經網路、生成式 AI、Agent、安全與專題。

## 功能
- 響應式版面、課程搜尋與主題篩選
- 每課觀念、例子、理解練習與測驗，通過測驗後可標記完成
- 梯度下降、CNN 尺寸、分類指標、注意力矩陣四個互動實驗
- 本機筆記與學習進度，支援 JSON 匯出與匯入
- 詞彙庫與官方學習資源連結

## 使用
直接以瀏覽器開啟 index.html。也可執行 `python -m http.server 8000`，開啟 http://localhost:8000。
不需要建置、外部套件、API Key 或後端。localStorage 僅保存於當前瀏覽器與來源，不會跨裝置同步；清除瀏覽器資料前請匯出備份。

## GitHub Pages 發布
1. 建立公開 repository `ai-learning-studio`，將所有檔案上傳到 main 分支根目錄（包含 `.github/workflows/pages.yml`）。
2. Settings → Pages → Source 選 GitHub Actions。
3. Actions → Deploy AI Learning Studio → Run workflow。
4. 完成後從 Pages 設定或部署工作取得網址。

這是教學網站，沒有呼叫遠端模型。互動實驗是簡化的數學示範。課程測驗用於自我檢核，不代表正式能力認證。擴充課程可編輯 lessons.js。
