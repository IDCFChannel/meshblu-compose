(function (Framework7, $$) {
    var app = new Framework7();
    var $$ = Dom7;
    var mainView = app.addView('.view-main', {
        dynamicNavbar: true
    });

    var map, latLng, countryShortName, currencyCode;

    function googleMap(){
        showMap(latLng);
        addNearByPlaces(latLng);
        createMarker(latLng);
    }

    function showMap(latLng) {
        var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map_canvas'),
                                  mapOptions);
    }

    function addNearByPlaces(latLng) {
        var nearByService = new google.maps.places.PlacesService(map);
        var request = {
            location: latLng,
            radius: 1000,
            types: ['grocery_or_supermarket', 'department_store',
                    'shopping_mall']
        };
        nearByService.nearbySearch(request, handleNearBySearchResults);
    }

    function handleNearBySearchResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            $$.each(results, function(i, place) {
                createMarker(place.geometry.location, place);
            });
        }
    }

    function createMarker(latLng, placeResult) {
        var markerOptions = {
            position: latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            clickable: true
        };

        var content;

        if (placeResult) {
            content = placeResult.name+'<br/>'+placeResult.vicinity+'<br/>'+placeResult.types;
        } else {
            content = '現在値: ' + latLng.lat() + ', ' + latLng.lng();
            var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
            markerOptions['icon'] = iconBase + 'target.png';
        }

        var marker = new google.maps.Marker(markerOptions);
        addInfoWindow(marker, latLng, content);
    }

    function addInfoWindow(marker, latLng, content) {
        var infoWindowOptions = {
            content: content,
            position: latLng
        };

        var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(map);
        });
    }

    function buildRate(rate, i) {
        $$('#rate-'+i).text(rate.Rate+' '+currencyCode);
        var match = (rate.Time).match(/^(.+)(\w{2})$/);
        $$('#date-'+i).text(
            moment(new Date(rate.Date+' '+match[1]+' '+match[2] + ' GMT+0100')).format()
        );
    }

    function currencyRate() {
        var base_url = 'https://query.yahooapis.com/v1/public/yql';
        var query = 'select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20("'+'USD'+currencyCode+','+'EUR'+currencyCode+','+'JPY'+currencyCode+'")';
        var q = base_url + '?q=' + query + '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
        app.showIndicator();
        $$.get(q, function(data) {
            app.hideIndicator();
            data = JSON.parse(data);
            if (!data.query || !data.query.results) return;
            var rate = data.query.results.rate;
            console.log(rate);
            rate.forEach(buildRate);
        });
    }

    function getCountryNameCode(latLng, callback) {
        var geocoder = new google.maps.Geocoder();
        var retval = {};
        var location =  {lat: latLng.lat(), lng: latLng.lng()};

        geocoder.geocode({'location': location}, function(results, status) {
            if (status !== google.maps.GeocoderStatus.OK)
                return callback(new Error("can't get goecoder"));
            _.forEach(results[0].address_components, function (comp) {
                if (comp.types[0] == "country") {
                    retval['short'] = comp.short_name;
                    retval['long'] = comp.long_name;
                }
            });
            if (!retval)
                return callback(new Error("can't get country code"));
            else
                return callback(null, retval);
        });
    }

    $$('#location_btn').on('click', function () {
        if (navigator.geolocation) {
            app.showIndicator();

            //navigator.geolocation.watchPosition(
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    latLng = new google.maps.LatLng(position.coords.latitude,
                                                    position.coords.longitude);

                    // Azerbaijanfilm
                    //latLng = new google.maps.LatLng(40.406605,
                    //                                49.804306);

                    $$('#lat_lng').text(latLng.lat().toFixed(3) + ", " + latLng.lng().toFixed(3));
                    getCountryNameCode(latLng, function(err, res) {
                        app.hideIndicator();
                        if (err) {
                            app.alert(err.message);
                        } else {
                            countryShortName = res.short;
                            $$('#country_code').text(res.short);
                            $$('#country_name').text(res.long);
                            $$('#map_link').removeClass('disabled');
                            $$('#currency_link').removeClass('disabled');

                            var q = '/api/currency/' + countryShortName;
                            app.showIndicator();
                            $$.get(q, function(data) {
                                app.hideIndicator();
                                data = JSON.parse(data);
                                currencyCode = data.currency_code;
                                $$('#currency_code').text(currencyCode);
                            });
                        }
                    });
                },
                function(position) {
                    app.alert( "can't get position" );
                }
            );
        }
    });


    //app.onPageInit('index', function(page) {
    //}).trigger();

    app.onPageInit('map', function (page) {
        googleMap();
    });

    app.onPageInit('currency', function (page) {
        currencyRate();
    });

    window.app = app;
}(Framework7, Dom7));
