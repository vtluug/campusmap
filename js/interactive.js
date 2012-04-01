OSM_URL = "/interactive.osm";

routeId = "";
updateTimer = null;

// FIXME: handle relations properly; may need to process so that each relation
// is converted to a way


/**
 * Initialize interactive data.
 */
$(document).ready(function()
{
    interactiveLayer    = new OpenLayers.Layer.Vector("Interactive", {
        displayInLayerSwitcher: false,
        maxResolution:          3,
        protocol:               new OpenLayers.Protocol.HTTP({
            url:                OSM_URL,
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
    map.addLayer(interactiveLayer);

    control = new OpenLayers.Control.SelectFeature([interactiveLayer], {
        onSelect:               showPopup,
        onUnselect:             hidePopup,
    });
    map.addControl(control);

    // FIXME: we can only have one active control at a time, this will have to be merged into bus stop layer
    control.activate();
});

/**
 * Show a info popup.
 */
function showPopup(feature)
{
    if(!feature.data.name)
        return;

    popupHtml       = "<h4>" + safe(feature.data.name) + "</h4>";

    if(feature.data['public_transport'] == 'stop_position')
    {
        if(typeof getBusRouteSelector != 'function')
            return;

        popupHtml  += getBusRouteSelector(feature);
    }
    else if(feature.data['building'])
    {
        if(feature.data['url:wiki'])
        {
            popupHtml  += "<a href='" +
                safe(feature.data['url:wiki']).replace("'", '') +
                "' rel='external'>Wiki</a>";
        }
        else {
            return;
        }
    }

    feature.popup = new OpenLayers.Popup.Anchored('info_box',
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(300, 160),
            popupHtml,
            null,
            false,
            null);
    map.addPopup(feature.popup);

    if(feature.data['public_transport'] == 'stop_position')
    {
        $('#popup_route_selector').change(function(){
            $('#arrival_times').empty();
            route = $('#popup_route_selector option:selected').val();
            if(route == '') return;
            loadArrivalTimes(route, feature.data.ref);
        });
    }
}

/**
 * Hide the info popup.
 */
function hidePopup(feature)
{
    if(!feature.popup)
        return;

    map.removePopup(feature);
    feature.popup.destroy();
}
