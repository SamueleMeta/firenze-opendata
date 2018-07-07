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

function addServiceMarkers(clss, id) {
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
            //showInRangeMarkers();
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

function showInRangeMarkers(){
    for(var i = 0; i < serviceMarkers.length; i++){
        var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(userPosition.lat, userPosition.lng), serviceMarkers[i].getPosition());
        if (serviceMarkers[i] != null && distance > circle.radius)
            serviceMarkers[i].setMap(null);
        if (serviceMarkers[i] != null && distance <= circle.radius)
            serviceMarkers[i].setMap(map);
    }
} 

function displayAdvancedSearch(id) {
    var rgbColor = $("#" + id).css('backgroundColor');
    var hexColor = hexc(rgbColor);
    colorStack.push(hexColor);
    circle.setOptions({
        fillColor: hexColor,
        strokeColor: hexColor
    });
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

function swipedetect(el, callback){
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 60, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface

    }, false)

    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
        }
        handleswipe(swipedir)
    }, false)
}