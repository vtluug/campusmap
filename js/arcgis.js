function arcgis_callback(map, name, layerURL, layerInfo)
{
    var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
            
    //Max extent from layerInfo above            
    var layerMaxExtent = new OpenLayers.Bounds(
        layerInfo.fullExtent.xmin, 
        layerInfo.fullExtent.ymin, 
        layerInfo.fullExtent.xmax, 
        layerInfo.fullExtent.ymax  
    );
    
    var resolutions = [];
    for (var i=0; i<layerInfo.tileInfo.lods.length; i++) {
        resolutions.push(layerInfo.tileInfo.lods[i].resolution);
    }

    layer = new OpenLayers.Layer.ArcGISCache(
            name,
            layerURL,
            {
                resolutions: resolutions,
                tileSize: new OpenLayers.Size(layerInfo.tileInfo.cols, layerInfo.tileInfo.rows),                        
                tileOrigin: new OpenLayers.LonLat(layerInfo.tileInfo.origin.x , layerInfo.tileInfo.origin.y),                        
                maxExtent: layerMaxExtent,                        
                projection: 'EPSG:' + layerInfo.spatialReference.wkid

            });
    map.addLayer(layer);
}

function arcgis_add(layerName, layerURL)
{
    jsonp_url = layerURL + '?f=json&pretty=true&callback=?';
	$.getJSON(jsonp_url, function(data){arcgis_callback(map, layerName, layerURL, data);});
}
