var now_rank_id = null;
var support_events = {
    getScript: function(json) {
        var script = document.createElement('script');
        script.src = json.url;
        document.head.appendChild(script);
    },
    getLocalStorageDateResult: function(json){
        attachDateControl(json.date);
    },
    getAllIdlePavilionResult: function(json){
        //alert('getAllIdlePavilionResult'+(JSON.stringify(json)));;
        idle_pavilion_list = json.result;
        if(idlePavilionResolve) {
            idlePavilionResolve();
            idlePavilionResolve = null;
        } else {
            alert('idlePavilionResolve is null');
        }
    },
    setLocalStorageDateResult: function(json){
        location.reload();
    },
    setLocalStorageTicketIdResult: function(json){
        location.reload();
    },
    querySlotResult: function(json){
        if(now_rank_id == json.rank_id){
            var additional_info = document.querySelector('.additional-info');
            if(json.slots.length > 0){
                /*
                    id: k,
                    schedule_no: parseInt(item.schedule_no),
                    schedule_name: item.schedule_name,
                    time_status: item.time_status, // 0 圈圈  1 三角  2 叉叉
                    unavailable_reason: item.unavailable_reason
                */
                var selected = false;
                additional_info.innerHTML = "<span>⏰可預約時段：</span><select class='slot-select'>" + json.slots.map(function(slot){
                    var status, selected_attr = '';
                    if(slot.time_status == 2){
                        status = '❌';
                    } else if(slot.time_status == 1){
                        if(slot.unavailable_reason){
                            status = slot.unavailable_reason == 2 ? '🌗' : '⛔';
                        } else {
                            status = '🟠';
                        }
                    } else {
                        status = slot.unavailable_reason ? '⛔' : '🟢';
                    }
                    if(!selected && (status == '🟢' || status == '🟠')){
                        selected = true;
                        selected_attr = ' selected';
                    }
                    return '<option value="'+slot.id+'" '+selected_attr+'>'+status+' '+slot.schedule_name+'</option>';
                }).join('') + "</select><button class='reserve-button'>預約</button>";
                additional_info.querySelector('.reserve-button').addEventListener('click', function(){
                    this.innerHTML = '<spin class="loading-icon" />';
                    this.disabled = true;
                    toParent({
                        op: 'reserveSlot',
                        event_code: json.rank_id,
                        slot_id: additional_info.querySelector('.slot-select').value
                    });
                });
            }else{
                additional_info.innerHTML = "<span>❌目前無可預約時段😔</span>";
            }
        }
    },
    reserveSlotResult: function(json){
        var btn = document.querySelector('.additional-info .reserve-button');
        var stop_agent = false, fail_msg;
        if(btn){
            btn.disabled = false;
            btn.textContent = '預約';
        }
        if(json.success){
            var stop_msg = '';
            if(auto_config.is_running){
                document.querySelector('.auto-stop').click();
                stop_msg = '，代訂機器人將自動停止';
            }
            alert(`${i18n(cache[json.event_code].event_name)} ${json.slot_id} 預約成功${stop_msg}`);
        } else {
            switch(json.error){
            case "CMN_ERR_VALIDATE_0205":
                fail_msg = '三歲以下的票券無法單獨預約';
                stop_agent = true;
                break;
            case "CMN_ERR_VALIDATE_0162":
                fail_msg = '您的票券已有當日預約';
                stop_agent = true;
                break;
            case "CMN_ERR_VALIDATE_0163":
                fail_msg = '好像還沒進場？';
                break;
            case "schedule_out_of_stock":
                fail_msg = '該時段已額滿';
                break;
            default:
                fail_msg = '預約失敗';
                console.log(json.error, json.error_message);
                break;
            }
        }
        if(auto_config.is_running){
            if(stop_agent){
                fail_msg += '，代訂機器人將自動停止';
                document.querySelector('.auto-stop').click();
            }
        }
        alertMsg(fail_msg);
    },
    checkSlotAvailable: function(json){
        var result = document.querySelector('#auto_response [data-event_code="'+json.event_code+'"][data-slot="'+json.slot_id+'"]') || 
                     (document.querySelector('[data-popup-target1="popup"][data-popup-target2="popup"] #popup .code') && 
                      document.querySelector('[data-popup-target1="popup"][data-popup-target2="popup"] #popup .code').textContent == json.event_code)
        toParent({
            op: 'checkSlotAvailableResponse',
            event_code: json.event_code,
            slot_id: json.slot_id,
            available: result
        });
    },
    getActiveTicketResult: function(json){
        attachTicketControl(json.ticket_id, json.all_ticket_ids);
    }
};

//dynamic load style
var style = document.createElement('link');
style.href = 'style2.css?v=3';
style.rel = 'stylesheet';
document.head.appendChild(style);
toParent({
    op: 'getLocalStorageDate'
});
toParent({
    op: 'getActiveTicket'
});
var checkAdditionalInfo = function(rank_id) {
    var div = document.querySelector('.additional-info');
    div.innerHTML = '';
    if(!cache[rank_id]){
        return;
    }
    now_rank_id = rank_id;
    div.innerHTML = '<span>⏰可預約時段：</span><spin class="loading-icon" />';
    toParent({
        'op': 'querySlot',
        'rank_id': rank_id
    });
};
var attachDateControl = function(date){
    // 以 leaflet control 的方式 在 map 的 左下角 顯示 目前造訪的日期
    var dateControl = L.control({
        position: 'bottomleft'
    });
    var new_date = date;
    dateControl.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info');
        div.innerHTML = '<span>🗓️造訪日期：</span><em>'+date+'</em>';
        div.id = 'date-control';
        div.addEventListener('click', function() {
            new_date = prompt('請指定新的造訪日期(格式：20250421)', new_date);
            if(new_date && new_date.match(/^\d{8}$/)){
                div.querySelector('em').innerHTML = new_date;
                toParent({
                    op: 'setLocalStorageDate',
                    date: new_date
                });
            }
        });
        return div;
    };
    dateControl.addTo(map);
};
var attachTicketControl = function(ticket_id, all_ticket_ids){
    // 根據 all_ticket_ids 產生 checkbox 列表
    // ticket_id 是目前選取的 ticket_ids 字串形態，有可能是多個 ticket_id 以逗號分隔
    // 產生 checkbox 後，選取的 ticket_id 會更新到 localStorage 的 ticket_id 中
    var ticketControl = L.control({
        position: 'bottomleft'
    });
    ticketControl.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'tickets');
        div.id = 'ticket-control';
        div.innerHTML = '<button id="update_ticket_id" style="display: none;">更新</button><span>🎫使用票券：</span><ul class="ticket-list"></ul>';
        var ul = div.querySelector('.ticket-list');
        var update_ticket_id = div.querySelector('#update_ticket_id');
        update_ticket_id.setAttribute('now_ticket_id', ticket_id);
        update_ticket_id.addEventListener('click', function(){
            toParent({
                op: 'setLocalStorageTicketId',
                ticket_id: update_ticket_id.getAttribute('new_ticket_id')
            });
        });
        // 將目前的 ticket_id 轉換為陣列
        var selected_tickets = ticket_id ? ticket_id.split(',') : [];
        
        ul.innerHTML = all_ticket_ids.map(function(id){
            var isChecked = selected_tickets.indexOf(id) !== -1 ? 'checked' : '';
            return '<li><label><input type="checkbox" value="'+id+'" '+isChecked+'> '+id+'</label></li>';
        }).join('');
        
        ul.addEventListener('change', function(e){
            if(e.target.type === 'checkbox'){
                navigator.clipboard.writeText(e.target.parentNode.textContent.trim());
                var selectedOptions = Array.from(ul.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                var new_ticket_id = selectedOptions.join(',');
                if(new_ticket_id == '') {
                    e.target.checked = true;
                    return;
                }
                if(new_ticket_id != update_ticket_id.getAttribute('now_ticket_id')){
                    update_ticket_id.style.display = 'block';
                    update_ticket_id.setAttribute('new_ticket_id', new_ticket_id);
                } else {
                    update_ticket_id.style.display = 'none';
                }
            }
        }); 
        return div;
    };
    ticketControl.addTo(map);
};
var isToday = function(date){
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    return date == year + month + day;
};
var idlePavilionResolve = null;
var idle_pavilion_list = [];
MAGIC_SEARCH_TERM = '...';
magicSearch = async function(){
    try {
        const controller = new AbortController();
        const signal = controller.signal;
        var promise = (isToday(document.querySelector('#date-control em').textContent) ? fetch('https://grassboy.tw:31090/get_available', {signal}) : Promise.resolve(false));
        var result = await Promise.any([
            promise,
            new Promise(resolve => {
                setTimeout(function(){
                    controller.abort();
                    resolve(false);
                }, 1000);
            })
        ]);
        if(!result) {
            alert('開始取得空閒場館…可能會花個十幾秒喲~');
            await new Promise(resolve => {
                idlePavilionResolve = resolve;
                toParent({
                    op: 'getAllIdlePavilion'
                });
            });
            return true;
        }
        var rsp = await result.json();
        idle_pavilion_list = rsp.rsp;
        return true;
    } catch(e) {
        alert('無法取得空閒場館，請稍後再試');
        return false;
    }
};
magicSearchCheck = function(item){
    return idle_pavilion_list.indexOf(item.event_code) != -1;
}
document.body.addEventListener('click', function(e){
    if(e.target.matches('#popup .code')){
        toParent({
            op: 'toPavilianPage',
            event_code: e.target.textContent,
            new_window: e.ctrlKey
        });
    }
});
// 自動控制項
var autoControl = AddPopupControl('fa-solid fa-robot', 'auto', false);
var auto_response_div = document.createElement('div');  
auto_response_div.id = 'auto_response';
auto_response_div.innerHTML = '<ul></ul>';
auto_response_div.querySelector('ul').addEventListener('animationend', function(e) {
    if(e.target.tagName.toLowerCase() === 'li') {
        e.target.remove();
    } else if(e.target.tagName.toLowerCase() === 'em') {
        e.target.remove();
    }
});
var autoItemClick = function(e){
    if(e.target.tagName.toLowerCase() === 'li') {
        var event_code = e.target.getAttribute('data-event_code');
        for(var marker of [...markers, ...chairmanMarkers]){
            if(marker._event_code == event_code){
                if(marker.getElement()){
                    setTimeout(function(){
                        focusOnMarker(marker);
                    }, 100);
                } else {
                    alert('無法開啟釋出場館，請確定該圖標目前沒有被隱藏');
                }
                break;
            }
        }
    }
};
auto_response_div.querySelector('ul').addEventListener('click', autoItemClick);
autoControl._container.appendChild(auto_response_div);
var auto_div = document.createElement('div');
auto_div.id = 'popup_auto';
auto_div.classList.add('popup');
document.body.appendChild(auto_div);
auto_div.innerHTML = `
        <h3>
            <span class="helper-title-text">當日預約機器人(不穩定)</span>
            <span class="close-popup"><i class="fa-solid fa-xmark"></i></span>
        </h3>
        <div class="popup-content">
            <div class="card">
                <h4>機器人控制</h4>
                <div class="auto-operation">
                    <span>目前狀態：<span class="auto-status">未啟動</span></span>
                    <button class="auto-start">開始</button>
                    <button class="auto-stop">停止</button>
                    <button class="auto-update">更新</button>
                    <button class="auto-discard">取消更新</button>
                </div>
            </div>
            <div class="card">
                <h4>預約時間選擇</h4>
                <ul class="auto-time-list">
                    <li data-time="0930">09:00~09:30</li>
                    <li data-time="1000">09:30~10:00</li>
                    <li data-time="1030">10:00~10:30</li>
                    <li data-time="1100">10:30~11:00</li>
                    <li data-time="1130">11:00~11:30</li>
                    <li data-time="1200">11:30~12:00</li>
                    <li data-time="1230">12:00~12:30</li>
                    <li data-time="1300">12:30~13:00</li>
                    <li data-time="1330">13:00~13:30</li>
                    <li data-time="1400">13:30~14:00</li>
                    <li data-time="1430">14:00~14:30</li>
                    <li data-time="1500">14:30~15:00</li>
                    <li data-time="1530">15:00~15:30</li>
                    <li data-time="1600">15:30~16:00</li>
                    <li data-time="1630">16:00~16:30</li>
                    <li data-time="1700">16:30~17:00</li>
                    <li data-time="1730">17:00~17:30</li>
                    <li data-time="1800">17:30~18:00</li>
                    <li data-time="1830">18:00~18:30</li>
                    <li data-time="1900">18:30~19:00</li>
                    <li data-time="1930">19:00~19:30</li>
                    <li data-time="2000">19:30~20:00</li>
                    <li data-time="2030">20:00~20:30</li>
                    <li data-time="2100">20:30~21:00</li>
                </ul>
            </div>
            <div class="card">
                <h4>預約場館選擇</h4>
                <input type="search" class="auto-event-search" placeholder="搜尋場館" />
                <ul class="auto-event-list">
                </ul>
            </div>
        </div>
`;
//auto-time-list 裡的 li 為 UTC+9 的時間，把時間小於現在的移掉
auto_div.querySelectorAll('.auto-time-list li').forEach(li => {
    var time = li.getAttribute('data-time');
    var now = ((new Date().getUTCHours()+ 9)%24) * 100 + new Date().getUTCMinutes();
    if(time < now){
        li.remove();
    }
});

var wss = null;
var initWSS = function(){
    var closeWSS = function(){
        wss.onerror = wss.onclose = function(){/*noop*/};
        wss.close();
    };
    if(wss) {
        closeWSS();
    }
    var toWSS = function(json){
        wss.send(JSON.stringify(json));
    };
    wss = new WebSocket('wss://is.gy:31090/'+auto_status.substring(2), "*");
    wss.onmessage = function(e){
        var data = JSON.parse(e.data);
        switch(data.op){
        case 'released':
            var rsp = data.rsp;
            var ul = auto_response_div.querySelector('ul');
            for(var slot of rsp.slots){
                var li = document.querySelector('li[data-slot="'+slot+'"][data-event_code="'+rsp.event_code+'"]');
                if(!li){
                    li = document.createElement('li');
                    li.setAttribute('data-event_code', rsp.event_code);
                    li.setAttribute('data-slot', slot);
                    li.textContent = `[${slot} 釋出] ${i18n(cache[rsp.event_code].event_name)}`;
                    ul.prepend(li);
                }
                li.appendChild(document.createElement('em'));
                toParent({
                    op: 'reserveSlot',
                    event_code: rsp.event_code,
                    slot_id: slot
                });
            }
            break;
        case 'invalid_protocol':
            alert('機器人設定有誤，請重新設定');
            closeWSS();
            break;
        case 'update_auto_status':
            auto_status = data.auto_status;
            auto_config = autoStatusToAutoConfig(auto_status);
            updateAutoStatus();
            break;
        case 'isalive':
            toWSS({
                op: 'imalive',
                time: new Date().getTime()
            });
            break;
        default:
            console.log('unknown data', data);
            break;
        }
    };
    wss.onopen = function(){
        auto_div.querySelector('.auto-status').textContent = '🟢運行中';
    };
    wss.onerror = wss.onclose = function(){
        if(auto_config.is_running){
            auto_div.querySelector('.auto-status').textContent = '🔴重連中';
            console.log('機器人斷線…重新連線');
            setTimeout(initWSS, 1000);
        }
    }
};
//auto_status example: +/-/0930,1030/H7H0,C730,I900
var auto_status = getConfig('auto_status', '-');
var autoStatusToAutoConfig = function(auto_status){
    var auto_status_array = auto_status.split('/');
    return {
        is_running: auto_status_array[0] == '+',
        time_list: auto_status_array[1] ? auto_status_array[1].split(',') : [],
        event_code_list: auto_status_array[2] ? auto_status_array[2].split(',') : []
    };
};
var autoConfigToAutoStatus = function(auto_config){
    return (auto_config.is_running ? '+' : '-')+ '/' + auto_config.time_list.join(',')+'/'+auto_config.event_code_list.join(',');
};
var auto_config = autoStatusToAutoConfig(auto_status);
var time_slot = ["0930", "1000", "1030", "1100", "1130", "1200", "1230", "1300", "1330", "1400", "1430", "1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100"];
for(var i = 0; i < auto_config.time_list.length; i++) {
    var time = auto_config.time_list[i];
    var now = ((new Date().getUTCHours()+ 9)%24) * 100 + new Date().getUTCMinutes();
    if(time < now) {
        // 如果時間小於現在，則找到下一個大於現在，且不在 auto_config.time_list 中的時間，並且加入到 auto_config.time_list 中
        for(var j = time_slot.indexOf(time) + 1; j < time_slot.length; j++) {
            if(time_slot[j] >= now && auto_config.time_list.indexOf(time_slot[j]) == -1) {
                auto_config.time_list.push(time_slot[j]);
                auto_config.time_list.sort((a, b) => {
                    return a.localeCompare(b);
                });
                break;
            }
        }
        auto_config.time_list.splice(i, 1);
        i--;
    }
}
auto_status = setConfig('auto_status', autoConfigToAutoStatus(auto_config));
var updateAutoStatus = function(){
    auto_div.querySelectorAll('li[data-status]').forEach(li => {
        li.setAttribute('data-status', '');
    });
    auto_config.time_list.forEach(time => {
        auto_div.querySelector('.auto-time-list').querySelector('[data-time="'+time+'"]').setAttribute('data-status', 'tobe-selected');
    });
    auto_config.event_code_list.forEach(event_code => {
        auto_div.querySelector('.auto-event-list').querySelector('[data-event_code="'+event_code+'"]').setAttribute('data-status', 'tobe-selected');
    });
    if(
        auto_div.querySelector('.auto-time-list').querySelectorAll('[data-status="tobe-selected"]').length == 0 ||
        auto_div.querySelector('.auto-event-list').querySelectorAll('[data-status="tobe-selected"]').length == 0
    ){
        auto_config.is_running = false;
        auto_status = setConfig('auto_status', autoConfigToAutoStatus(auto_config));
    }
    if(auto_config.is_running){
        auto_div.querySelector('.auto-status').textContent = '⌛連線中';
        auto_div.querySelectorAll('[data-status="tobe-selected"]').forEach(li => {
            li.setAttribute('data-status', 'selected');
        });
        initWSS();
    } else {
        auto_div.querySelector('.auto-status').textContent = '🔘未運行';
        if(wss) {
            wss.close();
            wss = null;
        }
    }
    updateButtonVisibility();
};
var updateButtonVisibility = function(){
    if(auto_config.is_running){
        document.querySelector('.auto-start').style.display = 'none';
        document.querySelector('.auto-stop').style.display = 'inline-block';
        if(auto_div.querySelectorAll('li[data-status*="tobe-"]').length > 0){
            document.querySelector('.auto-update').style.display = 'inline-block';
            document.querySelector('.auto-discard').style.display = 'inline-block';
        } else {
            document.querySelector('.auto-update').style.display = 'none';
            document.querySelector('.auto-discard').style.display = 'none';
        }
    } else {
        document.querySelector('.auto-discard').style.display = 'none';
        document.querySelector('.auto-update').style.display = 'none';
        document.querySelector('.auto-start').style.display = 'inline-block';
        document.querySelector('.auto-stop').style.display = 'none';
    }
};
var getAutoConfig = function(){
    var new_auto_config = {
        is_running: false,
        time_list: [],
        event_code_list: []
    };
    document.querySelectorAll('.auto-time-list li[data-status="tobe-selected"],.auto-time-list li[data-status="selected"]').forEach(li => {
        new_auto_config.time_list.push(li.getAttribute('data-time'));
    });
    document.querySelectorAll('.auto-event-list li[data-status="tobe-selected"],.auto-event-list li[data-status="selected"]').forEach(li => {
        new_auto_config.event_code_list.push(li.getAttribute('data-event_code'));
    });
    return new_auto_config;
};
var event_code_list = [];
Object.keys(cache).forEach(event_code => {
    var item = cache[event_code];
    if(!item.is_today) return;
    event_code_list.push(event_code);
});
event_code_list.sort((a, b) => {
    return a.localeCompare(b);
});
event_code_list.forEach(event_code => {
    var item = cache[event_code];
    var li = document.createElement('li');
    li.textContent = i18n(item.event_name);
    li.setAttribute('data-event_code', event_code);
    auto_div.querySelector('.auto-event-list').appendChild(li);
});

// 添加搜尋功能
auto_div.querySelector('.auto-event-search').addEventListener('input', function(e) {
    var searchText = e.target.value.trim();
    var eventListItems = auto_div.querySelectorAll('.auto-event-list li');
    
    eventListItems.forEach(li => {
        li.classList.remove('auto-event-matched');
        var eventCode = li.getAttribute('data-event_code');
        var item = cache[eventCode];
        
        if (searchText === '') {
            // 如果搜尋內容為空，重置所有項目的 order
            li.style.order = '';
        } else {
            // 檢查 event_name 的任一個語系是否包含搜尋文字
            var found = false;
            if (item && item.event_name) {
                Object.values(item.event_name).forEach(name => {
                    if (name && name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
                        found = true;
                    }
                });
            }
            
            if (found) {
                li.classList.add('auto-event-matched');
            }
        }
    });
});
auto_div.addEventListener('click', function(e){
    if(e.target.matches('li')){
        switch(e.target.getAttribute('data-status')){
        case "tobe-selected":
            e.target.setAttribute('data-status', '');
            break;
        case "tobe-unselected":
            e.target.setAttribute('data-status', 'selected');
            break;
        case "selected":
            e.target.setAttribute('data-status', 'tobe-unselected');
            break;
        default:
            e.target.setAttribute('data-status', 'tobe-selected');
            break;
        }
        updateButtonVisibility();
    } else if(e.target.matches('.auto-start')){
        var new_auto_config = getAutoConfig();
        if(new_auto_config.time_list.length == 0 || new_auto_config.event_code_list.length == 0){
            alert('請至少選擇一個時間和一個場館');
            return;
        } else {
            new_auto_config.is_running = true;
            auto_status = setConfig('auto_status', autoConfigToAutoStatus(new_auto_config));
            auto_config = new_auto_config;
            updateAutoStatus();
        }
    } else if(e.target.matches('.auto-stop')){
        auto_config.is_running = false;
        auto_status = setConfig('auto_status', autoConfigToAutoStatus(auto_config));
        updateAutoStatus();
    } else if(e.target.matches('.auto-update')){
        var new_auto_config = getAutoConfig();
        if(new_auto_config.time_list.length == 0 || new_auto_config.event_code_list.length == 0){
            alert('請至少選擇一個時間和一個場館');
            return;
        } else {
            new_auto_config.is_running = true;
            auto_status = setConfig('auto_status', autoConfigToAutoStatus(new_auto_config));
            auto_config = new_auto_config;
            updateAutoStatus();
        }
    } else if(e.target.matches('.auto-discard')){
        auto_div.querySelectorAll('li[data-status="tobe-unselected"]').forEach(li => {
            li.setAttribute('data-status', 'selected');
        });
        auto_div.querySelectorAll('li[data-status="tobe-selected"]').forEach(li => {
            li.setAttribute('data-status', '');
        });
        document.querySelector('.auto-discard').style.display = 'none';
        updateButtonVisibility();
    }
});
updateAutoStatus();
