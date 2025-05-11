# Expo2025 UI Fix

針對 2025 大阪萬博官方網站 ([https://ticket.expo2025.or.jp/](https://ticket.expo2025.or.jp/)) 的 UI 改進專案。
本專案僅供學術交流，最理想的狀態當然是官方自行修正他們網站上不方便的使用體驗降子…

## 專案目的

本專案旨在改善大阪萬博官方預約網站的用戶體驗，特別針對以下幾個方面：

1. 地圖互動性優化
2. 使用者介面優化
3. 提升當日預約流程使用體驗

## 已知的網站痛點

1. 無法自由自在切上/下一頁
1. 無法掌握自身附近的場館有哪些
1. 搜尋介面無法跨語言、必需大小寫相符才搜得到
1. 不同語言的場館資訊有差異(ex: 在日文版下的場館資訊有 193 筆，中文版只有 181 筆)
1. 網站一段時間後就會被登出

## 主要功能

- 互動式地圖瀏覽
- 自適應式彈出視窗
- 地圖標記點優化

## 技術特點

- 使用 Leaflet.js 實現地圖功能
- 響應式設計，支援各種裝置
- 本地儲存 (localStorage) 保存用戶偏好設定

## 使用方式

1. 直接前往 [https://grassboy.github.io/EXPO2025/index.html](https://grassboy.github.io/EXPO2025/index.html) 便可進行地圖瀏覽

## 開發環境

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js
- Font Awesome
- Cursor 

## 協力清單
 - SVG 圖示 [https://www.svgrepo.com/](https://www.svgrepo.com/)
 - 場館評價協力 [Sophy Lin.](https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2iOPhoVcIdiR4fha8-YV0zbFeKJHwXBD97_FqSuSUdWrLm82dUnsmtvZpxY4qQpe0UYTXMCbhFMaK/pubhtml?fbclid=IwY2xjawJ2nuJleHRuA2FlbQIxMABicmlkETFESUlkSWt0dWFZNzUzUUFLAR6AegBApEHvz8N76TT7bg-AdbbMuXpi9S0MTgardWOyHlDxJiFa_XJf20tVYg_aem_EHqJW0lUFvytpd1KdWWAQA)

## 貢獻指南

歡迎到 [https://github.com/Grassboy/EXPO2025/issues/new](https://github.com/Grassboy/EXPO2025/issues/new) 提交 issue

## 授權

本專案採用 GPL 授權條款。 
    - 可自由修改，修改後請註明原作者 https://github.com/Grassboy
    - 修改後的程式請 OpenSource