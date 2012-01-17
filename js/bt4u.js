BT4U_API_URL = "/bt4u";
ROUTES_OSM_URL = "/routes.osm";
STOPS_OSM_URL = "/stops.osm";

routeId = "";
updateTimer = null;


/**
 * Initialize bus data.
 * Loads routes and stops.
 */
function initBusData()
{
    loadRoutes();
    loadBusStops();
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

    for(i in routes[feature.data.id])
    {
        route       = routes[feature.data.id][i];
        popupHtml  += "<option value='" + route['ref'] + 
            "'>" + route['name'] + "</option>";
    }

    popupHtml      += "</select>";
    popupHtml      += "<div id='arrival_times'></div>";

    popup           = new OpenLayers.Popup.Anchored('stop_info',
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(300, 160),
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

var routes = {};

/**
 * Loads the routes that are currently running
 */
function loadRoutes()
{
    $.get(ROUTES_OSM_URL, function(data){
        $(data).find('relation').each(function(){
            routeObj    = $(this);
            route       = {};

            routeObj.find('tag').each(function(){
                route[$(this).attr('k')] = $(this).attr('v');
            });

            routeObj.find("member[type='node']").each(function(){
                nodeId = $(this).attr('ref');
                if(typeof routes[nodeId] != 'object')
                    routes[nodeId] = [];

                routes[nodeId].push(route);
            });
        });
    });
}
