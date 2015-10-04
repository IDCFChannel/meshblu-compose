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
        }

        if (device.keyword === 'trigger-1') {
            $$('#trigger-1-uuid').text(device.uuid);
            $$('#trigger-1-token').text(device.token);
        }

        else if (device.keyword === 'action-1') {
            $$('#action-1-uuid').text(device.uuid);
            $$('#action-1-token').text(device.token);
        }
    }

    app.onPageInit('devices', function (page) {
        var q = '/api/devices/';
        app.showIndicator();
        $$.get(q, function(data) {
            app.hideIndicator();
            data = JSON.parse(data);
            data.forEach(buildDevice);
        });
    });
    window.app = app;
}(Framework7, Dom7));
