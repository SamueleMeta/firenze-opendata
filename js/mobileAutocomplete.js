// JQUERY FUNCTIONS
$('#pac-input').on("focus", function () {
    $('.searchIcon').attr("src", "img/green-searcher.png");
    $('.resetIcon').attr("src", "img/green-close.png");
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
    }
    $(".alert").hide();
});

$('#pac-input').on("blur", function () {
    $('.searchIcon').attr("src", "img/searcher.png");
    $('.resetIcon').attr("src", "img/close.png");
});

$('#pac-input-options').on("focus", function () {
    $('.searchIcon').attr("src", "img/green-searcher.png");
    $('.resetIcon').attr("src", "img/green-close.png");
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
    }
    $(".alert").hide();
});

$('#pac-input-options').on("blur", function () {
    $('.searchIcon').attr("src", "img/searcher.png");
    $('.resetIcon').attr("src", "img/close.png");
});

$('#levels').on("click", function () {
    circle.setMap(null);
    circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
    circle.radius = Infinity;
    showInRangeMarkers();
    $(".range-slider__range").val(0);
    $(".range-slider__value").html("0");
    $('#pac-input').hide();
    document.getElementById("sideOptions").classList.toggle('active');
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResultsOptions");
    }, 300);
    if(this.classList.length == 1){
        var rgbColor = $("#" + this.classList[0]).css('backgroundColor');
        var hexColor = hexc(rgbColor);
        circle.setOptions({
            fillColor: hexColor,
            strokeColor: hexColor
        });
        populateOptions(this.classList[0]);
    }
    else{
        circle.setOptions({
            fillColor: '#65eb9bf2',
            strokeColor: '#65eb9bf2'
        });
    }
    addListenersToOptionsMenu();
});

$('#cancelIcon').on("click", function () {
    document.getElementById("sideOptions").classList.toggle('active');
    $("#pac-input-options").attr("placeholder", "Cerca sulla mappa");
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResults");
    }, 300);
    $('#pac-input').delay(290).show(0);
});

$('#pac-input').on("change", function () {
    this.placeholder = "Cerca sulla mappa...";
});

$('#resetIconDefault').on("click", function () {
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
    }
    document.getElementById('pac-input').value='';
    showDefaultLocation();
    map.setZoom(13);
    for(i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    for(i=0; i<serviceMarkers.length; i++){
        serviceMarkers[i].setMap(map);
    }
    circle.setCenter(new google.maps.LatLng(43.7792500, 11.2462600));
    circle.radius = Infinity;
    showInRangeMarkers();
    $(this).hide();
});

$('#pac-input-options').on("change", function () {
    this.placeholder = "Cerca sulla mappa...";
});

$('#resetIconOptions').on("click", function () {
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
    }
    document.getElementById('pac-input-options').value='';
    $(".range-slider__range").val(0);
    $(".range-slider__value").html("0");
    showDefaultLocation();
    for(i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    circle.setCenter(new google.maps.LatLng(43.7792500, 11.2462600));
    circle.setMap(null);
    circle.radius = Infinity;
    $(this).hide();
});

$('#backIcon').on("click", function () {
    $("#sidemenu").show();
    $("#mapWrapper").hide();
    /*var element = document.getElementById("levels");
    var rgbColor = $("#" + element.className).css('backgroundColor');
    var hexColor = hexc(rgbColor);
    colorStack.push(hexColor);
    $("#" + element.className).css('background-color', "transparent");
    $("#" + element.className).css('border-color', "hsla(0, 0%, 100%, .43)");
    element.setAttribute("data-selected", "false");
    deleteMarkers(element.className);*/
    circle.setMap(null);
    $("#pac-input-options").attr("placeholder", "Cerca sulla mappa");
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResults");
    }, 300);
    $('#pac-input').delay(290).show(0);
    $("#sideOptions .label").remove();
    $("#sideOptions .moreOptions").remove();
    $("#sideOptions .dropdown").remove();
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

$(".alert").on("click", function(){
    $(".alert").hide();
});

// MAP FUNCTIONS
var mapOptions = {
    center: { lat: 43.772330244, lng: 11.242165698 },
    zoom: 13,
    mapTypeId: 'roadmap',
    fullscreenControl: false,
    mapTypeControl: false,
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
var markersData = [];
var infoWindows = [];
var markers = [];
var mainMarker;
var userPosition = {};
var defaultPosition = true;
var circle = {};
var selected = 0;

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

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

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

            if (mainMarker !== undefined) {
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
        if (Object.keys(circle).length > 0) {
            circle.setMap(null);
            circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
            circle.radius = Infinity;
        }
        for(i=0; i<serviceMarkers.length; i++){
            serviceMarkers[i].setMap(map);
        }
        document.getElementById('pac-input-options').value='';
        $('#resetIconOptions').hide();
        $("#mapWrapper").show();
        $("#sidemenu").hide();
        $("#resetIconDefault").show();
        defaultPosition = false;
        $(".alert").hide();
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

            if (mainMarker !== undefined) {
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
        if (Object.keys(circle).length > 0) {
            circle.setMap(null);
            circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
            circle.radius = Infinity;
        }
        showInRangeMarkers();
        document.getElementById('pac-input').value='';
        $('#resetIconDefault').hide();
        $("#mapWrapper").show();
        document.getElementById("sideOptions").classList.toggle('active');
        $("#resetIconOptions").show();
        defaultPosition = false;
        $(".alert").hide();
    });

    //Initialize Circle
    circle = new google.maps.Circle({
        strokeColor: '#65eb9bf2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#65eb9bf2',
        fillOpacity: 0.35,
        map: map,
        center: new google.maps.LatLng(userPosition.lat, userPosition.lng),
        radius: Infinity
    });

    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        document.getElementsByClassName('service')[i]
            .addEventListener('click', function () {
                document.getElementById('levels').classList.toggle($(this).attr('id'));
                if (this.getAttribute('data-selected') == 'false') {
                    this.setAttribute("data-selected", "true");
                    $(".swipe").hide();
                    addServiceMarkers(this, this.id);
                    selected += 1;
                    $("#selectedServices").show();
                    $("#activeServices").html(selected);
                }
                else {
                    this.setAttribute("data-selected", "false");
                    deleteServiceMarkers(this, this.id);
                    selected -= 1;
                    $("#activeServices").html(selected);
                    if (selected < 1) {
                        $("#selectedServices").hide();
                        $(".swipe").show();
                    }
                }
            });
    }

    $('.range-slider__range').on("change", function () {
        circle.setMap(map);
        circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
        circle.radius = parseFloat($(this).val());
        showInRangeMarkers();
    });

    var farmacie = document.getElementById("farmacie");
    swipedetect(farmacie, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(farmacie, "farmacie", selected);
        }
    });

    var centriAnziani = document.getElementById("centriAnziani");
    swipedetect(centriAnziani, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(centriAnziani, "centriAnziani", selected);
        }
    });

    var anzianiAuto = document.getElementById("anzianiAuto");
    swipedetect(anzianiAuto, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(anzianiAuto, "anzianiAuto", selected);
        }
    });

    var disabiliFisici = document.getElementById("disabiliFisici");
    swipedetect(disabiliFisici, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(disabiliFisici, "disabiliFisici", selected);
        }
    });

    var cimiteri = document.getElementById("cimiteri");
    swipedetect(cimiteri, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(cimiteri, "cimiteri", selected);
        }
    });

    var siast = document.getElementById("siast");
    swipedetect(siast, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(siast, "siast", selected);
        }
    });

    var riabilitazione = document.getElementById("riabilitazione");
    swipedetect(riabilitazione, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(riabilitazione, "riabilitazione", selected);
        }
    });

    var presidi = document.getElementById("presidi");
    swipedetect(presidi, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(presidi, "presidi", selected);
        }
    });

    var disabiliPsichici = document.getElementById("disabiliPsichici");
    swipedetect(disabiliPsichici, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(disabiliPsichici, "disabiliPsichici", selected);
        }
    });

    var disabiliSociali = document.getElementById("disabiliSociali");
    swipedetect(disabiliSociali, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(disabiliSociali, "disabiliSociali", selected);
        }
    });

    var anzianiNONauto = document.getElementById("anzianiNONauto");
    swipedetect(anzianiNONauto, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(anzianiNONauto, "anzianiNONauto", selected);
        }
    });

    var dipendenze = document.getElementById("dipendenze");
    swipedetect(dipendenze, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(dipendenze, "dipendenze", selected);
        }
    });

    var marginalita = document.getElementById("marginalita");
    swipedetect(marginalita, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(marginalita, "marginalita", selected);
        }
    });

    var assistMinori = document.getElementById("assistMinori");
    swipedetect(assistMinori, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(assistMinori, "assistMinori", selected);
        }
    });

    var ospedali = document.getElementById("ospedali");
    swipedetect(ospedali, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(ospedali, "ospedali", selected);
        }
    });

    var saluteMentale = document.getElementById("saluteMentale");
    swipedetect(saluteMentale, function (swipedir) {
        if (swipedir == "left") {
            doSwipeLeft(saluteMentale, "saluteMentale", selected);
        }
    });
}