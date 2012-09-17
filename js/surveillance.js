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
});
