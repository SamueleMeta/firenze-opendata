function drawCircles(map, centerCoords, radius) { //DEPRECATED
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
    //clss.setAttribute('data-selected', 'true');
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
    handleColor(clss, id);
    deleteMarkers(id);
}

function handleColor(clss, id){
    var rgbColor = $("#" + id).css('backgroundColor');
    var hexColor = hexc(rgbColor);
    colorStack.push(hexColor);
    clss.setAttribute('data-selected', 'false');
    $("#" + id).css('background-color', "transparent");
    $("#" + id).css('border-color', "hsla(0, 0%, 100%, .43)");
}

function deleteMarkers(id){
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
    for (var i = 0; i < document.getElementsByClassName('service').length; i++) {
        if (document.getElementsByClassName('service')[i].getAttribute('data-selected') == 'true'){
            if(document.getElementsByClassName('service')[i].id != id)
                document.getElementsByClassName('service')[i].click();
        }
    }
    
    if(document.getElementById(id).getAttribute('data-selected') == 'true'){
        setTimeout(function(){
                document.getElementById(id).click();
        }, 400);
    }

    setTimeout(function(){
        var rgbColor = $("#" + id).css('backgroundColor');
            var hexColor = hexc(rgbColor);
            circle.setOptions({
                fillColor: hexColor,
                strokeColor: hexColor
            });
        },1000);
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

function doSwipeLeft(serviceElement, serviceName, selected){
    if(selected < 1){
        $("#mapWrapper").show();
        $("#sidemenu").hide();
        populateOptions(serviceName);
        $("#levels").removeClass();
        $("#levels").addClass(serviceName);
        triggerService(serviceElement);
    }
}

function triggerService(service){
    if (service.getAttribute('data-selected') == 'false') {
        addServiceMarkers(service, service.id);
    }
}

function populateOptions(id) {
    switch (id) {
        case 'farmacie':
            document.getElementById("advancedService").innerHTML = "Farmacie";
            $("#sideOptions").append(`
            <h5 class="label">Orario di apertura</h5>
            <div class="dropdown">
                <button onclick="showOpeningHour()" class="dropbtn" id="opening">--:--</button>
                <ul id="openingDropdown" class="dropdown-content">
                    <li class="openingHour">08:00</li>
                    <li class="openingHour">09:00</li>
                    <li class="openingHour">15:30</li>
                    <li class="openingHour">16:00</li>
                    <li class="openingHour">20:00</li>
                </ul>
            </div>
            <h5 class="label">Orario di chiusura</h5>
            <div class="dropdown">
                <button onclick="showClosingHour()" class="dropbtn" id="closing">--:--</button>
                <ul id="closingDropdown" class="dropdown-content">
                        <li class="closingHour">09:00</li>
                        <li class="closingHour">13:00</li>
                        <li class="closingHour">19:30</li>
                        <li class="closingHour">20:00</li>
                        <li class="closingHour">21:00</li>
                        <li class="closingHour">23:00</li>
                        <li class="closingHour">00:00</li>
                </ul>
            </div>
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions">
                <li class="optionItem" id="comunale">
                    <div>Comunale</div>
                </li>
                <li class="optionItem lastItem" id="nonComunale">
                    <div>Non Comunale</div>
                </li>
            </ul>`);
            break;
        case 'centriAnziani': 
            document.getElementById("advancedService").innerHTML = "Centri Anziani";
            $("#sideOptions").append(`
            <h5 class="label">Proprietà</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Comune</div>
                </li>
                <li class="optionItem">
                    <div>ASP</div>
                </li>
                <li class="optionItem lastItem">
                    <div>ATER</div>
                </li>
            </ul>
            <h5 class="label">Quota</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>0</div>
                </li>
                <li class="optionItem">
                    <div>5</div>
                </li>
                <li class="optionItem">
                    <div>8</div>
                </li>
                <li class="optionItem lastItem">
                    <div>10</div>
                </li>
            </ul>
            <h5 class="label">Iscrizione</h5>
                <ul class="moreOptions">
                    <li class="optionItem">
                        <div>Sì</div>
                    </li>
                    <li class="optionItem lastItem">
                        <div>No</div>
                    </li>
                </ul>
            <h5 class="label">Statuto</h5>
                <ul class="moreOptions">
                    <li class="optionItem">
                        <div>Sì</div>
                    </li>
                    <li class="optionItem lastItem">
                        <div>No</div>
                    </li>
                </ul>    
        `);
            break;
        case 'ospedali':
            document.getElementById("advancedService").innerHTML = "Ospedali";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Casa Di Cura</div>
                </li>
                <li class="optionItem">
                    <div>Ospdale Pubblico</div>
                </li>
                <li class="optionItem">
                    <div>URP</div>
                </li>
                <li class="optionItem lastItem">
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
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Residenza</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            `);
            break;
        case 'marginalita':
            document.getElementById("advancedService").innerHTML = "Centri Inclusione Sociale";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia Struttura</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Residenziale Donne</div>
                </li>
                <li class="optionItem">
                    <div>Residenziale Uomini</div>
                </li>
                <li class="optionItem">
                    <div>Residenziale MSNA</div>
                </li>
                <li class="optionItem">
                    <div>Appartamenti</div>
                </li>
                <li class="optionItem">
                    <div>Campo Nomadi</div>
                </li>
                <li class="optionItem">
                    <div>Mensa</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Nomadi</div>
                </li>
                <li class="optionItem">
                    <div>(Ex) Detenuti</div>
                </li>
                <li class="optionItem">
                    <div>Rifugiati</div>
                </li>
                <li class="optionItem">
                    <div>Senza Fissa Dimora</div>
                </li>
                <li class="optionItem lastItem">
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
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Residenza</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Centro Diurno</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Privata</div>
                </li>
                <li class="optionItem">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Diretta ASL</div>
                </li>
            </ul>
            `);
            break;
        case 'anzianiAuto': 
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Anziani Autosufficienti";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Residenza</div>
                </li>
                <li class="optionItem">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Comunità</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Pubblica</div>
                </li>
                <li class="optionItem">
                    <div>Privata</div>
                </li>
                <li class="optionItem">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem">
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
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Residenza</div>
                </li>
                <li class="optionItem">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem">
                    <div>Centro Di Orientamento</div>
                </li>
                <li class="optionItem">
                    <div>Centro Di Socializzazione</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Ambulatorio</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Diretta</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Convenzionata</div>
                </li>
            </ul>
            `);
            break;
        case 'disabiliPsichici':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Disabili Psichici";
            $("#sideOptions").append(`
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Convenzionata</div>
                </li>
                <li class="optionItem lastItem">
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
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Ambulatorio</div>
                </li>
                <li class="optionItem">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Residenza</div>
                </li>
            </ul>
            <h5 class="label">Gestione</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Pubblica</div>
                </li>
                <li class="optionItem">
                    <div>Privata</div>
                </li>
                <li class="optionItem lastItem">
                    <div>Convenzionata</div>
                </li>
            </ul>
            `);
            break;
        case 'assistMinori':
            document.getElementById("advancedService").innerHTML = "Centri Assistenziali Minori";
            $("#sideOptions").append(`
            <h5 class="label">Tipologia Struttura</h5>
            <ul class="moreOptions">
                <li class="optionItem">
                    <div>Centro Diurno</div>
                </li>
                <li class="optionItem">
                    <div>Casa Famiglia</div>
                </li>
                <li class="optionItem">
                    <div>Appartamenti Per Minori</div>
                </li>
                <li class="optionItem">
                    <div>Madre con figlio</div>
                </li>
                <li class="optionItem">
                    <div>Comunità</div>
                </li>
                <li class="optionItem">
                    <div>Giovani 18-21</div>
                </li>
                <li class="optionItem">
                    <div>Centro Pronto Accoglimento</div>
                </li>
                <li class="optionItem lastItem">
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
                $(this).toggleClass('selected');
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