BT4U_API_URL = "/bt4u";
ROUTES_OSM_URL = "/routes.osm";
STOPS_OSM_URL = "/stops.osm";

routeId = "";
updateTimer = null;


/**
 * Initialize bus data; load routes.
 */
$(document).ready(function()
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
});

/**
 * Load arrival times from BT4U backend.
 */
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
                "stop on this route"); }
    });
}

var routes = {};

/**
 * Get the bus route selector.
 */
function getBusRouteSelector(feature)
{
    popupHtml       = "<select id='popup_route_selector'>";
    popupHtml      += "<option value=''>Select a route</option>";

    for(i in routes[feature.data.id])
    {
        route       = routes[feature.data.id][i];
        popupHtml  += "<option value='" + safe(route['ref']).replace("'", '') + 
            "'>" + safe(route['name']) + "</option>";
    }

    popupHtml      += "</select>";
    popupHtml      += "<div id='arrival_times'></div>";

    return popupHtml;
}
