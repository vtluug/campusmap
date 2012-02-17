/**
 * Callback for ArcGIS REST API.
 */
function arcgis_callback(map, name, layerURL, extraOpts, layerInfo)
{
    var extraOpts = typeof extraOpts == 'object' ? extraOpts : {};

    // Max extent from layerInfo above            
    var layerMaxExtent = new OpenLayers.Bounds(
        layerInfo.fullExtent.xmin, 
        layerInfo.fullExtent.ymin, 
        layerInfo.fullExtent.xmax, 
        layerInfo.fullExtent.ymax  
    );
    
    var resolutions = [];
    for(var i = 0; i < layerInfo.tileInfo.lods.length; i++)
    {
        resolutions.push(layerInfo.tileInfo.lods[i].resolution);
    }

    opts = {
        resolutions:    resolutions,
        tileSize:       new OpenLayers.Size(layerInfo.tileInfo.cols,
                            layerInfo.tileInfo.rows),
        tileOrigin:     new OpenLayers.LonLat(
                            layerInfo.tileInfo.origin.x,
                            layerInfo.tileInfo.origin.y),
        projection:     'EPSG:' + layerInfo.spatialReference.wkid,
        buffer: 0,
    };

    for(opt in extraOpts)
    {
        opts[opt] = extraOpts[opt];
    }

    layer = new OpenLayers.Layer.ArcGISCache(
            name,
            layerURL,
            opts);
    map.addLayer(layer);
}

/**
 * Add an ArcGIS layer by accessing the REST API.
 */
function arcgis_add(layerName, layerURL, opts)
{
    jsonp_url = layerURL + '?f=json&pretty=true&callback=?';
	$.getJSON(jsonp_url, function(data){
	    arcgis_callback(map, layerName, layerURL, opts, data);
	});
}
