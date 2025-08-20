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
1. 進行當日預約的流程繁瑣
1. 網站一段時間後就會被登出

## 主要功能

- 互動式地圖瀏覽
- 無障礙設施標示切換
- 自適應式彈出視窗
- 地圖標記點優化

> 更多技術細節和閒聊請參閱 [MURMUR.md](./MURMUR.md)

## 技術特點

- 使用 Leaflet.js 實現地圖功能
- 響應式設計，支援各種裝置
- 本地儲存 (localStorage) 保存用戶偏好設定

## 使用方式

1. 直接前往 [https://grassboy.github.io/EXPO2025/index.html](https://grassboy.github.io/EXPO2025/index.html) 便可進行地圖瀏覽
1. 前往 expo2025.user.js 安裝 Expo2025 UI Fix 的網站腳本
1. 直接訪問 [https://ticket.expo2025.or.jp/](https://ticket.expo2025.or.jp/)
1. 理論上前兩點看起來很簡單，實際上需要克服的技術痛點還有如下：
    1. 瀏覽網站的瀏覽器必需支援安裝 UserScript
        - Desktop Chrome / Firefox Mobile: Tempermonkey 套件
    1. 萬博官網有設定 Content-Security-Policy 要有辦法繞過去
        - Firefox Mobile: CSP for Me 套件
            - Applied URLs ```https://ticket.expo2025.or.jp/*```
            - Applied Policy ```script-src *;frame-src *;style-src *;img-src *; ```
        - Desktop Chrome: CSP Unblock 套件
            ![CSP Unblock](https://i.imgur.com/DcFEIBw.png)

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