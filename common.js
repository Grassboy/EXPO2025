var getMMDD = function() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    //return MMDD format if less than 10
    if(month < 10) {
        month = '0' + month;
    }
    if(day < 10) {
        day = '0' + day;
    }
    return month + day;
};
var fetchJSONifNotInLocalStorage = async function(url, cache_key) {
    if(localStorage.getItem(cache_key)) {
        var json = JSON.parse(localStorage.getItem(cache_key));
        // 如果 json 的 _parse_time 是今天，則直接返回 json
        if(json._parse_time && json._parse_time != "2025-05-14 08:46:04" && new Date(json._parse_time).toString().substr(0,10) == new Date().toString().substr(0,10)) {
            return json;
        }
    }
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem(cache_key, JSON.stringify(data));
            return data;
        });
};

// default config managed by localStorage
var getConfig = function(key, default_value){
    return localStorage.getItem(key) || (localStorage.setItem(key, default_value) || default_value);
};
var setConfig = function(key, value){
    localStorage.setItem(key, value);
    return value;
};

var lang = getConfig('lang', 'zh-tw');
var i18n = function(text_json){
    if(text_json[lang]) {
        return text_json[lang];
    } else {
        if(lang == 'zh-tw' && text_json['zh-cn']) {
            return text_json['zh-cn'];
        } else {
            return text_json['en'] || text_json['ja'];
        }
    }
};