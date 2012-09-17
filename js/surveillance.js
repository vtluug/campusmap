/**
 * Initialize surveillance data.
 */
$(function(){
    var layer = new OpenLayers.Layer.Vector("Surveillance", {
        visibility:             false,
        protocol:               new OpenLayers.Protocol.HTTP({
            'url':              "/surveillance.osm",
            'format':           new OpenLayers.Format.OSM(),
        }),
        strategies:             [new OpenLayers.Strategy.Fixed()],
        styleMap:               new OpenLayers.StyleMap({
                'default':          {
                    'externalGraphic':  "/images/surveillance.png",
                    'graphicWidth':     16,
                    'graphicHeight':    16,
                },
            }),
    });
    map.addLayer(layer);

    $(document).ready(function(){
        var control = new OpenLayers.Control.SelectFeature([layer,
            interactiveLayer]);
        map.addControl(control);
        control.activate();
    });

    layer.events.on({
        'featureselected': function(e){
            var feature = e.feature;
            if(!feature.data.name) {
                feature.data.name = "Security Camera";
            }

            var popupHtml = "<h4>" + safe(feature.data.name) + "</h4>";

            if(feature.data['level']) {
                popupHtml += "Level: " + safe(feature.data['level']) + "<br />";
            }

            if(feature.data['url']) {
                popupHtml += "<a href='" + 
                    safe(feature.data['url']).replace("'", '') + "'>View</a>";
            }

            feature.popup = new OpenLayers.Popup.FramedCloud('info_box',
                    feature.geometry.getBounds().getCenterLonLat(),
                    null,
                    popupHtml,
                    null,
                    false,
                    null);
            map.addPopup(feature.popup);
        },
        'featureunselected': function(e){
            var feature = e.feature;
            if(!feature.popup)
                return;

            map.removePopup(feature);
            feature.popup.destroy();
        },
    });
});
