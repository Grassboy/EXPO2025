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
1. 不同語言的場館資訊有差異(ex: 在日文版下的場館資訊有 193 筆，中文版只有 181 筆) (後來應該有修正了)
1. 進行當日預約的流程繁瑣
1. 網站一段時間後就會被登出

## 主要功能

- 互動式地圖瀏覽
- 無障礙設施標示切換
- 自適應式彈出視窗
- 地圖標記點優化
- 每隔一段時間 call 一次 api 防止被自動登出(但官網限制登入 12 小時後一定要重登)

## 使用示意圖
- 安裝完畢後，會看到選單功能被替換成(小弟認為的)常用功能
   ![破關畫面](https://i.imgur.com/t0eo0kL.png)
- 點選[園區地圖] 可以看到地圖介面
   ![地圖](https://i.imgur.com/08QXCiy.png)
- 點選地圖上的紅/綠點可直接進行預約
   ![預約點](https://i.imgur.com/9glWkHE.png)
- 可設定造訪日期與目前要參與抽選的票券 ID (可以用來進行三日前抽選)
   ![調整日期](https://i.imgur.com/A1BrWCr.png)
- 除了改善後的預約動線外，點選場館編號還是能夠到官方的預約介面進行預約
   ![官方動線](https://i.imgur.com/rIcQaKm.png)
- 地圖介面也改善了搜尋體驗，不用再糾結大小寫、中英日文了
   ![搜尋改善](https://i.imgur.com/uguh19m.png)
- 搜尋文字改搜 ... 可以查找當下還可預約的場館
   ![搜尋...](https://i.imgur.com/TCn5AfZ.png)
- 因為外掛可以讓上一頁/下一頁功能正常化，所以也可以把官網任何一個頁面以捷徑的方式釘選到手機桌面
   ![主畫面](https://i.imgur.com/ibr21AK.png)
   > 謎之音：官網要排隊排很久嗎？直接點連結，有機會跳過排隊畫面喲(不知道官網什麼時候會修掉這個 bug XD)

> 更多技術細節和閒聊請參閱 [MURMUR.md](./MURMUR.md)

## 技術特點

- 使用 Leaflet.js 實現地圖功能
- 響應式設計，支援各種裝置
- 本地儲存 (localStorage) 保存用戶偏好設定

## 使用方式

1. 先安裝好 Tempermonkey 以啟用瀏覽器的 UserScript 支援
1. 前往 [https://grassboy.github.io/EXPO2025/ui.fix.user.js](https://grassboy.github.io/EXPO2025/ui.fix.user.js) 安裝 Expo2025 UI Fix 的網站腳本
1. 直接訪問 [https://ticket.expo2025.or.jp/](https://ticket.expo2025.or.jp/)
1. 理論上前兩點看起來很簡單，實際上需要克服的技術痛點還有如下：
    1. 瀏覽網站的瀏覽器必需支援安裝 UserScript
        - Desktop Chrome / Firefox Mobile: Tempermonkey 套件
        - Desktop Chrome 要額外再開啟「允許使用者指令碼」功能，如圖：
            ![Allow UserScript](https://i.imgur.com/XARiSKf.png)
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
 - 當日預約機器人(已移除)資料來源 [https://expo.ebii.net/](https://expo.ebii.net/)

## 貢獻指南

歡迎到 [https://github.com/Grassboy/EXPO2025/issues/new](https://github.com/Grassboy/EXPO2025/issues/new) 提交 issue

## 授權

本專案採用 GPL 授權條款。 
    - 可自由修改，修改後請註明原作者 https://github.com/Grassboy
    - 修改後的程式請 OpenSource