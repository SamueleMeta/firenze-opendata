// JQUERY FUNCTIONS
$('#pac-input').on("focus", function () {
    $('.searchIcon').attr("src", "img/green-searcher.png");
    $('.resetIcon').attr("src", "img/green-close.png");
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
        activeRoute = false;
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
        activeRoute = false;
    }
    $(".alert").hide();
});

$('#pac-input-options').on("blur", function () {
    $('.searchIcon').attr("src", "img/searcher.png");
    $('.resetIcon').attr("src", "img/close.png");
});

$('.service-info').on("click", function () {
    if($(window).width() > 767){
    $("#sideOptions").show();
    circle.setMap(null);
    circle.radius = Infinity;
    $(".range-slider__range").val(0);
    $(".range-slider__value").html("0");
    $('#pac-input').hide();
    document.getElementById("sideOptions").classList.toggle('active');
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResultsOptions");
    }, 300);
    populateOptions(this.parentNode.parentNode.id);
    addListenersToOptionsMenu();
    displayAdvancedSearch(this.parentNode.parentNode.id);
}
});

$('#cancelIcon').on("click", function () {
    if($(window).width() > 767){
    document.getElementById("sideOptions").classList.toggle('active');
    $("#pac-input-options").attr("placeholder", "Posizionati sulla mappa");
    setTimeout(function () {
        $(".pac-container").prependTo("#searchResults");
    }, 300);
    $('#pac-input').delay(290).show(0);
    $("#sideOptions .label").remove();
    $("#sideOptions .moreOptions").remove();
    $("#sideOptions .dropdown").remove();
    serviceMarkers.forEach(function(element){
        element.filtered = false;
    });
}
    //showInRangeMarkers();
});

$('#pac-input').on("change", function () {
    this.placeholder = "Posizionati sulla mappa...";
});

$('#resetIconDefault').on("click", function () {
    if($(window).width() > 767){
    $(".alert").hide();
    if($(".resetRoute").length > 0){
        $(".resetRoute").click();
        activeRoute = false;
    }
    activeResearch = false;
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
    circle.setMap(null)
    circle.radius = Infinity;
    $(this).hide();
}
});

$('#pac-input-options').on("change", function () {
    this.placeholder = "Posizionati sulla mappa...";
});

$('#resetIconOptions').on("click", function () {
    if($(window).width() > 767){
    document.getElementById('pac-input-options').value='';
    $(".range-slider__range").val(0);
    $(".range-slider__value").html("0");
    showDefaultLocation();
    for(i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    activeResearch = false;
    circle.setCenter(new google.maps.LatLng(43.7792500, 11.2462600));
    circle.setMap(null);
    circle.radius = Infinity;
    showInRangeMarkers();
    $(this).hide();
}
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

$(".alert").on("click", function(){
    $(".alert").hide();
});

for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
    document.getElementsByClassName('service')[i]
        .addEventListener('click', function () {
            if($(window).width() > 767){
            if (this.getAttribute('data-selected') == 'false') {
                this.setAttribute('data-selected', 'true');
                addServiceMarkers(this, this.id);
                selected += 1;
                $("#levels").addClass(this.id);
            }
            else {
                this.setAttribute('data-selected', 'false');
                deleteServiceMarkers(this, this.id);
                selected -= 1;
                $("#levels").removeClass();
            }
        }
        });
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
var markersData = [];
var infoWindows = [];
var markers = [];
var mainMarker;
var userPosition = {};
var circle = {};
var defaultPosition = true;

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

    $('.range-slider__range').on("change", function () {
        circle.setMap(map);
        circle.setCenter(new google.maps.LatLng(userPosition.lat, userPosition.lng));
        circle.radius = parseFloat($(this).val());
        showInRangeMarkers();
    });
}