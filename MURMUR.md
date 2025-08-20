# 阿宅專用閒聊：官網對於宅宅的友善之處

- 無法自由切換上/下一頁，是因為特定頁面有綁定特定 sessionStorage (估計想防止有心人進行跳頁，但其實只要要指定好 sessionStorage 則可以自由切到想切的頁面)
- 查詢當日可預約清單的 api 參數可以自己改，網站預設 ```limit=10``` 然後分好幾頁，但其實打一個 ```limit=1000``` 一次就能把當天開放抽選的活動資訊全部抓下來(但可想而知很操 Server & 前台等待回應時間很久，然後 07/16 之後發現 Server 端有時會噴 Timeout Error)，以下是 F12 sample code (需在有登入的狀況下到 F12 執行)

```javascript
var a = await fetch("https://ticket.expo2025.or.jp/api/d/events?ticket_ids%5B%5D=8NB4EWUWKY&event_name=&entrance_date=20250429&count=1&limit=1000&event_type=0&next_token=&channel=5", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Api-Lang": "ja", //這邊可以指定 zh-tw 取回中文資料
        "Priority": "u=4",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "referrer": "https://ticket.expo2025.or.jp/event_search/?id=8NB4EWUWKY&keyword=%E3%81%AE&screen_id=108&entrance_date=20250422&lottery=5&event_type=0&reserve_id=",
    "method": "GET",
    "mode": "cors"
});
```

- 承上，這個 events API 的參數可自由修改，例如：
    - ```channel=5```表示當日抽選階段，```channel=4```則為三天前先搶先贏
    - ```entrance_date=20250429``` 可改成想要抓的日期 

- 地圖方面，OpenStreetMap 在萬博的圖磚資訊相當完整，加上官方網站的地圖感覺也是基於 OSM 畫了一張場館的輪廓圖，兩者重疊後，便可組合出一個美觀又帶有資訊的地圖介面

- 抽選方面，已知可以 F12 重送 Request (機器人友善) 的表單如下：
    1. 入場時間登記
    1. 三日前or當日的先搶先贏預約

- 排隊方面，已知可以到特定頁面略過排隊