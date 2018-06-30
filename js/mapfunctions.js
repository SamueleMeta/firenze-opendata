// JQUERY FUNCTIONS
$('#pac-input').on("focus", function () {
    $('#searchIcon').attr("src", "img/green-searcher.png");
});

$('#pac-input').on("blur", function () {
    $('#searchIcon').attr("src", "img/searcher.png");
});

$('.service-info').on("click", function () {
    displayMarkers(this.parentNode.parentNode.id);
    $('#pac-input').hide();
    document.getElementById("sideOptions").classList.toggle('active');
});

$('#backIcon').on("click", function () {
    document.getElementById("sideOptions").classList.toggle('active');
    $('#pac-input').delay(290).show(0);
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

window.onclick = function(event) {
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
function initAutocomplete() {
    //Set Center on user's position
    function showPosition(position) {
        map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
        var marker = (new google.maps.Marker({
            position: { lat: position.coords.latitude, lng: position.coords.longitude },
            map: map,
        }));
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

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
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
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        document.getElementsByClassName('service')[i]
            .addEventListener('click', function () {
                if (this.getAttribute('data-selected') == 'false') {
                    $(this).css('background-color', '#8696ac')
                    this.setAttribute('data-selected', 'true');
                    addServiceMarkers(map, this.id);
                }
                else {
                    $(this).css('background-color', '#3c4c5b')
                    this.setAttribute('data-selected', 'false');
                    deleteServiceMarkers(this.id);
                }
            });
    }
}

function addServiceMarkers(map, id) {
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
        case 'siast': path = undefined; break;
        case 'saluteMentale': path = 'geojson/salute_mentale.json'; break;
        case 'assistMinori': path = 'geojson/minoriPoint.json'; break;
    }

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            var callback = JSON.parse(xobj.responseText);
            for (var place in callback.features) {
                var longitude = callback.features[place].geometry.coordinates[0];
                var latitude = callback.features[place].geometry.coordinates[1]
                serviceMarkers.push(new google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: map,
                    serviceID: id
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

function deleteServiceMarkers(id) {
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

function deleteServiceMarkers(id) {
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
    if (jsonProperties.hasOwnProperty('PRINCIPALI'))
        result += "<h5>Note: </h5>" + jsonProperties.PRINCIPALI + "<br>";
    if (jsonProperties.hasOwnProperty('DATILOGIS'))
        result += "<h5>Locali: </h5>" + jsonProperties.DATILOGIS + "<br>";
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