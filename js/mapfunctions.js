var selected = 0;
var activeRoute = false;
var activeResearch = false;

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
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            var callback = JSON.parse(xobj.responseText);
            markersData.push(callback);
            for (var place in callback.features) {
                var longitude = callback.features[place].geometry.coordinates[0];
                var latitude = callback.features[place].geometry.coordinates[1];
                var placeMarker = new google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map: map,
                    serviceID: id,
                    filters: 0,
                    icon: pinSymbol(color)
                })

                google.maps.event.addListener(placeMarker, 'click', function () {
                    $("#infoCloseButton").parent().fadeIn();
                })

                serviceMarkers.push(placeMarker);

                infoWindows.push(new google.maps.InfoWindow({
                    content: produceContent(callback, place),
                    maxWidth: screen.width * 0.8,
                    serviceID: id
                }));

                var directionsService = new google.maps.DirectionsService();
                var directionsDisplay = new google.maps.DirectionsRenderer({
                    suppressMarkers: true
                });

                serviceMarkers[serviceMarkers.length - 1].addListener("click", function () {
                    var infowindow = infoWindows[serviceMarkers.indexOf(this)];

                    if (infowindow.map == null) {
                        infoWindows.forEach(function (info) {
                            info.setMap(null);
                        });
                        infowindow.open(map, this);

                        var sibling = document.getElementsByClassName("gm-style-iw")[0].nextSibling;
                        sibling.className = "infoClose";
                        $(".gm-style-iw").after("<div id='infoCloseButton'></div>");

                        $("#infoCloseButton").on("click", function () {
                            $(this).parent().fadeOut();
                            $(".alert").hide();
                        });

                        for (var i = 0; i < document.getElementsByClassName('car').length; i++) {
                            document.getElementsByClassName('car')[i]
                                .addEventListener('click', function () {
                                    directionsDisplay.setMap(map);
                                    if (defaultPosition) {
                                        showErrorAlert();
                                        return;
                                    }
                                    var origin = new google.maps.LatLng(userPosition.lat, userPosition.lng);
                                    var destination = new google.maps.LatLng(infowindow.getPosition().lat(), infowindow.getPosition().lng());
                                    activeRoute = true;
                                    calcRoute(directionsService, directionsDisplay, origin, destination, 'DRIVING');
                                });
                        }

                        for (var i = 0; i < document.getElementsByClassName('walker').length; i++) {
                            document.getElementsByClassName('walker')[i]
                                .addEventListener('click', function () {
                                    directionsDisplay.setMap(map);
                                    if (defaultPosition) {
                                        showErrorAlert();
                                        return;
                                    }
                                    var origin = new google.maps.LatLng(userPosition.lat, userPosition.lng);
                                    var destination = new google.maps.LatLng(infowindow.getPosition().lat(), infowindow.getPosition().lng());
                                    activeRoute = true;
                                    calcRoute(directionsService, directionsDisplay, origin, destination, 'WALKING');
                                });
                        }
                        for (var i = 0; i < document.getElementsByClassName('autobus').length; i++) {
                            document.getElementsByClassName('autobus')[i]
                                .addEventListener('click', function () {
                                    directionsDisplay.setMap(map);
                                    if (defaultPosition) {
                                        showErrorAlert();
                                        return;
                                    }
                                    var origin = new google.maps.LatLng(userPosition.lat, userPosition.lng);
                                    var destination = new google.maps.LatLng(infowindow.getPosition().lat(), infowindow.getPosition().lng());
                                    activeRoute = true;
                                    calcRoute(directionsService, directionsDisplay, origin, destination, 'TRANSIT');
                                });
                        }

                        for (var i = 0; i < document.getElementsByClassName('resetRoute').length; i++) {
                            document.getElementsByClassName('resetRoute')[i]
                                .addEventListener('click', function () {
                                    directionsDisplay.setDirections({ routes: [] });
                                    infowindow.setMap(null);
                                });
                        }

                        var el = document.getElementsByClassName('gm-style-iw')[0].nextSibling;
                        el.addEventListener("click", function () {
                            $(".alert").hide();
                        })
                    }
                });
            }
            //showInRangeMarkers();
        }
    };
    xobj.send();
}

function deleteServiceMarkers(clss, id) {
    handleColor(clss, id);
    deleteMarkers(id);
}

function handleColor(clss, id) {
    var rgbColor = $("#" + id).css('backgroundColor');
    var hexColor = hexc(rgbColor);
    colorStack.push(hexColor);
    clss.setAttribute('data-selected', 'false');
    $("#" + id).css('background-color', "transparent");
    $("#" + id).css('border-color', "hsla(0, 0%, 100%, .43)");
}

function deleteMarkers(id) {
    //Backward looping to avoid index skipping
    var i = serviceMarkers.length;
    var j = markersData.length;
    var resetCircle = false;

    for (var k = 0; k < document.getElementsByClassName('resetRoute').length; k++) {
        if (document.getElementsByClassName('resetRoute')[k].getAttribute('id') == id)
            document.getElementsByClassName('resetRoute')[k].click()
    }

    while (i--) {
        if (serviceMarkers[i] != null && serviceMarkers[i].serviceID == id) {
            if (circle.radius < Infinity &&
                (serviceMarkers[i].icon.fillColor == circle.fillColor || 
                    circle.fillColor == '#65eb9bf2'))
                resetCircle = true
            serviceMarkers[i].setMap(null);
            serviceMarkers.splice(i, 1);
        }
        if (infoWindows[i] != null && infoWindows[i].serviceID == id) {
            infoWindows[i].setMap(null);
            infoWindows.splice(i, 1);
        }
    }
    while (j--) {
        if (markersData[j].id == id)
            markersData.splice(j, 1);
    }
    if (resetCircle) {
        circle.setMap(null);
        circle.radius = Infinity;
        $(".range-slider__range").val(0);
        $(".range-slider__value").html("0");
    }


}

function showInRangeMarkers() {
    if ($(".resetRoute").length > 0)
        $(".resetRoute").click();
    for (var i = 0; i < serviceMarkers.length; i++) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(userPosition.lat, userPosition.lng), serviceMarkers[i].getPosition());
        if (serviceMarkers[i] != null && (serviceMarkers[i].filters < 0 || distance > circle.radius)) {
            serviceMarkers[i].setMap(null);
        }
        if (serviceMarkers[i] != null && (serviceMarkers[i].filters == 0 && distance <= circle.radius))
            serviceMarkers[i].setMap(map);
    }
}

function displayAdvancedSearch(id) {
    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        if (document.getElementsByClassName('service')[i].getAttribute('data-selected') == 'true') {
            if (document.getElementsByClassName('service')[i].id != id)
                document.getElementsByClassName('service')[i].click();
        }
    }

    if (document.getElementById(id).getAttribute('data-selected') == 'true') {
        setTimeout(function () {
            document.getElementById(id).click();
        }, 400);
    }

    setTimeout(function () {
        var rgbColor = $("#" + id).css('backgroundColor');
        var hexColor = hexc(rgbColor);
        circle.setOptions({
            fillColor: hexColor,
            strokeColor: hexColor
        });
    }, 1000);
}

function produceContent(callback, place) {
    jsonProperties = callback.features[place].properties
    var result;
    result = "<h3>" + jsonProperties.DENOMINAZI + "</h3>"
    if (jsonProperties.hasOwnProperty('INDIRIZZO'))
        result += "<h5>Indirizzo: </h5>" + jsonProperties.INDIRIZZO + "<br>";
    if (jsonProperties.hasOwnProperty('VIA'))
        result += "<h5>Indirizzo: </h5>" + jsonProperties.VIA + ", " + jsonProperties.NCIVICO + "<br>";
    if (jsonProperties.hasOwnProperty('TIPOSTRUTT'))
        result += "<h5>Tipo struttura: </h5>" + jsonProperties.TIPOSTRUTT + "<br>";
    if (jsonProperties.hasOwnProperty('TIPOLOGIA')) {
        if (jsonProperties.TIPOLOGIA != "")
            result += "<h5>Tipologia: </h5>" + jsonProperties.TIPOLOGIA + "<br>";
    }
    if (jsonProperties.hasOwnProperty('PRINCIPALI')) {
        if (jsonProperties.PRINCIPALI != "")
            result += "<h5>Note: </h5>" + jsonProperties.PRINCIPALI + "<br>";
    }
    if (jsonProperties.hasOwnProperty('ORARIO_APE')) {
        if (jsonProperties.ORARIO_APE != "")
            result += "<h5>Orario di apertura: </h5>" + jsonProperties.ORARIO_APE + "<br>";
    }
    if (jsonProperties.hasOwnProperty('DATILOGIS')) {
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
    result += '<h5>Indicazioni Stradali</h5><div class="routeAlternatives"><img src="img/car.png" alt="Auto" class="car"><img src="img/walk.png" alt="Pedone" class="walker"><img src="img/bus.png" alt="Autobus" class="autobus"></div>\
               <button class="resetRoute" id="' + callback.id + '">Cancella itinerario</button>';
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

function swipedetect(el, callback) {
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
        handleswipe = callback || function (swipedir) { }

    touchsurface.addEventListener('touchstart', function (e) {
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface

    }, false)

    touchsurface.addEventListener('touchend', function (e) {
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime) { // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
                swipedir = (distX < 0) ? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
        }
        handleswipe(swipedir)
    }, false)
}

function doSwipeLeft(serviceElement, serviceName) {
    if ($(window).width() < 767) {
        if (selected < 1) {
            selected++;
            $("#activeServices").html(selected);
            $("#mapWrapper").show();
            $("#sidemenu").hide();
            $("#selectedServices").show();
            //populateOptions(serviceName);
            $(".swipe").hide();
            $("#levels").removeClass();
            $("#levels").addClass(serviceName);
            triggerService(serviceElement);
            serviceElement.setAttribute("data-selected", "true");
        }
    }
}

function triggerService(service) {
    if (service.getAttribute('data-selected') == 'false') {
        addServiceMarkers(service, service.id);
    }
}

function populateOptions(id) {
    switch (id) {
        case 'farmacie':
            document.getElementById("advancedService").innerHTML = "Farmacie";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="Comunale">
                <li class="optionItem" id="comunale">
                    <div>Comunale</div>
                </li>
                <li class="optionItem lastItem" id="NONcomunale">
                    <div>Non Comunale</div>
                </li>
            </ul>`);
            break;
        case 'centriAnziani':
            document.getElementById("advancedService").innerHTML = "Centri Anziani";
            $("#sideOptions").append(`
            <h5 class="label">Proprietà</h5>
            <ul class="moreOptions" id="proprieta">
                <li class="optionItem" id="comune">
                    <div>Comune</div>
                </li>
                <li class="optionItem" id="ASP">
                    <div>ASP</div>
                </li>
                <li class="optionItem lastItem" id="ATER">
                    <div>ATER</div>
                </li>
            </ul>
            <h5 class="label">Quota</h5>
            <ul class="moreOptions"id="quota">
                <li class="optionItem" id="0">
                    <div>0€</div>
                </li>
                <li class="optionItem" id="5">
                    <div>5€</div>
                </li>
                <li class="optionItem" id="8">
                    <div>8€</div>
                </li>
                <li class="optionItem lastItem" id="10">
                    <div>10€</div>
                </li>
            </ul>
            <h5 class="label">Iscrizione</h5>
                <ul class="moreOptions" id="iscrizione">
                    <li class="optionItem" id="si">
                        <div>Sì</div>
                    </li>
                    <li class="optionItem lastItem" id="no">
                        <div>No</div>
                    </li>
                </ul>
            <h5 class="label">Statuto</h5>
                <ul class="moreOptions" id="statuto">
                    <li class="optionItem" id="Si">
                        <div>Sì</div>
                    </li>
                    <li class="optionItem lastItem" id="No">
                        <div>No</div>
                    </li>
                </ul>    
        `);
            break;
        case 'ospedali':
            document.getElementById("advancedService").innerHTML = "Ospedali";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia">
                <li class="optionItem" id="casaDiCura">
                    <div>Casa Di Cura</div>
                </li>
                <li class="optionItem" id="ospedalePubblico">
                    <div>Ospdale Pubblico</div>
                </li>
                <li class="optionItem" id="URP">
                    <div>URP</div>
                </li>
                <li class="optionItem lastItem" id="azienda">
                    <div>Azienda Ospedaliera</div>
                </li>
            </ul>
            `);
            break;
        case 'presidi':
            document.getElementById("advancedService").innerHTML = "Presidi ASL";
            break;
        case 'disabiliSociali':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Disabili Sociali";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia2">
                <li class="optionItem" id="residenza">
                    <div>Residenza</div>
                </li>
                <li class="optionItem lastItem" id="diurno">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            `);
            break;
        case 'marginalita':
            document.getElementById("advancedService").innerHTML = "Centri Inclusione Sociale";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia Struttura</h5>
            <ul class="moreOptions" id="struttura">
                <li class="optionItem" id="residenzaDonne">
                    <div>Residenziale Donne</div>
                </li>
                <li class="optionItem" id="residenzaUomini">
                    <div>Residenziale Uomini</div>
                </li>
                <li class="optionItem" id="MSNA">
                    <div>Residenziale MSNA</div>
                </li>
                <li class="optionItem" id="appartamenti">
                    <div>Appartamenti</div>
                </li>
                <li class="optionItem" id="campoNomadi">
                    <div>Campo Nomadi</div>
                </li>
                <li class="optionItem" id="mensa">
                    <div>Mensa</div>
                </li>
                <li class="optionItem lastItem" id="centroDiurno">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia3">
                <li class="optionItem" id="nomadi">
                    <div>Nomadi</div>
                </li>
                <li class="optionItem" id="detenuti">
                    <div>(Ex) Detenuti</div>
                </li>
                <li class="optionItem" id="rifugiati">
                    <div>Rifugiati</div>
                </li>
                <li class="optionItem" id="senza fissa">
                    <div>Senza Fissa Dimora</div>
                </li>
                <li class="optionItem lastItem" id="immigrati">
                    <div>Immigrati</div>
                </li>
            </ul>
            `);
            break;
        case 'cimiteri':
            document.getElementById("advancedService").innerHTML = "Cimiteri";
            break;
        case 'riabilitazione':
            document.getElementById("advancedService").innerHTML = "Centri Riabilitazione";
            break;
        case 'anzianiNONauto':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Anziani Non Autosufficienti";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia4">
                <li class="optionItem" id="Residenza">
                    <div>Residenza</div>
                </li>
                <li class="optionItem lastItem" id="CentroDiurno">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions" id="gestione">
                <li class="optionItem" id="privata">
                    <div>Privata</div>
                </li>
                <li class="optionItem" id="convenzionata">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem" id="diretta">
                    <div>Diretta ASL</div>
                </li>
            </ul>
            `);
            break;
        case 'anzianiAuto':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Anziani Autosufficienti";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia5">
                <li class="optionItem" id="resid.">
                    <div>Residenza</div>
                </li>
                <li class="optionItem" id="Diurno">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem lastItem" id="comunita">
                    <div>Comunità</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions" id="gestione2">
                <li class="optionItem" id="pubblica">
                    <div>Pubblica</div>
                </li>
                <li class="optionItem" id="privata">
                    <div>Privata</div>
                </li>
                <li class="optionItem" id="convenzionata">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem" id="diretta">
                    <div>Diretta</div>
                </li>
            </ul>
            `);
            break;
        case 'disabiliFisici':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Disabili Fisici";
            break;
        case 'dipendenze':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Dipendenze";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia6">
                <li class="optionItem" id="res">
                    <div>Residenza</div>
                </li>
                <li class="optionItem" id="centroD">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem" id="orientamento">
                    <div>Centro Di Orientamento</div>
                </li>
                <li class="optionItem" id="socializzazione">
                    <div>Centro Di Socializzazione</div>
                </li>
                <li class="optionItem lastItem" id="ambulatorio">
                    <div>Ambulatorio</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions" id="gestione3">
                <li class="optionItem" id="diretta">
                    <div>Diretta</div>
                </li>
                <li class="optionItem lastItem" id="convenzionata">
                    <div>Convenzionata</div>
                </li>
            </ul>
            `);
            break;
        case 'disabiliPsichici':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Disabili Psichici";
            $("#sideOptions").append(`
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions" id="gestione4">
                <li class="optionItem" id="convenzionata">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem" id="fuoriConvenzione">
                    <div>Fuori Convenzione</div>
                </li>
            </ul>
            `);
            break;
        case 'siast':
            document.getElementById("advancedService").innerHTML = "Siast";
            break;
        case 'saluteMentale':
            document.getElementById("advancedService").innerHTML = "Centri Salute Mentale";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions" id="tipologia7">
                <li class="optionItem" id="Ambulatorio">
                    <div>Ambulatorio</div>
                </li>
                <li class="optionItem" id="cDiurno">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem lastItem" id="Res">
                    <div>Residenza</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions" id="gestione5">
                <li class="optionItem" id="diretta">
                    <div>Diretta</div>
                </li>
                <li class="optionItem" id="privata">
                    <div>Privata</div>
                </li>
                <li class="optionItem lastItem" id="convenzionata">
                    <div>Convenzionata</div>
                </li>
            </ul>
            `);
            break;
        case 'assistMinori':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Minori";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia Struttura</h5>
            <ul class="moreOptions" id="struttura3">
                <li class="optionItem" id="CDiurno">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem" id="casaFamiglia">
                    <div>Casa Famiglia</div>
                </li>
                <li class="optionItem" id="appartamentiMinori">
                    <div>Appartamenti Per Minori</div>
                </li>
                <li class="optionItem" id="madreFiglio">
                    <div>Madre con figlio</div>
                </li>
                <li class="optionItem" id="Comunita">
                    <div>Comunità</div>
                </li>
                <li class="optionItem" id="18-21">
                    <div>Giovani 18-21</div>
                </li>
                <li class="optionItem" id="accoglimento">
                    <div>Centro Pronto Accoglimento</div>
                </li>
                <li class="optionItem lastItem" id="convitto">
                    <div>Semiconvitto</div>
                </li>
            </ul>
            `);
            break;
    }
}

function addListenersToOptionsMenu() {
    for (var i = 0; i < document.getElementsByClassName('optionItem').length; i++) {
        document.getElementsByClassName('optionItem')[i]
            .addEventListener('click', function () {
                var parent = $(this).parent().attr('id')
                var thisID = $(this).attr('id')

                $('#' + parent + ' > .optionItem').each(function () {
                    if ($(this).is('.selected') && $(this).attr('id') != thisID) {
                        $(this).toggleClass('selected');
                        typeFilter(this.id, $(this).is('.selected'));
                    }
                })

                $(this).toggleClass('selected');
                typeFilter(this.id, $(this).is('.selected'));
            });
    }

    for (var i = 0; i < document.getElementsByClassName('openingHour').length; i++) {
        document.getElementsByClassName('openingHour')[i]
            .addEventListener('click', function () {
                $("#opening").html($(this).html());
            });
    }

    for (var i = 0; i < document.getElementsByClassName('closingHour').length; i++) {
        document.getElementsByClassName('closingHour')[i]
            .addEventListener('click', function () {
                $("#closing").html($(this).html());
            });
    }
}

function typeFilter(id, selectedService) {
    var string;
    var type = 'TIPOLOGIA';
    switch (id) {
        //TIPOLOGIA

        //OSPEDALI
        case 'casaDiCura': string = 'Case di cura'; break;
        case 'ospedalePubblico': string = 'Ospedale Pubblico'; break;
        case 'URP': string = 'URP'; break;
        case 'azienda': string = 'Azienda Ospedaliera'; break;
        //CENTRI ASSISTENZIALI DISABILI SOCIALI
        case 'residenza': string = 'Residenza'; break;
        case 'diurno': string = 'Centro diurno'; break;
        //CENTRI INCLUSIONE SOCIALE
        case 'nomadi': string = 'Nomadi'; break;
        case 'detenuti': string = 'Detenuti'; break;
        case 'senza fissa': string = 'Senza fissa'; break;
        case 'rifugiati': string = 'rifugiati'; break;
        case 'immigrati': string = 'Immigrati'; break;
        //CENTRI ANZIANI NON AUTOSUFF.
        case 'Residenza': string = 'Residenza'; break;
        case 'CentroDiurno': string = 'Centro Diurno'; break;
        //CENTRI ANZIANI AUTOSUFF
        case 'resid.': string = 'Residenza'; break;
        case 'Diurno': string = 'Centro Diurno'; break;
        case 'comunita': string = 'Comunit'; break;
        //CENTRI ASSITENZIALI DIPENDENZE
        case 'res': string = 'Residenza'; break;
        case 'centroD': string = 'Centro Diurno'; break;
        case 'orientamento': string = 'orientamento'; break;
        case 'socializzazione': string = 'socializzazione'; break;
        case 'ambulatorio': string = 'Ambulatorio'; break;
        //CENTRI SALUTE MENTALE
        case 'Res': string = 'Residenza'; break;
        case 'cDiurno': string = 'Diurno'; break;
        case 'Ambulatorio': string = 'Ambulatorio'; break;

        //TIPOLOGIA STRUTTURA
        default: type = 'TIPOSTRUTT';
            switch (id) {
                //CENTRI INCLUSIONE SOCIALE
                case 'residenzaDonne': string = 'donne'; break;
                case 'residenzaUomini': string = 'uomini'; break;
                case 'MSNA': string = 'MSNA'; break;
                case 'appartamenti': string = 'Appartamenti'; break;
                case 'campoNomadi': string = 'nomadi'; break;
                case 'mensa': string = 'mensa'; break;
                case 'centroDiurno': string = 'diurno'; break;
                //CENTRI ASSISTENZIALI MINORI
                case 'CDiurno': string = 'Diurno'; break;
                case 'casaFamiglia': string = 'casa famiglia'; break;
                case 'appartamentiMinori': string = 'appartament'; break;
                case 'madreFiglio': string = 'madre'; break;
                case 'Comunita': string = 'comunit'; break;
                case '18-21': string = '18/21'; break;
                case 'accoglimento': string = 'accoglimento'; break;
                case 'convitto': string = 'convitto'; break;

                //GESTIONE
                default: type = 'GESTIONE';
                    switch (id) {
                        //CENTRI ANZIANI
                        case 'comune': string = 'Comune'; break;
                        case 'ASP': string = 'Asp'; break;
                        case 'ATER': string = 'ATER'; break;
                        //CENTRI ASSISTENZIALI (NON) AUTOSUFF. + DIPENDENZE + PSICHICI
                        case 'privata': string = 'Privat'; break;
                        case 'pubblica': string = 'Pubblico'; break;
                        case 'convenzionata': string = 'Convenzionata'; break;
                        case 'fuoriConvenzione': string = 'Fuori'; break;
                        case 'diretta': string = 'Diretta'; break;
                        //FARMACIE
                        case 'comunale': string = 'COMUNALE'; break;
                        case 'NONcomunale': string = 'Non'; break;

                        //QUOTA
                        default: type = 'QUOTA_ASSO';
                            switch (id) {
                                case '0': string = ' 0,00'; break;
                                case '5': string = '5,00'; break;
                                case '8': string = '8,00'; break;
                                case '10': string = '10,00'; break;

                                //ISCRIZIONE
                                default: type = 'ISCRIZIONE';
                                    switch (id) {
                                        case 'si': string = 'si'; break;
                                        case 'no': string = 'no'; break;
                                        //STATUTO
                                        default: type = 'STATUTO';
                                            switch (id) {
                                                case 'Si': string = 'si'; break;
                                                case 'No': string = 'no'; break;

                                            }
                                    }
                            }


                    }

            }

    }

    var property;
    for (var place in markersData[0].features) {
        switch (type) {
            case 'TIPOLOGIA': property = markersData[0].features[place].properties.TIPOLOGIA; break;
            case 'TIPOSTRUTT': property = markersData[0].features[place].properties.TIPOSTRUTT; break;
            case 'GESTIONE': property = markersData[0].features[place].properties.GESTIONE; break;
            case 'QUOTA_ASSO': property = markersData[0].features[place].properties.QUOTA_ASSO; break;
            case 'ISCRIZIONE': property = markersData[0].features[place].properties.ISCRIZIONE; break;
            case 'STATUTO': property = markersData[0].features[place].properties.STATUTO; break;
        }
        if (markersData[0].features[place].properties.hasOwnProperty(type) && property.indexOf(string) < 0) {
            for (marker in serviceMarkers) {
                if (markersData[0].features[place].geometry.coordinates[1].toFixed(9) == serviceMarkers[marker].getPosition().lat().toFixed(9) &&
                    markersData[0].features[place].geometry.coordinates[0].toFixed(9) == serviceMarkers[marker].getPosition().lng().toFixed(9)) {
                    if (selectedService) {
                        serviceMarkers[marker].filters--;
                    }
                    else {
                        serviceMarkers[marker].filters++;
                    }
                    break;
                }
            }
        }
    }
    showInRangeMarkers();
}

function calcRoute(directionsService, directionsDisplay, origin, destination, mode) {
    var request = {
        origin: origin,
        destination: destination,
        travelMode: mode
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    })
};

function showErrorAlert() {
    $(".alert").css('display', 'table');
}

//Set Center on user's position
function showUserPosition(position) {
    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    mainMarker = (new google.maps.Marker({
        position: { lat: position.coords.latitude, lng: position.coords.longitude },
        map: map,
    }));
    userPosition.lat = position.coords.latitude;
    userPosition.lng = position.coords.longitude;
    defaultPosition = false;
}

function showDefaultLocation() {
    //Default Location: Florence's town center
    map.setCenter(new google.maps.LatLng(43.7792500, 11.2462600));
    mainMarker = (new google.maps.Marker({
        position: { lat: 43.7792500, lng: 11.2462600 },
        map: null,
    }));
    userPosition.lat = 43.7792500;
    userPosition.lng = 11.2462600;
    defaultPosition = true;
}

$(window).resize(function () {
    if ($(window).width() > 767) {
        $("#selectedServices").hide();
        $("#levels").hide();
        $("#mapWrapper").show();
        $("#sidemenu").show();
        if (selected > 1) {
            $("#sideOptions").show();
            circle.setMap(null);
            for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
                if (document.getElementsByClassName('service')[i].getAttribute('data-selected') == 'true') {
                    document.getElementsByClassName('service')[i].click();
                    document.getElementsByClassName('service')[i].click();
                }
            }
        }
    } else {
        if(activeResearch){
            $("#sidemenu").hide();
            $("#mapWrapper").show();
        } else {
            $("#mapWrapper").hide();
        }

        if (selected > 0) {
            $("#activeServices").html(selected);
            $("#selectedServices").show();
            $(".swipe").hide();
        }
        for (var i = 0; i < document.getElementsByClassName('swipe').length; i++) {
            document.getElementsByClassName('swipe')[i]
                .addEventListener('click', function (e) {
                    if ($(window).width() < 767) {
                        var serviceN = $(this).parent().parent().attr('id');
                        $("#activeServices").html(selected);
                        $("#mapWrapper").show();
                        $("#sidemenu").hide();
                        $("#selectedServices").show();
                        $(".swipe").hide();
                        $("#levels").removeClass();
                        $("#levels").show();
                    }
                });
        }

        if ($("#sideOptions").css('left') == "0px") {
            $("#sidemenu").hide();
            $("#mapWrapper").show();
            $("#levels").show();
        }

        if (activeRoute) {
            $("#sidemenu").hide();
            $("#mapWrapper").show();
            $("levels").show();
        }
    }
});