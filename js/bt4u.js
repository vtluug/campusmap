BT4U_API_URL = "/bt4u";
STOPS_OSM_URL = "/stops.osm";

routeId = "";
updateTimer = null;


/**
 * Initialize bus data.
 * Adds map layers and load routes.
 */
function initBusData()
{
    // Bus route layer
    /*busRoutes = new OpenLayers.Layer.Vector('Bus Routes', {
        displayInLayerSwitcher: false, visibility: false });
    map.addLayer(busRoutes);

    // Bus stops layer
    busStops = new OpenLayers.Layer.Markers('Bus Stops', {
        displayInLayerSwitcher: false, visibility: false });
    map.addLayer(busStops);

    // Buses layer
    busMarkers = new OpenLayers.Layer.Markers('Buses', {
        attribution: "Bus data from <a href='http://bt4u.org' rel='external'>" +
        "BT4u</a>",
        displayInLayerSwitcher: false,
        visibility: false });
    map.addLayer(busMarkers);*/

    loadBusStops();

    $.get(BT4U_API_URL + '/routes', function(data){
        routes  = $.parseJSON(data);
    });

    /*loadRoutes();
    initRouteUpdates();*/
}

/**
 * Load bus stops from an OSM export.
 */
function loadBusStops()
{
    busStops    = new OpenLayers.Layer.Vector("Bus Stops", {
        displayInLayerSwitcher: false,
        protocol:               new OpenLayers.Protocol.HTTP({
            url:                STOPS_OSM_URL,
            format:             new OpenLayers.Format.OSM()
        }),
        strategies:             [new OpenLayers.Strategy.Fixed()],
        styleMap:               new OpenLayers.StyleMap({
                'default':          {
                    'fillColor':        '#0099ff',
                    'fillOpacity':      0,
                    'strokeColor':      '#0099ff',
                    'strokeOpacity':    0,
                    'pointRadius':      10,
                },
                'select':           {
                    'fillOpacity':      0.5,
                    'strokeOpacity':    1,
                },
            }),
    });
    map.addLayer(busStops);

    control = new OpenLayers.Control.SelectFeature([busStops], {
        onSelect:               showStopInfo,
        onUnselect:             hideStopInfo,
    });
    map.addControl(control);
    control.activate();
}

function loadArrivalTimes(route, stop)
{
    $.get(BT4U_API_URL + '/stop/' + route + '/' + stop, function(data){
        times   = $.parseJSON(data);
        if(times.length > 0)
        {
            $('#arrival_times').html('<ul></ul>');
            for(i = 0; i < times.length; i++)
            {
                $('#arrival_times ul').append('<li>' + times[i] + '</li>');
            }
        }
        else {
            $('#arrival_times').html("No runs currently scheduled for this " +
                "stop on this route");
        }
    });
}

/**
 * Show a stop info popup.
 */
function showStopInfo(feature)
{
    popupHtml       = "<h4>" + feature.data.name + "</h4>";
    popupHtml      += "<select id='popup_route_selector'>";
    popupHtml      += "<option value=''>Select a route</option>";

    for(i = 0; i < routes.length; i++)
    {
        popupHtml  += "<option value='" + routes[i]['route_short_name'] + 
            "'>" + routes[i]['route_long_name'] + "</option>";
    }

    popupHtml      += "</select>";
    popupHtml      += "<div id='arrival_times'></div>";

    popup           = new OpenLayers.Popup.Anchored('stop_info',
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(300, 200),
            popupHtml,
            null,
            false,
            null);
    feature.popup   = popup;
    map.addPopup(popup);

    $('#popup_route_selector').change(function(){
        $('#arrival_times').empty();
        route = $('#popup_route_selector option:selected').val();
        if(route == '') return;
        loadArrivalTimes(route, feature.data.ref);
    });
}

/**
 * Hide the stop info popup.
 */
function hideStopInfo(feature)
{
    map.removePopup(feature);
    feature.popup.destroy();
}

var routes = [];

/**
 * Loads the routes that are currently running
 */
function loadRoutes()
{
    loadBusData('allRunningRoutes', '', parseRoutes);
}

/**
 * Callback for loadRoutes()
 */
function parseRoutes(data)
{
    jsonData = $.parseJSON(data);
    routeList = jsonData['response']['allRunningRoutes'];

    // create route array
    for(id in routeList)
    {
        routes.push({
            routeId : id,
            text : routeList[id]
        });
    }

    // make sure buses are running
    if(routes.length == 0)
    {
        $('#route_selector option').text('No routes running');
        $('#route_selector').attr('disabled', 'disabled');
        return;
    }
    else {
        $('#route_selector option').text('Select a route');
        $('#route_selector').removeAttr('disabled');
    }

    // add each route to the route selector
    $.each(routeList, function(val, text)
    {
        $('#route_selector').append(new Option(text, val));
    });

    $('#route_selector').change(function(e)
    {
        $('#route_selector option:selected').each(function()
        {
            setActiveRoute($(this).val());
        });
    });
}

/**
 * Sets the active bus route and calls loadRoute()
 */
function setActiveRoute(val)
{
    if(val.length == 0)
    {
        hideBusLayers();
        return;
    }

    showBusLayers();

    routeId = val;
    loadRoute();
}

/**
 * Loads the current bus route
 */
function loadRoute()
{
    if(routeId.length == 0)
    {
        return;
    }

    loadBusData('route', routeId, parseRoute);
}

/**
 * Callback for loadRoute()
 */
function parseRoute(data)
{
    jsonData = $.parseJSON(data);
    routeData = jsonData['response']['route'];

    addShape(routeData['shape']['shapePoints'][0]);
    addStops(routeData['stops']);
    addBuses(routeData['busses']);
}

/**
 * Adds the shape of a bus route given an array of maps containing lon and lat values
 */
function addShape(pts)
{
    points = [];

    for(i in pts)
    {
        pt = new OpenLayers.Geometry.Point(pts[i]['lon'], pts[i]['lat']);

        points.push(pt.transform(EPSG_4326, map.getProjectionObject()));;
    }

    // remove existing route
    busRoutes.removeFeatures(busRoutes.features);

    geom = new OpenLayers.Geometry.LineString(points);
    feature = new OpenLayers.Feature.Vector(geom, null, {
        strokeColor : '#ff0000',
        strokeOpacity : 0.7,
        strokeWidth : 5
    });
    busRoutes.addFeatures(feature);
}

/**
 * Updates the stops currently displayed on the map from an array of stops
 */
function addStops(stops)
{
    // remove existing stops
    busStops.clearMarkers();

    for(i in stops)
    {
        stopLoc = stops[i]['location'];

        if(stopLoc.length == 0)
        {
            continue;
        }

        loc = new OpenLayers.LonLat(stopLoc['lon'], stopLoc['lat']);

        eta = parseFloat(stops[i]['eta']);
        eta = Math.round(eta * 100) / 100;

        popupData = "<strong>" + stops[i]['name'] + "</strong><br />\n";

        if(eta >= 0)
        {
            popupData += "ETA: " + eta + " minutes";//<br />\n";
        }

        //popupData = "Scheduled Arrival: ";

        // create marker and add to "bus stops" layer
        addMarker(busStops, loc.transform(EPSG_4326, map.getProjectionObject()), AutoSizeAnchored, popupData, { 'closeBox' : true });

        // add popup to marker
        //marker.events.register('mousedown', marker, showStopPopup);
    }
}

/**
 * Loads the bus data and calls parseBuses()
 */
function updateBuses()
{
    loadBusData('busses', routeId, parseBuses);
}

/**
 * Callback for updateBuses()
 */
function parseBuses(data)
{
    jsonData = $.parseJSON(data);
    addBuses(jsonData['response']['busses']);
}

/**
 * Updates the position of buses on the map given an array of buses
 */
function addBuses(buses)
{
    // remove existing buses
    busMarkers.clearMarkers();

    size = new OpenLayers.Size(60, 60);

    for(i in buses)
    {    
        busLoc = buses[i]['location'];

        if(busLoc.length == 0)
        {
            continue;
        }

        loc = new OpenLayers.LonLat(busLoc['lon'], busLoc['lat']);

        dir = new String(buses[i]['velocity']['direction']);
        while(dir.length < 4)
        {
            dir = '0'.concat(dir);
        }

        icon = new OpenLayers.Icon(BUS_ICON.replace('####', dir), size);
        popupData = "Passengers: " + buses[i]['passenger_count'] + "<br />\n";
        popupData += "Speed: " + buses[i]['velocity']['speed'] + "mph<br />\n";
        popupData += "Last Updated: " + buses[i]['latestUpdate'];

        // create marker and add to "bus markers" layer
        addMarker(busMarkers, loc.transform(EPSG_4326, map.getProjectionObject()), AutoSizeAnchored, popupData,  { 'closeBox' : true, 'icon' : icon});
    }
}

/**
 * Initializes automatic updates of bus position at the time specified by BUS_UPDATE_INTERVAL
 */
function initRouteUpdates()
{
    updateTimer = setInterval(updateBuses, BUS_UPDATE_INTERVAL);
}

/**
 * Make all bus layers visible (they are hidden by default)
 */
function showBusLayers()
{
    busRoutes.setVisibility(true);
    busStops.setVisibility(true);
    busMarkers.setVisibility(true);
}

/**
 * Hide all bus layers
 */
function hideBusLayers()
{
    busRoutes.setVisibility(false);
    busStops.setVisibility(false);
    busMarkers.setVisibility(false);
}
