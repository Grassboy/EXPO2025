// 載入 cache.js
let cache = {};
let pavilion = {};
let rank = {};
localStorage.cache_time = getConfig('cache_time', (new Date()).getTime());

//綁定 onmessage 事件 
var support_events = {
    getScript: function(json) {
        var script = document.createElement('script');
        script.src = json.url;
        document.head.appendChild(script);
    }
};
var toParent = function(json){
    window.parent.postMessage(JSON.stringify(json), '*');
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
        console.error('onmessage 事件錯誤', e);
    }
});

//{ NEED_PERMISSION start
var attachRankClass = function(rank_id) {
    if(rank[rank_id]) {
        return ' rank' + rank[rank_id].level;
    } else {
        return '';
    }
};
var checkAdditionalInfo = function(rank_id) {
    //TODO: 檢查是否有額外的資訊
};
var attachRankItem = function(rank_id, summary) {
    checkAdditionalInfo(rank_id);
    var item = rank[rank_id];
    var level_map = {
        rank6: '超超猛',
        rank5: '超猛',
        rank4: '用心',
        rank3: '普通',
        rank2: '未參觀',
        rank1: '可..可以別去'
    };
    
    if(item) {
        // 創建評分區域的 div
        const rankArea = document.createElement('div');
        rankArea.className = 'rank-area';
        rankArea.innerHTML = 
            (level_map['rank'+item.level] && `<span class="rank rank${item.level}">${level_map['rank'+item.level]}</span>`) +
            (item.creative_rate && `<span class="creative">創意 ${item.creative_rate} ★</span>` || '') +
            (item.tech_rate && `<span class="tech">科技 ${item.tech_rate} ★</span>` || '') +
            (item.passion_rate && `<span class="passion">熱情 ${item.passion_rate} ★</span>` || '') +
            (item.comment && `<blockquote>${item.comment}${(item.food || item.gift) && '<br>' || ''}${item.gift || ''} ${item.food && '🍽️有餐廳' || ''}</blockquote>`) + 
            `<em><img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" style="width: auto; height: 12px; vertical-align: middle;"/> <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2iOPhoVcIdiR4fha8-YV0zbFeKJHwXBD97_FqSuSUdWrLm82dUnsmtvZpxY4qQpe0UYTXMCbhFMaK/pubhtml?fbclid=IwY2xjawJ2nuJleHRuA2FlbQIxMABicmlkETFESUlkSWt0dWFZNzUzUUFLAR6AegBApEHvz8N76TT7bg-AdbbMuXpi9S0MTgardWOyHlDxJiFa_XJf20tVYg_aem_EHqJW0lUFvytpd1KdWWAQA" target="_blank">評價協力：Sophy Lin.</a></em>
        `;
        
        // 將評分區域插入到 summary 元素的最前面
        summary.insertBefore(rankArea, summary.firstChild);
        
        return rank[rank_id].level;
    } else {
        return '';
    }
};

var attachRank = function() {
    // 建立左下角的版權資訊，並移除預設的 attribution
    var attribution = L.control.attribution({
        position: 'bottomleft',
        prefix: '' // 移除預設的 attribution
    }).addTo(map);
    // 添加技術協力文字與連結
    attribution.addAttribution('<img src="https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico" style="width: auto; height: 12px; vertical-align: middle;"/> <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2iOPhoVcIdiR4fha8-YV0zbFeKJHwXBD97_FqSuSUdWrLm82dUnsmtvZpxY4qQpe0UYTXMCbhFMaK/pubhtml?fbclid=IwY2xjawJ2nuJleHRuA2FlbQIxMABicmlkETFESUlkSWt0dWFZNzUzUUFLAR6AegBApEHvz8N76TT7bg-AdbbMuXpi9S0MTgardWOyHlDxJiFa_XJf20tVYg_aem_EHqJW0lUFvytpd1KdWWAQA" target="_blank">場館評價協力：Sophy Lin.</a>');
    var attribution2 = L.control.attribution({
        position: 'bottomleft',
        prefix: '' // 移除預設的 attribution
    }).addTo(map); 
    attribution2.addAttribution('EXPO2025 大阪萬博地圖 by <a href="https://github.com/Grassboy/EXPO2025" target="_blank"><img src="https://github.githubassets.com/favicons/favicon.png" style="width: auto; height: 12px; vertical-align: middle;"/>小胖子 Grassboy</a>');
};

//}NEED_PERMISSION end


// 從 localStorage 恢復地圖狀態
const savedCenter = localStorage.getItem('mapCenter');
const savedZoom = localStorage.getItem('mapZoom');
var isChairmanVisible = JSON.parse(getConfig('isChairmanVisible', '"false"'));
var isPavilionVisible = JSON.parse(getConfig('isPavilionVisible', '"true"'));
var isMarkerVisible = JSON.parse(getConfig('isMarkerVisible', '"true"'));
var markerGroup, chairmanMarkerGroup, pavilionMarkerGroup;
var view = [[34.64961709870932, 135.38326621055606], 16];
if (savedCenter && savedZoom) {
    const center = JSON.parse(savedCenter);
    view = [center, parseFloat(savedZoom)];
}
// 初始化主地圖
const map = L.map('map', {
    maxZoom: 24,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    center: view[0],
    zoom: view[1]
});
const markers = [];
const chairmanMarkers = [];
const pavilionMarkers = [];
// 保存地圖狀態到 localStorage
map.on('moveend zoomend', () => {
    localStorage.setItem('mapCenter', JSON.stringify(map.getCenter()));
    localStorage.setItem('mapZoom', map.getZoom());
});

// Set up the OSM layer
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19, // OSM max available zoom is at 19.
      maxZoom: 24 // Match the map maxZoom, or leave map.options.maxZoom undefined.
    }).addTo(map);

// 設定圖片路徑與圖片對應的地理範圍
const imageUrl = 'https://www.expovisitors.expo2025.or.jp/_nuxt/illust-map-en.81cee7da.webp';
const imageBounds = [
    [34.642367209, 135.372827911],  // 南緯、西經
    [34.658401515, 135.394178298]   // 北緯、東經
];

// 新增圖片圖層
var imageOverlay = L.imageOverlay(imageUrl, imageBounds, {
    opacity: 0.5,
}).addTo(map);
// 等圖層加到地圖上後加 CSS
imageOverlay.getElement().style.maskImage = 'radial-gradient(closest-side, rgb(0, 0, 0) 90%, rgba(0, 0, 0, 0))';


// 添加定位控制
L.control.locate({
    position: 'bottomright',
    icon: 'fa-solid fa-location-crosshairs',
    strings: {
        title: "取得目前位置"
    }
}).addTo(map);

var AddPopupControl = function(icon, key, sticky){
    var ControlInstance = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            if(sticky) {
                container.style.marginBottom = '0';
            }
            var link = L.DomUtil.create('a', key+'-control-button', container);
            link.href = '#';
            //link.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            link.innerHTML = '<i class="' + icon + '"></i>';
            L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', function() {
                    document.body.setAttribute('data-popup-target1', 'popup_'+key);
                    setTimeout(() => {
                        document.body.setAttribute('data-popup-target2', 'popup_'+key);
                    }, 100);
                });
            return container;
        }
    });

    var control_instance = new ControlInstance();
    control_instance.addTo(map);
    return control_instance;
};
var LayersControl = function(icon, key, markerGroup, sticky){
    return L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            if(sticky) {
                container.style.marginBottom = '0';
            }
            var link = L.DomUtil.create('a', 'custom-control-button', container);
            link.href = '#';
            link.innerHTML = '<i class="' + icon + '"></i>';
            link.setAttribute('data-for', key);

            L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', function() {
                    var now_visible = JSON.parse(getConfig(key));
                    now_visible = !now_visible;
                    setConfig(key, now_visible);
                    if (now_visible) {
                        markerGroup.addTo(map);
                        link.classList.add('active');
                    } else {
                        markerGroup.remove();
                        link.classList.remove('active');
                    }
                });
            if(JSON.parse(getConfig(key))) {
                link.classList.add('active');
            }

            return container;   
        }
    });

}
var langs = {
    'zh-tw': '🇹🇼',
    'en': '🇺🇸',
    'ja': '🇯🇵', 
    'fr': '🇫🇷',
    'ko': '🇰🇷',
    'zh-cn': '🇨🇳'
};
var langs_keys = Object.keys(langs);
var generateArc = function(deg) {
    const radius = 30;
    const rad = (deg * Math.PI) / 180;
    const x = radius * Math.sin(rad);
    const y = -radius * Math.cos(rad);
    const x2 = radius * Math.sin(2 * Math.PI);
    const y2 = -radius * Math.cos(2 * Math.PI);
    const largeArcFlag = deg > 180 ? 1 : 0;
    const path = `M 0 -30 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}`;
    const path2 = `M 0 -30 A ${radius} ${radius} 0 1 1 ${x2} ${y2}`;
    const svg = `url('data:image/svg+xml;base64,`+ btoa(`<svg width="80" height="80" viewBox="-45 -45 90 90" xmlns="http://www.w3.org/2000/svg"><path d="${path2}" fill="none" stroke="#FFFFFFAA" stroke-width="1" stroke-linecap="round" /><path d="${path}" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round" /></svg>`)+`')`;
    return svg;
}
// 語系切換控制項
var LanguageControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control language-control');
        var link = L.DomUtil.create('a', 'language-control-button', container);
        link.style.fontSize = '24px';
        link.href = '#';
        link.innerHTML = langs[lang];
        
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function() {
                langs_keys.forEach((l, i) => {
                    if(l == lang) {
                        setConfig('lang', langs_keys[(i + 1) % langs_keys.length]);
                    }
                });
                lang = getConfig('lang');
                link.innerHTML = langs[lang];
            });
        
        return container;
    }
});
var ReloadControl = L.Control.extend({
    options: {
        position: 'topright'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var link = L.DomUtil.create('a', 'reload-control-button', container);
        link.href = '#';
        link.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function() {
                if(confirm('您將清空您裝置上的快取並重新載入頁面，確定要繼續嗎？')) {
                    setConfig('cache_time', (new Date()).getTime());
                    delete localStorage.cache;
                    delete localStorage.pavilion;
                    delete localStorage.rank;
                    window.location.reload();
                }
            });
        return container;
    }
});

var previous_marker, previous_marker_icon, previous_marker_is_search_matches;
var now_marker, now_item;
map.whenReady(async () => {
    if (window.self !== window.top) {
        map.getContainer().classList.add('in-iframe');
    }
    if(map.getZoom() > 18) {
        map.getContainer().classList.add('zoom-in');
    }
    cache = await fetchJSONifNotInLocalStorage('event_cache/cache.json?v='+getMMDD()+localStorage.cache_time, 'cache');
    pavilion = await fetchJSONifNotInLocalStorage('event_cache/pavilion.json?v='+getMMDD()+localStorage.cache_time, 'pavilion');
    //NEED_PERMISSION
    rank = await fetchJSONifNotInLocalStorage('event_cache/rank.Sophy.json?v='+getMMDD()+localStorage.cache_time, 'rank');

    //console.log('地圖載入完成，開始添加標記點');
    let row = 0;
    let col = 0;
    const markersPerRow = 15;
    const latStep = 0.001 / markersPerRow;
    const lngStep = 0.01 / markersPerRow;
    
    const startLat = 34.64491;
    const startLng = 135.379093;
    var setSelectedMarker = function(marker, item, h3_text, code_text, summary_text) {
        now_marker = marker;
        now_item = item;
        if(previous_marker) {
            previous_marker.setIcon(previous_marker_icon);
            if(previous_marker_is_search_matches) {
                previous_marker.getElement() && previous_marker.getElement().classList.add('search-matches');
            }
        }
        //console.log('click', marker);
        previous_marker = marker;
        previous_marker_icon = marker.getIcon();
        previous_marker_is_search_matches = marker.getElement().classList.contains('search-matches');
        const popup = document.getElementById('popup');
        const h3 = popup.querySelector('.popup-title');
        const code = popup.querySelector('.code');
        const cost_time = popup.querySelector('.cost-time');
        const summary = popup.querySelector('.summary');
        
        h3.textContent = h3_text;
        code.textContent = code_text;
        summary.textContent = summary_text;
        cost_time.textContent = item.cost_time ? '🕒' + item.cost_time + '分' : '';
        attachRankItem(code_text.split('-')[0], summary);
        document.body.setAttribute('data-popup-target1', 'popup');
        setTimeout(() => {
            document.body.setAttribute('data-popup-target2', 'popup');
        }, 100);
    };
    document.querySelector('.popup-title').addEventListener('click', function() {
        //複製 popup-title 的內容
        navigator.clipboard.writeText(this.textContent);
    });
    var oms_options = {
        circleSpiralSwitchover: 0,
        keepSpiderfied: true,
        spiralFootSeparation: 60, // 增加展開後彼此的間距，預設約 28
        spiralLengthStart: 40,    // 展開第一段長度
        spiralLengthFactor: 6     // 每個 marker 往外擴張的倍數
    };
    var oms_map = {
        'C05': new OverlappingMarkerSpiderfier(map, oms_options),
        'S09': new OverlappingMarkerSpiderfier(map, oms_options),
        'C23': new OverlappingMarkerSpiderfier(map, oms_options),
        'S01': new OverlappingMarkerSpiderfier(map, oms_options),
        'S14': new OverlappingMarkerSpiderfier(map, oms_options),
        'P29': new OverlappingMarkerSpiderfier(map, oms_options),
        'P03': new OverlappingMarkerSpiderfier(map, oms_options),
    };
    for (var k in pavilion) {
        if(k.startsWith('_')) {
            continue;
        }
        var oms = null;
        let item = pavilion[k];
        if(
            k.startsWith('C05-') ||
            k.startsWith('C23-') ||
            k.startsWith('S01-') ||
            k.startsWith('S14-') ||
            k.startsWith('P29-') ||
            k.startsWith('P03-') ||
            k.startsWith('S09-')
        ) {
            oms = oms_map[k.split('-')[0]];
        }
        let time_class = item.cost_time ? ' time'+(item.cost_time>60?60:Math.ceil(item.cost_time/5)*5) : '';
        let rank_class = attachRankClass(item.id.split('-')[0]); //NEED_PERMISSION
        let marker = L.marker([item.lat, item.lng], {
            icon: L.divIcon({
                className: 'pavilion-marker' + time_class + rank_class,
                html: '<div title="' + i18n(item.name) + '" class="marker-inner"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        });
        marker.on('click', (e) => {
            if(e.originalEvent) { 
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
            setSelectedMarker(marker, item, i18n(item.name), item.id, i18n(item.summary));
            marker.getElement().classList.add('active-pavilion');
            time_class && marker.getElement().classList.add(time_class.substr(1));
        });
        marker._pavilion_id = item.id;
        if(oms) {
            oms.addMarker(marker);
        }
        pavilionMarkers.push(marker);
    }

    //console.log('cache 內容：', cache);
    for (var k in cache) {
        if(k.startsWith('_')) {
            continue;
        } 
        let item = cache[k];
        let lat, lng;
        if(!item.is_today) {
            continue;
        }

        if (item.lat && item.lng) {
            lat = item.lat;
            lng = item.lng;
        } else {
            lat = startLat - (row * latStep);
            lng = startLng + (col * lngStep);
            col++;
            if (col >= markersPerRow) {
                col = 0;
                row++;
            }
        }
        let time_class = item.cost_time ? ' time'+(item.cost_time>60?60:Math.ceil(item.cost_time/5)*5) : '';
        let rank_class = attachRankClass(item.event_code); //NEED_PERMISSION
        let marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: (
                            item.chairman ? 'wheelchair-marker' : 
                            (item.lat && item.lng ? 'default-marker' : 'gray-marker')
                           ) + time_class + rank_class,
                html: '<div title="' + (item.short_name || i18n(item.event_name)) + '" class="marker-inner"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                title: i18n(item.event_name)
            })
        })
        .on('click', (e) => {
            if(e.originalEvent) { 
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
            setSelectedMarker(marker, item, i18n(item.event_name), item.event_code, i18n(item.event_summary));
            marker.getElement().classList.add('active-event');
            time_class && marker.getElement().classList.add(time_class.substr(1));
        });

        marker._event_code = item.event_code; // 添加 event_code 到 marker 上

        if (item.chairman) {
            chairmanMarkers.push(marker);
        } else {
            markers.push(marker);
            //console.log('添加標記點：', i18n(item.event_name));
        }
    }

    // 將所有標記點添加到地圖上
    chairmanMarkerGroup = L.layerGroup(chairmanMarkers);
    var ChairmanControl = LayersControl('fa-brands fa-accessible-icon', 'isChairmanVisible', chairmanMarkerGroup, false);
    var chairmanControl = new ChairmanControl();
    chairmanControl.addTo(map);
    if(isChairmanVisible) {
        chairmanMarkerGroup.addTo(map);
    }

    markerGroup = L.layerGroup(markers);
    var MarkerControl = LayersControl('fa-regular fa-calendar-plus', 'isMarkerVisible', markerGroup, true);
    var markerControl = new MarkerControl();
    markerControl.addTo(map);
    if(isMarkerVisible) {
        markerGroup.addTo(map);
    }
    
    pavilionMarkerGroup = L.layerGroup(pavilionMarkers);
    var PavilionControl = LayersControl('fa-solid fa-landmark-flag', 'isPavilionVisible', pavilionMarkerGroup, true);
    var pavilionControl = new PavilionControl();
    pavilionControl.addTo(map);
    if(isPavilionVisible) {
        pavilionMarkerGroup.addTo(map);
    }


    // 添加語系切換控制項
    var languageControl = new LanguageControl();
    languageControl.addTo(map);

    var reloadControl = new ReloadControl();
    reloadControl.addTo(map);

    attachRank();
    if (window.self !== window.top) {
        toParent({op: 'ping'});
    }
});


// 設定地圖範圍
const bounds = L.latLngBounds(
    L.latLng(34.63384350785518, 135.36490917205813), // 西南角
    L.latLng(34.668617333175455, 135.40863990783694) // 東北角
);

// 只限制主地圖範圍，允許所有互動
map.setMaxBounds(bounds);

// 點擊地圖其他地方時關閉彈出視窗
map.on('click', (newEvent) => {
    if(newEvent.originalEvent && now_marker && newEvent.originalEvent.altKey) {
        const newLat = newEvent.latlng.lat;
        const newLng = newEvent.latlng.lng;
        
        // 移動 marker 到新位置
        now_marker.setLatLng([newLat, newLng]);
        var item = cache[now_item.event_code];
        // 更新 cache 中的經緯度資訊
        item.lat = newLat;
        item.lng = newLng;
        
        // 將標記點設為藍色
        now_marker.setIcon(L.divIcon({
            className: item.chairman ? 'wheelchair-marker' : 'default-marker',
            html: '<div title="' + i18n(item.event_name) + '" class="marker-inner"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }));
        
        //console.log('已更新位置：', i18n(item.event_name), newLat, newLng);
        newEvent.originalEvent.preventDefault();
        newEvent.originalEvent.stopPropagation();
    } else {
        if(previous_marker) {
            previous_marker.setIcon(previous_marker_icon);
            if(previous_marker_is_search_matches) {
                previous_marker.getElement() && previous_marker.getElement().classList.add('search-matches');
            }
        }
        document.body.setAttribute('data-popup-target1', '');
        setTimeout(() => {
            document.body.setAttribute('data-popup-target2', '');
        }, 100);
    }
});
document.body.addEventListener('click', (e) => {
    if(e.target.parentNode.classList.contains('close-popup')) {
        map.fire('click');
    }
});
map.on('zoomend', () => {
    var zoom = map.getZoom();
    if(zoom > 18) {
        map.getContainer().classList.add('zoom-in');
    } else {
        map.getContainer().classList.remove('zoom-in');
    }
});
//一段 style tag 並插入到 head 中
var prev_style = document.getElementById('tmpstyle');
if(prev_style) {
    prev_style.remove();
}
var style = document.createElement('style');
style.id = 'tmpstyle';
style.innerHTML = `
    .search-control-box {
        display: flex;
        align-items: center;
    }
`;

// 自訂搜尋控制項
var MAGIC_SEARCH_TERM = '台灣';
var magicSearch = async function() {
    alert('提醒您，世博沒有台灣館，但地圖作者是台灣人，還是幫你搜一下XD');
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};
var magicSearchCheck = function(item) {
    return item.id == 'W02-01' || item.event_code == 'HSH0';
}
var focusOnMarker = function(marker) {
    marker.fire('click');
    var bounds = marker.getLatLng().toBounds(100);
    map.fitBounds(bounds, {
        animate: false, 
        maxZoom: 20,
        paddingTopLeft: [0, -100]
    });
};
var SearchControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control search-control');
        var searchBox = L.DomUtil.create('input', 'search-box', container);
        searchBox.type = 'text';
        searchBox.placeholder = '搜尋...';
        var searchControl = L.DomUtil.create('div', 'search-control-box', container);
        searchControl.innerHTML = '<span class="now-search-index">1</span>/<span class="total-search-index">12</span> '+
                                '<i class="fa-solid fa-chevron-left search-prev"></i>'+
                                '<i class="fa-solid fa-chevron-right search-next"></i>'+
                                '<i class="fa-solid fa-xmark search-close"></i>';
        var matchesMarkers, now_search_term, now_search_index, searchBounds;
        var search_next = searchControl.querySelector('.search-next');
        var search_prev = searchControl.querySelector('.search-prev');
        var clearSearch = function() {
            now_search_index = 0;
            now_search_term = null;
            searchBounds = null;
            container.classList.remove('active');
            document.querySelectorAll('.search-matches').forEach(m => {
                m.classList.remove('search-matches');
            });
        }
        search_next.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            if(now_search_index == matchesMarkers.length) return;
            if(now_search_index < matchesMarkers.length) {
                now_search_index++;
                searchControl.querySelector('.now-search-index').innerHTML = now_search_index;
                focusOnMarker(matchesMarkers[now_search_index - 1]);
                search_prev.classList.remove('disabled');
                if(now_search_index == matchesMarkers.length) {
                    search_next.classList.add('disabled');
                }
            }
        });
        search_prev.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            if(now_search_index == 0) return;
            if(now_search_index > 0) {
                now_search_index--;
                search_next.classList.remove('disabled');
                searchControl.querySelector('.now-search-index').innerHTML = now_search_index;
                if(now_search_index > 0) {
                    focusOnMarker(matchesMarkers[now_search_index - 1]);
                } else {
                    map.fitBounds(searchBounds, {animate: false, maxZoom: 20});
                    search_prev.classList.add('disabled');
                    map.fire('click');
                }
            }
        });
        searchControl.querySelector('.search-close').addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            clearSearch();
            searchBox.select();
        });
        L.DomEvent
            .on(searchBox, 'mousedown', L.DomEvent.stopPropagation)
            .on(searchBox, 'click', L.DomEvent.stopPropagation)
            .on(searchBox, 'click', L.DomEvent.preventDefault)
            .on(searchBox, 'keypress', L.DomEvent.stopPropagation)
            .on(searchBox, 'keypress', async function(e) {
                if (e.key === 'Esc') {
                    clearSearch();
                } else if (e.key === 'Enter') {
                    e.stopPropagation();
                    e.preventDefault();
                    if(now_search_term === searchBox.value) {
                        if(e.shiftKey) {
                            search_prev.click();
                        } else {
                            search_next.click();
                        }
                        return;
                    }
                    clearSearch();
                    if(!searchBox.value) {
                        return;
                    }
                    if(MAGIC_SEARCH_TERM == searchBox.value) {
                        if(!await magicSearch()) return;
                    }
                    now_search_term = searchBox.value;
                    var to_search_markers = [...markers, ...chairmanMarkers, ...pavilionMarkers];
                    matchesMarkers = [];
                    to_search_markers.forEach(marker => {
                        var item = cache[marker._event_code] || pavilion[marker._pavilion_id];
                        var matched = false;
                        var marker_element = marker.getElement();
                        if(!marker_element) {
                            return;
                        }
                        if(MAGIC_SEARCH_TERM == searchBox.value) {
                            if(magicSearchCheck(item)) {
                                marker_element.classList.add('search-matches');
                                matched = true;
                            }
                        } else {
                            ['event_name', 'event_summary', 'name', 'summary'].forEach(k => {
                                if(item[k]) {
                                    if(typeof item[k] == 'string') {
                                        if(item[k].toLowerCase().includes(searchBox.value.toLowerCase())) {
                                            marker_element.classList.add('search-matches');
                                            matched = true;
                                        }
                                    } else if(typeof item[k] == 'object') {
                                        langs_keys.forEach(l => {
                                            if(item[k][l] && item[k][l].toLowerCase().includes(searchBox.value.toLowerCase())) {
                                                marker_element.classList.add('search-matches');
                                                matched = true;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        
                        // 如果有符合搜尋條件,將座標加入 bounds
                        if(matched) {
                            if(!searchBounds) {
                                searchBounds = L.latLngBounds();
                            }
                            searchBounds.extend(marker.getLatLng());
                            matchesMarkers.push(marker);
                        }
                    });
                    if(searchBounds) {
                        container.classList.add('active');
                        now_search_index = 0;
                        searchControl.querySelector('.now-search-index').innerHTML = 0;
                        searchControl.querySelector('.total-search-index').innerHTML = matchesMarkers.length;
                        map.fitBounds(searchBounds, {animate: false, maxZoom: 20});
                        map.fire('click');
                        search_next.classList.remove('disabled');
                        search_prev.classList.add('disabled');
                    } else {
                        container.classList.add('active');
                        searchControl.querySelector('.now-search-index').innerHTML = 0;
                        searchControl.querySelector('.total-search-index').innerHTML = 0;
                        search_next.classList.add('disabled');
                        search_prev.classList.add('disabled');
                        map.fire('click');
                    }
                }
            });

        return container;
    }
});

// 創建並添加搜尋控制項到地圖
var searchControl = new SearchControl();
searchControl.addTo(map);

// 幫助控制項
var helperControl = AddPopupControl('fa-solid fa-circle-question', 'helper', false);

function alertMsg(txt) {
    // 移除已存在的 alert-msg
    const existingAlert = document.querySelector('.alert-msg');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 創建新的 alert-msg
    const alert = document.createElement('div');
    alert.className = 'alert-msg';
    alert.textContent = txt;
    document.body.appendChild(alert);

    // 強制重繪
    alert.offsetHeight;

    // 添加 show 類別來觸發動畫
    alert.classList.add('show');

    // 5秒後移除
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 300); // 等待動畫結束
    }, 5000);
} 