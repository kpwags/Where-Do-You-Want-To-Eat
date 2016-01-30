App = function() {
    var internal = {
        latitude: 0,
        longitude: 0,
        availableRestaurants: [],
        zipCodeField: null,
        zipCode: null,
        queryField: null,
        query: null,
        rangeField: null,
        range: 16093,

        getRestaurants: function() {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: internal.zipCode }, function(results_array, status) { 
                internal.latitude = results_array[0].geometry.location.lat();
                internal.longitude = results_array[0].geometry.location.lng();
            
                var loc = new google.maps.LatLng(internal.latitude, internal.longitude);

                var map = new google.maps.Map(document.getElementById('map'), {
                    center: loc,
                    zoom: 15
                });

                var queryString = 'restaurant,bar';

                if (internal.query.trim().length > 0) {
                    queryString = internal.query;
                }

                var request = {
                    location: loc,
                    radius: internal.range,
                    query: queryString,
                    openNow: true
                };            

                var service = new google.maps.places.PlacesService(map);
                service.textSearch(request, internal.processResults);
            });
        },

        processResults: function(results, status) {
            internal.availableRestaurants = [];

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                
                $.each(results, function(i, val) {
                    internal.availableRestaurants.push(val);
                });

                internal.chooseRestaurant();
            }
        },

        chooseRestaurant: function() {
            var randomizedIndex = Math.floor(Math.random() * internal.availableRestaurants.length);

            $('.result #place-name').text(internal.availableRestaurants[randomizedIndex].name);
            $('.result #place-address').text(internal.availableRestaurants[randomizedIndex].formatted_address);
            $('.result').show();
            $("html, body").animate({ scrollTop: 0 }, "fast");
        },

        chooseAgain: function() {
            var doRefresh = internal.isRefreshNeeded();

            if (doRefresh) {
                internal.zipCode = internal.zipCodeField.val();
                internal.query = internal.queryField.val();
                internal.range = internal.rangeField.val();

                internal.getRestaurants();
            } else {
                chooseRestaurant();
            }
        },

        getGeolocation: function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    $.ajax({
                        url: 'https://maps.googleapis.com/maps/api/geocode/json',
                        data: { latlng: pos.lat + ',' + pos.lng, sensor: false },
                        method: 'GET',
                        dataType: 'json'
                    })
                    .done(function( data ) {
                        if (data.status == "OK") {
                            var zipCode = data.results[0].address_components[7].short_name;
                            $('#zipcode').val(zipCode);
                        }
                    });

                    //https://maps.googleapis.com/maps/api/geocode/json?latlng=37.383253,-122.078075&sensor=false

                }, function() {
                    
                });
            }
        },

        isRefreshNeeded: function() {
            if (internal.zipCodeField.val() != internal.zipCode) {
                return true;
            }

            if (internal.queryField.val() != internal.query) {
                return true;
            }

            if (internal.rangeField.val() != internal.range) {
                return true;
            }
        }
    };

    var external = {
        
    };

    var initialize = function() {
        $(document).ready(function() {
            internal.getGeolocation();

            $('.go').click(function() {
                internal.zipCodeField = $('#zipcode');
                internal.queryField = $('#customquery');
                internal.rangeField = $('#range');

                internal.zipCode = internal.zipCodeField.val();
                internal.query = internal.queryField.val();
                internal.range = internal.rangeField.val();

                internal.getRestaurants();
            });

            $('.re-go').click(function() {
                internal.chooseAgain();
            });
        });
    }();

    return external;
}();