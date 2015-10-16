(function (Framework7, T7, $$, $) {
    var app = new Framework7();
    var mainView = app.addView('.view-main', {
        dynamicNavbar: true
    });

    T7.registerHelper('link', function (url, title, options){
        var ret = '<li>' +
                    '<a href="' + url + '" class="item-link item-content">' +
                      '<div class="item-inner">' +
                        '<div class="item-title">' + title + '</div>' +
                      '</div>' +
                     '</a>' +
                  '</li>';
        return ret;
    });

    var menuLinkTemplate = $$('#link-template').html();
    var compiledMenuLinkTemplate = T7.compile(menuLinkTemplate);

    var menuData = [{
        blocktitle: 'デバイス',
        url: '/devices.html',
        title: 'リスト'
    },{
        blocktitle: 'SensorTag',
        url: '/sensortag.html',
        title: '閾値設定'
    }];

    $$('#link-wrap').html(compiledMenuLinkTemplate(menuData))

    var sensorsTemplate = $$('#sensors-template').html();
    var compiledSensorsTemplate = T7.compile(sensorsTemplate);

    function buildDevice(device, i) {
        if (device.keyword === 'owner') {
            $$('#owner-uuid').text(device.uuid);
            $$('#owner-token').text(device.token);
        } else {
            $$('#'+device.keyword+'-uuid').text(device.uuid);
            $$('#'+device.keyword+'-token').text(device.token);
        }
    }

    var ipaddress;
    app.onPageInit('index', function (page) {
        var q = '/api/host/';
        $.getJSON(q, function(data) {
            ipaddress = data.ipaddress;
            $$('#ipaddress').text(ipaddress);
        });
    }).trigger();

    app.onPageInit('devices', function (page) {
        var q = '/api/devices/';
        $.getJSON(q, function(data) {
            data.forEach(buildDevice);
        });
    });

    var conn, trigger, action;

    var objectPoints;
    if (localStorage['object-temperature'])
        objectPoints = JSON.parse(localStorage['object-temperature']);
    else
        objectPoints = [];

    var ambientPoints = [];
    if (localStorage['ambient-temperature'])
        ambientPoints = JSON.parse(localStorage['ambient-temperature']);
    else
        ambientPoints = [];

    var pointsMax = 145;
    var tempSuffix = '℃';

    function unsubscribe() {
        if(conn){
            conn.unsubscribe({
                'uuid': action.uuid
            }, function (data) {
                meshbluStatus('UNSUBSCRIBED');
                console.log('unsubscribe: ', data);
            });
        }
    }

    function meetCriteria(criteria, temp, threshold) {
        if (criteria === 'over') {
            return (temp >= threshold);
        } else if (criteria === 'fewer') {
            return (temp <= threshold);
        } else {
            return false;
        }
    }

    function checkCriteria(criteria, value, threshold) {
        if (meetCriteria(criteria, value, threshold)) {
            $$('#object-temperature').css('color', 'red');
            app.addNotification({
                title: 'SensorTag閾値監視',
                message: '閾値を超えました。: '+value
            });
            conn.data({
                'uuid': trigger.uuid,
                'trigger': 'on'
            });
        }
    }

    function buildSensorList(id, value, points, suffix) {
        $$('#'+id).text(value+suffix);
        $$('#'+id).css('color', '#8e8e93');

        points.push(value);

        if (points.length > pointsMax)
            points.splice(0,1);

        $('#'+id+'-sparkline').sparkline(points, {
            type: 'line',
            width: points.length*2
        });

        localStorage[id] = JSON.stringify(points);
    }

    function onMessage(message) {
        if(!message.payload) return;

        buildSensorList('object-temperature',
                        message.payload.objctTemperature.toFixed(1),
                        objectPoints, tempSuffix);

        buildSensorList('ambient-temperature',
                        message.payload.ambientTemperature.toFixed(1),
                        ambientPoints, tempSuffix);

        var objectTemp = message.payload.objctTemperature.toFixed(1);

        if(thresholdForm().thresholdcheck[0]) {
            var formData = app.formToJSON('#threshold-form');
            checkCriteria(formData.criteria,
                          objectTemp,
                          parseFloat(formData.tempthreshold));
        }
    }

    function meshbluStatus(text) {
        $$('#meshblu-ready').html(text);
    }

    function subscribe() {
        conn = meshblu.createConnection({
            'uuid': trigger.uuid,
            'token': trigger.token,
            'server': ipaddress,
            'port': 80
        });

        conn.on('notReady', function(data){
            meshbluStatus('NOT READY!');
        });

        conn.on('ready', function(data){
            meshbluStatus('READY!');
            conn.subscribe({
                'uuid': action.uuid,
                'token': action.token
            }, function (data) {
                console.log(data);
            });
            conn.on('message', onMessage);
        });
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function meshbluForm() {
        return app.formToJSON('#meshblu-form');
    }

    function thresholdForm() {
        return app.formToJSON('#threshold-form');
    }

    function startSubscribe() {
        var formData = meshbluForm();
        var q = '/api/devices/';
        $.getJSON(q, function(data) {
            trigger = _.find(data,'keyword',
                             'trigger-'+formData.triggerno);
            action = _.find(data, 'keyword',
                            'action-'+formData.triggerno);
            subscribe();
        });
    }

    function validateThreshold(e) {
        if (!isNumber(thresholdForm().tempthreshold)) {
            e.preventDefault();
            app.alert('閾値を数値で入力してください。');
            return;
        }
    }

    app.onPageInit('sensortag', function (page) {
        var data = [{
            category: 'Temperature',
            sensors: [
                {
                 titleName: 'Object Temperature',
                 dataId: 'object-temperature',
                 sparkline: 'object-temperature-sparkline'
                },{
                 titleName: 'Ambient Temperature',
                 dataId: 'ambient-temperature',
                 sparkline: 'ambient-temperature-sparkline'
                }
            ]
        }];

        $$('#sensors-wrap').html(compiledSensorsTemplate(data))

        if(meshbluForm().meshblucheck[0]) startSubscribe();

        $$('#meshblu-enable').on('click', function(e) {
            var isChecked = meshbluForm().meshblucheck[0];
            if (isChecked) {
                unsubscribe();
            } else {
                startSubscribe();
            }
        });

        $$('#tempthreshold').on('blur', validateThreshold);
        $$('#threshold-enable').on('click', validateThreshold);
    });

    window.app = app;
}(Framework7, Template7, Dom7, jQuery);
