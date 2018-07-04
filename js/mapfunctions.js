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
    displayMarkers(this.parentNode.parentNode.id);
    $('#pac-input').hide();
    document.getElementById("sideOptions").classList.toggle('active');
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResultsOptions");
    }, 300);
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
var serviceMarkers = [];
var infoWindows = [];
var markers = [];
var mainMarker;
var userPosition = {};
var firstCircle = true;
var circle = {};

var ColorStack = function () {
    this.size = 5;
    this.storage = ["#27ae60", "#3498db", "#9b59b6", "#e67e22", "#e74c3c"];

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
    //Set Center on user's position
    function showPosition(position) {
        map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        mainMarker = (new google.maps.Marker({
            position: { lat: position.coords.latitude, lng: position.coords.longitude },
            map: map,
        }));
        userPosition.lat = position.coords.latitude;
        userPosition.lng = position.coords.longitude;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
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
        }
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
        }
    });

    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        document.getElementsByClassName('service')[i]
            .addEventListener('click', function () {
                if (this.getAttribute('data-selected') == 'false') {
                    addServiceMarkers(map, this, this.id);
                }
                else {
                    deleteServiceMarkers(this, this.id);
                }
            });
    }

    $('.range-slider__range').on("change", function () {
        drawCircles(map, userPosition, $(this).val());
    });

    function drawCircles(map, centerCoords, radius) {
        if (firstCircle) {
            circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: centerCoords,
                radius: parseFloat(radius)
            });
            firstCircle = false;
        } else {
            circle.setMap(null);
            circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: centerCoords,
                radius: parseFloat(radius)
            });
        }
    }
}

function addServiceMarkers(map, clss, id) {
    var path;

    switch (id) {
        case 'farmacie': path = 'geojson/farmaciePoint.json'; break;
        case 'centriAnziani': path = 'geojson/centri_anzianiPoint.json'; break;
        case 'ospedali': path = 'geojson/ospedaliMPoint.json'; break;
        case 'presidi': path = 'geojson/presidi.json'; break;
        case 'disabiliSociali': path = 'geojson/assist_disabili_socializzPoint.json'; break;
        case 'marginalita': path = 'geojson/marginalitaPoint.json'; break;
        case 'cimiteri': path = 'geojson/cimiteriPoint.json'; break;
        case 'riabilitazione': path = 'geojson/riabilitaz_exart26.json'; break;
        case 'anzianiNONauto': path = 'geojson/assist_anziani_non_autoPoint.json'; break;
        case 'anzianiAuto': path = 'geojson/assist_anziani_autoPoint.json'; break;
        case 'disabiliFisici': path = 'geojson/assist_disabili_fisiciPoint.json'; break;
        case 'dipendenze': path = 'geojson/dipendenzePoint.json'; break;
        case 'disabiliPsichici': path = 'geojson/assist_disabili_psichici.json'; break;
        case 'siast': path = 'geojson/siastPoint.json'; break;
        case 'saluteMentale': path = 'geojson/salute_mentale.json'; break;
        case 'assistMinori': path = 'geojson/minoriPoint.json'; break;
    }

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    var color = colorStack.pop();
    if (color == null) {
        return 1;
    }
    $("#" + id).css('background-color', color);
    $("#" + id).css('border-color', color);
    clss.setAttribute('data-selected', 'true');
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            var callback = JSON.parse(xobj.responseText);
            for (var place in callback.features) {
                var longitude = callback.features[place].geometry.coordinates[0];
                var latitude = callback.features[place].geometry.coordinates[1];
                serviceMarkers.push(new google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: map,
                    serviceID: id,
                    icon: pinSymbol(color)
                }));

                infoWindows.push(new google.maps.InfoWindow({
                    content: produceContent(callback.features[place].properties),
                    serviceID: id
                }));
                serviceMarkers[serviceMarkers.length - 1].addListener("click", function () {
                    var infowindow = infoWindows[serviceMarkers.indexOf(this)];

                    if (infowindow.map == null) {
                        infoWindows.forEach(function (info) {
                            info.setMap(null);
                        });
                        infowindow.open(map, this);
                    }
                    else {
                        infowindow.setMap(null);
                    }
                });
            }
        }
    };
    xobj.send();
}

function deleteServiceMarkers(clss, id) {
    var rgbColor = $("#" + id).css('backgroundColor');
    var hexColor = hexc(rgbColor);
    colorStack.push(hexColor);
    clss.setAttribute('data-selected', 'false');
    $("#" + id).css('background-color', "transparent");
    $("#" + id).css('border-color', "hsla(0, 0%, 100%, .43)");

    //Backward looping to avoid index skipping
    var i = serviceMarkers.length;
    while (i--) {
        if (serviceMarkers[i] != null && serviceMarkers[i].serviceID == id) {
            serviceMarkers[i].setMap(null);
            serviceMarkers.splice(i, 1);
        }
        if (infoWindows[i] != null && infoWindows[i].serviceID == id) {
            infoWindows[i].setMap(null);
            infoWindows.splice(i, 1);
        }
    }
}

function displayMarkers(id) {
    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        if (document.getElementsByClassName('service')[i].getAttribute('data-selected') == 'true')
            document.getElementsByClassName('service')[i].click();
    }

    if (document.getElementById(id).getAttribute('data-selected') == 'true') {
        document.getElementById(id).click();
    }
}

function produceContent(jsonProperties) {
    var result;
    result = "<h3>" + jsonProperties.DENOMINAZI + "</h3><br>"
    if (jsonProperties.hasOwnProperty('INDIRIZZO'))
        result += "<h5>Indirizzo: </h5>" + jsonProperties.INDIRIZZO + "<br>";
    if (jsonProperties.hasOwnProperty('VIA'))
        result += "<h5>Indirizzo: </h5>" + jsonProperties.VIA + ", " + jsonProperties.NCIVICO + "<br>";
    if (jsonProperties.hasOwnProperty('TIPOSTRUTT'))
        result += "<h5>Tipo struttura: </h5>" + jsonProperties.TIPOSTRUTT + "<br>";
    if (jsonProperties.hasOwnProperty('TIPOLOGIA'))
        result += "<h5>Tipologia: </h5>" + jsonProperties.TIPOLOGIA + "<br>";
    if (jsonProperties.hasOwnProperty('PRINCIPALI')){
        if (jsonProperties.PRINCIPALI != "")
            result += "<h5>Note: </h5>" + jsonProperties.PRINCIPALI + "<br>";
    }
    if (jsonProperties.hasOwnProperty('DATILOGIS')){
        if (jsonProperties.DATILOGIS != "")
            result += "<h5>Locali: </h5>" + jsonProperties.DATILOGIS + "<br>";
    }
    if (jsonProperties.hasOwnProperty('TELEF')) {
        if (jsonProperties.TELEF != 0 && jsonProperties.TELEF != null)
            result += "<h5>Telefono: </h5> 0" + jsonProperties.PREFTEL + " " + jsonProperties.TELEF + "<br>";
    }
    if (jsonProperties.hasOwnProperty('FAX')) {
        if (jsonProperties.FAX != 0 && jsonProperties.FAX != null)
            result += "<h5>FAX: </h5> 0" + jsonProperties.PREFFAX + " " + jsonProperties.FAX + "<br>";
    }
    if (jsonProperties.hasOwnProperty('WEBSITE')) {
        if (jsonProperties.WEBSITE != "")
            result += "<h5>Website: </h5>" + jsonProperties.WEBSITE + "<br>";
    }
    return result
}

function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#FFF',
        strokeWeight: 2,
        scale: 1,
    };
}

function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete (parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = '#' + parts.join('');
    return color;
}
