// JQUERY FUNCTIONS
$('#pac-input').on("focus", function () {
    $('.searchIcon').attr("src", "img/green-searcher.png");
});

$('#pac-input').on("blur", function () {
    $('.searchIcon').attr("src", "img/searcher.png");
});

$('#pac-input-options').on("focus", function () {
    $('.searchIcon').attr("src", "img/green-searcher.png");
});

$('#pac-input-options').on("blur", function () {
    $('.searchIcon').attr("src", "img/searcher.png");
});

$('.service-info').on("click", function () {
    //displayAdvancedSearch(this.parentNode.parentNode.id);
    circle.setMap(null);
    //circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
    circle.radius = Infinity;
    $(".range-slider__range").val(0);
    $(".range-slider__value").html("0");
    $('#pac-input').hide();
    document.getElementById("sideOptions").classList.toggle('active');
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResultsOptions");
    }, 300);
    displayAdvancedSearch(this.parentNode.parentNode.id);
});

$('#cancelIcon').on("click", function () {
    document.getElementById("sideOptions").classList.toggle('active');
    $("#pac-input-options").attr("placeholder", "Cerca sulla mappa");
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResults");
    }, 300);
    $('#pac-input').delay(290).show(0);
});

$('.dropdown-content #openingHour').on("click", function () {
    $("#opening").html($(this).html());
});

$('.dropdown-content #closingHour').on("click", function () {
    $("#closing").html($(this).html());
});

$('#comunale').on("click", function () {
    document.getElementById("comunale").classList.toggle('selected');
});

$('#nonComunale').on("click", function () {
    document.getElementById("nonComunale").classList.toggle('selected');
});

var rangeSlider = function () {
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
    slider.each(function () {
        value.each(function () {
            var value = $(this).prev().attr('value');
            $(this).html(value);
        });
        range.on('input', function () {
            $(this).next(value).html(this.value);
        });
    });
};

rangeSlider();

function showOpeningHour() {
    document.getElementById("openingDropdown").classList.toggle("show");
}

function showClosingHour() {
    document.getElementById("closingDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


// MAP FUNCTIONS
var mapOptions = {
    center: { lat: 43.772330244, lng: 11.242165698 },
    zoom: 13,
    mapTypeId: 'roadmap',
    styles: [
        {
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                },
                {
                    "lightness": 33
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#f2e5d4"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#c5dac6"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "lightness": 20
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "lightness": 20
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#c5c6c6"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e4d7c6"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#fbfaf7"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#acbcc9"
                }
            ]
        }
    ]
}
var map;
var serviceMarkers = [];
var infoWindows = [];
var markers = [];
var mainMarker;
var userPosition = {};
var firstCircle = true;
var circle = {};

var ColorStack = function () {
    this.size = 16;
    this.storage = ["#8D6E63", "#78909C", "#ccae62", "#0c2461", "#B53471", "#5C6BC0", "#1abc9c", "#fd79a8",
                    "#006266", "#d4a415", "#f3a683", "#27ae60", "#3498db", "#7E57C2", "#e74c3c", "#e67e22"];

    this.push = function (data) {
        this.storage[this.size] = data;
        this.size++;
    }

    this.pop = function () {
        if (this.size === 0) {
            return undefined;
        }
        this.size--;
        var removed = this.storage[this.size];
        delete this.storage[this.size];
        return removed;
    }
}

var colorStack = new ColorStack();

function initAutocomplete() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showUserPosition, showDefaultLocation);   
    }

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

    function calcRoute(directionsService, directionsDisplay) {
        var request = {
            origin: { lat: 43.772330244, lng: 11.242165698 },
            destination: { lat: 43.730703, lng: 11.150411 },
            travelMode: 'DRIVING'
        };
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {
                directionsDisplay.setDirections(result);
            }
        })
    };

    //calcRoute(directionsService, directionsDisplay);

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);

    setTimeout(function () {
        $(".pac-container").prependTo("#searchResults");
    }, 300);

    var inputOptions = document.getElementById('pac-input-options');
    var searchBoxOptions = new google.maps.places.SearchBox(inputOptions);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    map.addListener('bounds_changed', function () {
        searchBoxOptions.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if(mainMarker !== undefined){
                mainMarker.setMap(null);
            }
            userPosition.lat = place.geometry.location.lat();
            userPosition.lng = place.geometry.location.lng();

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        $(".range-slider__range").val(0);
        $(".range-slider__value").html("0");
        if(Object.keys(circle).length>0){
            circle.setMap(null);
            circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
            circle.radius = Infinity;
        }
        showInRangeMarkers();
    });

    searchBoxOptions.addListener('places_changed', function () {
        var places = searchBoxOptions.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if(mainMarker !== undefined){
                mainMarker.setMap(null);
            }
            userPosition.lat = place.geometry.location.lat();
            userPosition.lng = place.geometry.location.lng();

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        $(".range-slider__range").val(0);
        $(".range-slider__value").html("0");
        if(Object.keys(circle).length>0){
            circle.setMap(null);
            circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
            circle.radius = Infinity;
        }
        showInRangeMarkers();
    });
    
    //Initialize Circle
    circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: new google.maps.LatLng(userPosition.lat, userPosition.lng),
        radius: Infinity
    });

    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        document.getElementsByClassName('service')[i]
            .addEventListener('click', function () {
                if (this.getAttribute('data-selected') == 'false') {
                    this.setAttribute('data-selected', 'true');
                    addServiceMarkers(this, this.id);
                }
                else {
                    this.setAttribute('data-selected', 'false');
                    deleteServiceMarkers(this, this.id);
                }
            });
    }

    $('.range-slider__range').on("change", function () {
        circle.setMap(map);
        circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
        circle.radius = parseFloat($(this).val());
        showInRangeMarkers();
    });
}
