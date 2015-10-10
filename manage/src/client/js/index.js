(function (Framework7, $$) {
    var app = new Framework7();
    var $$ = Dom7;
    var mainView = app.addView('.view-main', {
        dynamicNavbar: true
    });

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
        $$.get(q, function(data) {
            data = JSON.parse(data);
            ipaddress = data.ipaddress;
            $$('#ipaddress').text(ipaddress);
        });
    }).trigger();

    app.onPageInit('devices', function (page) {
        var q = '/api/devices/';
        $$.get(q, function(data) {
            data = JSON.parse(data);
            data.forEach(buildDevice);
        });
    });

    function myThingsPubSub(trigger, action, threshold, criteria) {
        var conn = meshblu.createConnection({
            'uuid': trigger.uuid,
            'token': trigger.token,
            'server': ipaddress,
            'port': 80
        });

        conn.on('notReady', function(data){
            console.log('UUID FAILED AUTHENTICATION!');
        });

        conn.on('ready', function(data){
            console.log('READY!!');
            conn.subscribe({
                'uuid': action.uuid,
                'token': action.token
            }, function (data) {
                console.log(data);
            });

            var points = [];
            var points_max = 200;
            conn.on('message', function(message){
                var temp = message.payload.objctTemperature.toFixed(1);
                $$('#objct-temperature').text(temp+'℃');
                $$('#objct-temperature').css('color', '#8e8e93');
                points.push(temp);

                if (points.length > points_max)
                    points.splice(0,1);

                jQuery('#sparkline').sparkline(points, {
                    type: 'line',
                    width: points.length*2
                });

                if (meetCriteria(criteria, temp, threshold)) {
                    $$('#objct-temperature').css('color', 'red');

                    app.addNotification({
                        title: 'SensorTag閾値監視',
                        message: '閾値を超えました。: '+temp
                    });

                    conn.data({
                        'uuid': trigger.uuid,
                        'trigger': 'on'
                    });
                }
            });
        });
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

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    app.onPageInit('sensortag', function (page) {
        $$('#temp-enable').on('click', function(e) {
            var formData = app.formToJSON('#my-form');
            var isChecked = $$(this).find('input').prop('checked');
            if (!isChecked) {
                if (!isNumber(formData.tempthreshold)) {
                    e.preventDefault();
                    app.alert('閾値を数値で入力してください。');
                    return;
                }

                var q = '/api/devices/';
                $$.get(q, function(data) {
                    data = JSON.parse(data);
                    var trigger = _.find(data, 'keyword',
                                         'trigger-'+formData.triggerno);
                    var action = _.find(data, 'keyword',
                                          'action-'+formData.triggerno);
                    myThingsPubSub(trigger, action,
                                   parseFloat(formData.tempthreshold),
                                   formData.criteria);
                });
            }
        });
    });

    window.app = app;
}(Framework7, Dom7));
