    var style = document.createElement('style');
    style.innerHTML = `
    #expo2025_map {
        iframe {
            border: none; width: 100%; height: 0;
        }
        &.active iframe {
            height: calc(100vh - 154px);
        }
    }
    @media (max-width: 767px) {
        #expo2025_map.active iframe {
            height: calc(100vh - 78px - 21.3333333333vw * 0.75);
        }
    }
    .btn-hack {
        [data-name="home"] &, [data-name="message"] &,
        [data-name="reserve"] &, [data-name="myticket"] & {
            filter: invert(30%) sepia(90%) saturate(600%) hue-rotate(180deg) brightness(90%) contrast(95%);
            &.active {
                filter: invert(30%) sepia(90%) saturate(600%) hue-rotate(180deg) brightness(90%) contrast(95%) drop-shadow(0 0 3px cyan);
            }
        }
        [data-name="myticket"] & {
            background-position: center 5.5vw!important;
            background-size: 8vw!important;
        }
        [data-name="reserve"] & {
            background-image: url("https://www.svgrepo.com/show/477646/ticket-8.svg"), linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.3) 47%, rgba(255,255,255,0.3))!important;
            background-size: 7.8vw, 7vw 7.8vw!important;
        }
        [data-name="message"] & {
            background-position: center 5.5vw!important;
        }
    }
    #drawer button[title="園區地圖"].active {
        filter: drop-shadow(0 0 3px cyan);
    }
    @keyframes for_error_modal {
        0% {fill-opacity: 1;}
        100% {fill-opacity: 1;}
    }
    .ReactModal__Overlay:has([data-message-code="SW_GP_DL_124_0065"]) {
        pointer-events: none!important;
        background: transparent!important;
        animation: for_error_modal 1s linear;
        .ReactModal__Content {
            pointer-events: auto;
        }
    }
    `;
    document.head.appendChild(style);


    // default config managed by localStorage
    var getConfig = function(key, default_value){
        return localStorage.getItem(key) || (localStorage.setItem(key, default_value) || default_value);
    };
    var setConfig = function(key, value){
        localStorage.setItem(key, value);
        return value;
    };

    var ticket_id = location.href.match(/&id=([^&]+)/);
    var date = location.href.match(/&entrance_date=([^&]+)/);
    var language = location.href.split('/')[3];
    var anchor = function(id){
        return document.querySelector('[data-message-code="'+id+'"]');
    };
    var $ = async function(selector){
        await waitUntil(function(){
            return document.querySelector(selector);
        });
        return document.querySelector(selector);
    };
    var disabled_map = 'yes';
	var waitUntil = function(fn) {
        var check_time = 0;
        return new Promise(function(resolve, reject){
            var check = function(){
                if(fn()) {
                    resolve();
                } else {
                    check_time++;
                    console.clear();
                    console.log('waitUntil 等了 ',check_time,'次');
                    setTimeout(check, 100);
                }
            };
            check();
        });
	};
    var isToday = function(date){
        var today = new Date();
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return date == year + month + day;
    };
    var getError = function(key){
        var trans = JSON.parse(localStorage["persist:p-expo-user"]);
        var t = JSON.parse(trans.messages);
        return t.messages[key];
    };
    var replaceLinkMobile = async function(id, icon, text, session, href){
        var node;
        await waitUntil(function(){
            node = document.querySelector('#bottom-fix-nav [data-message-code="'+id+'"]');
            return node?true:false;
        });
        node.innerHTML = text;
        var li = node.parentNode.parentNode;
        li.innerHTML = li.innerHTML+' ';
        li.querySelector('button').style.backgroundImage = 'url('+icon+')';
        li.querySelector('button').classList.add('btn-hack');
        li.querySelector('button').setAttribute('title', text);
        li.addEventListener('click', function(){
            for(var k in session) {
                sessionStorage[k] = session[k];
            }
            if(typeof href == 'function') {
                href(li, language);
            } else if(href.indexOf('http') === 0) {
                location.href = href;
            } else {
                location.href = language+href;
            }
        });
        return li;
    };
    var replaceLink = async function(id, text, session, href){
        var node;
        await waitUntil(function(){
            node = document.querySelector('[data-message-code="'+id+'"]');
            return node?true:false;
        });
        var btn = document.createElement('button');
        btn.title = text;
        btn.innerHTML = '<span><span class="style_renderer__ip0Pm">'+text+'</span></span>';
        node.parentNode.parentNode.replaceWith(btn);
        btn.addEventListener('click', function(){
            for(var k in session) {
                sessionStorage[k] = session[k];
            }
            if(typeof href == 'function') {
                href(btn.parentNode, language);
            } else if(href.indexOf('http')===0) {
                location.href = href;
            } else {
                location.href = language+href;
            }
        });
    };
    var expandTicketId = function(ticket_id){
        return ticket_id.split(',').join('&ticket_ids[]=');
    };
    switch(language) {
    case "en":
    case "fr":
    case "zh-tw":
    case "zh-cn":
    case "ko":
        language = '/'+language+'/';
        break;
    default:
        language = '/';
        break;
    }
    ticket_id = ticket_id && ticket_id[1] || localStorage.ticket_id;
    date = date && date[1] || localStorage.date;
    if(ticket_id && localStorage.ticket_id != ticket_id) {
        if(confirm('要重新將預設的門票 ID 設定成 '+ticket_id+'？')){
            localStorage.ticket_id = ticket_id;
            (async function(){
                try {
                    var rsp = await fetch('https://ticket.expo2025.or.jp/api/d/my/tickets/'+ticket_id+'/?refresh_bid_state=1');
                    var json = await rsp.json();
                    var date = json.schedules[0].entrance_date;
                    localStorage.date = date;
                    alert('根據這張票，已重新設定造訪日期為 '+date);
                } catch(e) {
                    console.log('根據這張票，無法取得造訪日期，請手動設定');
                }
            })();
        }
    }
    if(date && localStorage.date != date) {
        if(confirm('要重新將目前的造訪日期設定成 '+date+'？')){
            localStorage.date = date;
        }
    }
    var map_iframe = {
        show: '<iframe class="map-iframe" allow="geolocation" src="https://grassboy.github.io/EXPO2025/">',
        hide: '<iframe class="map-iframe" allow="geolocation" src="about:blank">'
    }
    if(ticket_id) {
        /*
location.href = 'https://ticket.expo2025.or.jp/zh-tw/event_search/?id=MREBB6J6X2&screen_id=108&lottery=5&entrance_date=20250421';
         * */
        replaceLink('SW_GP_DL_001_0109', '預約搜尋', {
            pageSequenceName: '"/event_search"',
            latestPage: '"/ticket_selection"'
        }, function(btn, language){
            location.href = language+'event_search/?id='+localStorage.ticket_id+'&screen_id=108&lottery=5&entrance_date='+localStorage.date;
        });
        replaceLink('SW_GP_DL_001_0106', '今日公告', {
        }, 'https://www.expo2025.or.jp/news/daily/');
        var trigger_map = async function(li){
            if(window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.standalone === true) {
                document.querySelector('html').requestFullscreen();
            }
            var div = (await $('#expo2025_map'));
            if(disabled_map == 'yes') {
                disabled_map = 'no';
                div.innerHTML = map_iframe.show;
                div.classList.add('active');
                [...document.querySelectorAll('button[title="園區地圖"]')].forEach(function(btn){
                    btn.classList.add('active');
                });
            } else {
                disabled_map = 'yes';
                div.innerHTML = map_iframe.hide;
                div.classList.remove('active');
                [...document.querySelectorAll('button[title="園區地圖"]')].forEach(function(btn){
                    btn.classList.remove('active');
                });
            }
        };
        var goto_reservation_log = async function(language){
            var x = await fetch('https://ticket.expo2025.or.jp/api/d/my/tickets/');
            var json = await x.json()
            var to_url;
            var ticket_id = localStorage.ticket_id;
            var date = localStorage.date;
            var getSuitableUrl = function(ticket, date){
                var to_url;
                if(ticket.schedules.length == 1) {
                    to_url = language+'myticket_detail/?screen_id=018&id='+ticket.ticket_id
                } else {
                    for(var schedule of ticket.schedules) {
                        if(schedule.entrance_date == date || date == null) {
                            to_url = language+'myticket_detail/?screen_id=018&id='+ticket.ticket_id+'&reserve_id='+schedule.user_visiting_reservation_id+'&scroll=situation';
                        }
                    }
                }
                return to_url;
            }
            for(var id of ticket_id.split(',')) {
                for(var ticket of json.list) {
                    if(id == ticket.ticket_id) {
                        to_url = getSuitableUrl(ticket, date);
                    }
                    if(to_url) break;
                }
                if(to_url) break;
            }
            if(!to_url && json.list.length) {
                to_url = getSuitableUrl(json.list[0])
            }
            if(to_url) {
                location.href = to_url;
            } else {
                alert('無法查看抽選結果，可能您尚無票券或您尚未安排入場預約');
            }
        }
        replaceLink('SW_GP_DL_001_0102', '園區地圖', {}, trigger_map);
        replaceLinkMobile('SW_GP_DL_001_0601', 'https://www.svgrepo.com/show/505926/map.svg', '園區地圖', {}, trigger_map);
        replaceLinkMobile('SW_GP_DL_001_0602', '/_next/static/media/ico_bottomnav_02.775c556f.svg', '抽選結果', {
        }, function(btn, language){
            goto_reservation_log(language);
        });
        replaceLinkMobile('SW_GP_DL_001_1603', 'https://www.svgrepo.com/show/477646/ticket-8.svg', '我的門票', {
        }, 'https://ticket.expo2025.or.jp/zh-tw/myticket/');
        replaceLinkMobile('SW_GP_DL_001_0421', 'https://www.svgrepo.com/show/308980/calendar-date-future-day.svg', '今日公告', {
        }, 'https://www.expo2025.or.jp/news/daily/');
        replaceLinkMobile('SW_GP_DL_001_0604', 'https://www.svgrepo.com/show/77865/location-search-symbol.svg', '預約搜尋', {
            pageSequenceName: '"/event_search"',
            latestPage: '"/ticket_selection"'
        }, function(btn, language){
            location.href = language+'event_search/?id='+localStorage.ticket_id+'&screen_id=108&lottery=5&entrance_date='+localStorage.date;
        });
        (async function(){
            await replaceLink('SW_GP_DL_001_0113', '抽選結果', {
            }, function(btn, language){
                goto_reservation_log(language);
            });
            var div = document.createElement('div');
            div.id = 'expo2025_map';
            if(disabled_map == 'yes') {
                div.innerHTML = map_iframe.hide
            } else {
                div.innerHTML = map_iframe.show
                div.classList.add('active');
            }
            document.querySelector('main').prepend(div);
            (await $('#ot-sdk-btn-floating')).style.display = 'none';
            document.body.addEventListener('animationend', function (e) {
                if (e.target.matches('.ReactModal__Overlay:has([data-message-code="SW_GP_DL_124_0065"])')) {
                    //捲到預約按鈕 懂的就懂 XD 
                    var reserve_button = document.querySelector('[data-message-code="SW_GP_DL_124_0018"]');
                    reserve_button && reserve_button.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    });
                }
            });

        })();
    }
    var MAX_QUEUE_IN_LINE = 3;
    var QUEUE = {};
    function waitInline(line_id) {
        if (!QUEUE[line_id]) {
            QUEUE[line_id] = {
                running: 0,
                waiting: [],
                active: true
            };
        }
        const queue = QUEUE[line_id];
        queue.active = true;
        //console.log(queue);
        return new Promise(resolve => {
            const tryRun = () => {
                if (queue.running < MAX_QUEUE_IN_LINE) {
                    queue.running++;
                    // 傳回 done()，呼叫 done 後跑下一個
                    resolve({
                        active: queue.active,
                        done: () => {
                            console.log('done', line_id);
                            queue.running--;
                            if (queue.waiting.length > 0) {
                                // 把下一個喚醒
                                const next = queue.waiting.shift();
                                next();
                            }
                        }
                    });
                } else {
                    // 不可執行，加入等待隊列
                    queue.waiting.push(tryRun);
                }
            };
            tryRun();
        });
    }
    //綁定 onmessage 事件 
    var support_events = {
        ping: function(json) {
            toChild({
                'op': 'getScript',
                'url': './ui.fix2.js?v='+(new Date()).getTime()
            });
        },
        toPavilianPage: function(json){
            sessionStorage.latestPage = '"/event_search"';
            sessionStorage.pageSequenceName = '"/event_time"';
            var url = language + 'event_time/?id='+localStorage.ticket_id+'&event_id='+json.event_code+'&screen_id=108&lottery='+(isToday(localStorage.date)? '5' : '4')+'&keyword=&event_type=0&reserve_id=&entrance_date='+localStorage.date;
            if(json.new_window) {
                window.open(url, '_blank');
            } else {
                location.href = url;
            }
        },
        getLocalStorageDate: function(json){
            toChild({
                'op': 'getLocalStorageDateResult',
                'date': localStorage.date
            });
        },
        setLocalStorageDate: function(json){
            localStorage.date = json.date;
            alert('已設定造訪日期為 '+json.date);
            toChild({
                'op': 'setLocalStorageDateResult',
                'date': json.date
            });
        },
        setLocalStorageTicketId: async function(json){
            var url = 'https://ticket.expo2025.or.jp/api/d/tickets/available_hours?entrance_date='+localStorage.date +
                      '&ticket_ids[]='+expandTicketId(json.ticket_id);
            var request = await fetch(url);
            var rsp = await request.json();
            if(rsp.entrance_date) {
                localStorage.ticket_id = json.ticket_id;
                alert('已設定使用票券為 '+json.ticket_id);
                toChild({
                    'op': 'setLocalStorageTicketIdResult',
                    'ticket_id': json.ticket_id
                });
            } else {
                alert('設定使用票券失敗，有可能是指定的票券在 ' + localStorage.date + ' 無權參觀，請再確認！');
            }
        },
        getActiveTicket: async function(json){
            var url = 'https://ticket.expo2025.or.jp/api/d/my/tickets/';
            var request = await fetch(url);
            var rsp = await request.json();
            var all_ticket_ids = rsp.list.map(function(d){
                return d.ticket_id
            });
            var now_ticket_id = localStorage.ticket_id;
            toChild({
                'op': 'getActiveTicketResult',
                'all_ticket_ids': all_ticket_ids,
                'ticket_id': now_ticket_id
            })
        },
        getAllIdlePavilion: async function(json){
            var url = 'https://ticket.expo2025.or.jp/api/d/events?ticket_ids[]='+expandTicketId(localStorage.ticket_id)+'&entrance_date='+localStorage.date+'&count=1&limit=1000&event_type=0&next_token=&channel='+(isToday(localStorage.date)? 5 : 4);
            var request = await fetch(url);
            var rsp = await request.json();
            if(rsp && rsp.list) {
                toChild({
                    'op': 'getAllIdlePavilionResult',
                    'result': rsp.list.filter(item => item.date_status < 2).map(item => item.event_code)
                });
            } else {
                alert('取得空閒場館失敗，怪怪…');
                toChild({
                    'op': 'getAllIdlePavilionResult',
                    'result': []
                });
            }
        },
        querySlot: async function(json){
            var request = await fetch("https://ticket.expo2025.or.jp/api/d/events/"+json.rank_id+"?ticket_ids[]="+
                expandTicketId(localStorage.ticket_id)+"&entrance_date="+localStorage.date+
                "&channel="+(isToday(localStorage.date)? 5 : 4));
            var rsp = await request.json();
            var slots = [];
            for(var k in rsp.event_schedules){
                var item = rsp.event_schedules[k];
                slots.push({
                    id: k,
                    schedule_no: parseInt(item.schedule_no),
                    schedule_name: item.schedule_name,
                    time_status: item.time_status, // 0 圈圈  1 三角  2 叉叉
                    unavailable_reason: item.unavailable_reason
                });
            }
            //sort slots by schedule_no
            slots.sort(function(a, b){
                return a.schedule_no - b.schedule_no;
            });
            toChild({
                'op': 'querySlotResult',
                'slots': slots,
                'rank_id': json.rank_id
            });
        },
        reserveSlot: async function(json){
            // Pull Request is welcome :D
            var can_reserve = false;
            var x = await fetch('https://ticket.expo2025.or.jp/api/d/my/tickets/');
            var json = await x.json();
            json.list.forEach(function(ticket){
                ticket.schedules.forEach(function(schedule){
                    if(schedule.entrance_date == localStorage.date) {
                        can_reserve = true;
                    }
                })
            });
            if(!can_reserve) {
                alert('錯誤：您指定的日期無法預約');
                toChild({
                    'op': 'reserveSlotResult',
                    'success': false
                });
                return;
            }
            /*
            */
            var pass = await waitInline(json.event_code);
            if(pass.active) {
                //document.querySelector('#auto_response [data-event_code="'+json.event_code+'"][data-slot="'+json.slot_id+'"]') || 
                //(document.querySelector('#popup .code') && document.querySelector('#popup .code').textContent == json.event_code)
                toChild({
                    'op': 'checkSlotAvailable',
                    'event_code': json.event_code,
                    'slot_id': json.slot_id
                });
                console.log('開始預約', json.event_code, json.slot_id);
                var request = await fetch("https://ticket.expo2025.or.jp/api/d/user_event_reservations", {
                    "credentials": "include",
                    "headers": {
                        "Accept": "application/json, text/plain, */*",
                        "Accept-Language": "zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3",
                        "X-Api-Lang": "zh-tw",
                        "Content-Type": "application/json;charset=utf-8",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        "Priority": "u=0"
                    },
                    "referrer": "https://ticket.expo2025.or.jp/zh-tw/event_time/?id="+localStorage.ticket_id+"&event_id="+json.event_code+"&screen_id=108&lottery="+(isToday(localStorage.date)? '5' : '4')+"&keyword=&event_type=0&reserve_id=&entrance_date="+localStorage.date,
                    "body": JSON.stringify({
                        "ticket_ids": localStorage.ticket_id.split(','),
                        "entrance_date": localStorage.date,
                        "start_time": json.slot_id,
                        "event_code": json.event_code,
                        "registered_channel": (isToday(localStorage.date)? '5' : '4')
                    }),
                    "method": "POST",
                    "mode": "cors"
                });
                try {
                    var rsp = await request.json();
                    /*
                    localStorage['persist:p-expo-user'].split('CMN_ERR_VALIDATE_0162\\"')[1].match(/:\\"([^"\\]+)/)[1]
                    */
                    if(rsp.error) {
                        try {
                            var error_code = rsp.error.detail[localStorage.ticket_id.split(',')[0]][0];
                        } catch(e) {
                            error_code = rsp.error.name || 'UNKNOWN';
                        }
                        toChild({
                            'op': 'reserveSlotResult',
                            'success': false,
                            'error': error_code,
                            'error_message': getError(error_code)
                        });
                    } else {
                        toChild({
                            'op': 'reserveSlotResult',
                            'success': true,
                            'event_code': json.event_code,
                            'slot_id': json.slot_id
                        });
                    }
                } catch(e) {
                    console.log(e);
                    toChild({
                        'op': 'reserveSlotResult',
                        'success': false
                    });
                }
            } else {
                console.log('已經沒得預約了0rz', json.event_code, json.slot_id);
            }
            pass.done();
        },
        checkSlotAvailableResponse: function(json){
            //console.log('checkSlotAvailableResponse', json);
            if(!json.available) {
                var queue = QUEUE[json.event_code];
                if(queue) {
                    queue.active = false;
                }
            }
        }
    };
    var toChild = function(json){
        document.querySelector('.map-iframe').contentWindow.postMessage(JSON.stringify(json), '*');
    };
    window.addEventListener('message', function(event) {
        try {
            var json = JSON.parse(event.data);
            if(support_events[json.op]) {
                support_events[json.op](json);
            } else {
                console.log('不支援的事件', json.op);
            }
        } catch(e) {
            //console.error('onmessage 事件錯誤', e);
        }
    });

    setInterval(async function(){
        try {
            await fetch("https://ticket.expo2025.or.jp/api/d/account/info/", {
                "credentials": "include",
                "referrer": "https://ticket.expo2025.or.jp/zh-tw/",
                "method": "GET",
                "mode": "cors"
            });
        } catch(e) {
            location.reload();
        }
    }, 120000);
