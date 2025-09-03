// ==UserScript==
// @name        Expo2025UIfix
// @namespace   Expo2025
// @description Improve the user experience of EXPO2025 ticket official site
// @include     https://ticket.expo2025.or.jp/*
// @version     1.3
// ==/UserScript==

(function() {
    var fileref = document.createElement('script');
    fileref.onerror = async function(){
        await new Promise((r)=>setTimeout(r,2000));
        var div = document.createElement('div');
        div.innerHTML = '<h3 style="background: red; color: white; text-align: center; padding: 0.5em;">EXPO2025 地圖套件載入失敗，請確認已確實繞過 CSP 限制</h3>';
        document.querySelector('header').appendChild(div);
    };
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', '//grassboy.github.io/EXPO2025/ui.fix.js?v='+(new Date()).getTime());
    document.getElementsByTagName('head').item(0).appendChild(fileref);
    //讓 ticket.expo2025.or.jp 支援上/下一頁切換
    var page_map = JSON.parse(localStorage.page_map || '{}');
    window.onbeforeunload = function() {
        if (sessionStorage.latestPage && sessionStorage.pageSequenceName) {
            page_map[sessionStorage.pageSequenceName] = {
                latestPage: sessionStorage.latestPage,
                pageSequenceName: sessionStorage.pageSequenceName
            }
        }
        localStorage.page_map = JSON.stringify(page_map);
    };
    for (var k in page_map) {
        if (location.pathname.indexOf(JSON.parse(k)) != -1) {
            var s = page_map[k];
            sessionStorage.latestPage = s.latestPage;
            sessionStorage.pageSequenceName = s.pageSequenceName;
        } else {
            console.log(k, location.pathname, 'NOT_FOUND');
        }
    }
})();

