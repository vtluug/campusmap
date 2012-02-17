// initial location and zoom
lat = 37.231797472275744;
lon = -80.42846213700699;
INITIAL_ZOOM = 15;
CLOSER_ZOOM = 17;

EPSG_4326 = new OpenLayers.Projection('EPSG:4326');

AutoSizeAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored, { 'autoSize': true });
AutoSizeAnchoredBubble = OpenLayers.Class(OpenLayers.Popup.AnchoredBubble, { 'autoSize': true });

var map;

OpenLayers.ImgPath = "/images/openlayers/dark/";

$(document).ready(function(){
	$('#map').width($(window).width())
	$('#map').height($(window).height())
	$('#infobox button').click(function(){
	    $('#infobox_content').toggle();
	});

	initMap();
	initBusData();
	initSearch();

	wigle = new OpenLayers.Layer.WiGLE('WiGLE', { visibility: false });
	map.addLayer(wigle);

    // VBMP 2009 imagery from VGIN, apparently public domain as of early 2012
    // https://wiki.openstreetmap.org/wiki/Virginia#2009_VBMP_Orthoimagery
	//vbmp2009 = "http://gismaps.virginia.gov/arcgis2/rest/services/VBMP2009/VBMP2009_WGS/MapServer";
	vbmp2009 = "http://b.tile.map.vtluug.org/vbmp2009";
	arcgis_add("VBMP 2009 (Aerial)", vbmp2009, {
	    transitionEffect:   'resize',
	    maxExtent:          new OpenLayers.Bounds(-20037508.34, -20037508.34,
            20037508.34, 20037508.34),
	});

    // VBMP 2011 imagery from VGIN
	//vbmp2011 = "http://gismaps.virginia.gov/arcgis2/rest/services/VBMP2011/VBMP2011_WGS/MapServer";
    vbmp2011 = "http://c.tile.map.vtluug.org/vbmp2011";
	arcgis_add("VBMP 2011 (Aerial)", vbmp2011, {
	    transitionEffect:   'resize',
	    maxExtent:          new OpenLayers.Bounds(-20037508.342787, -20037508.342787,
            20037508.342787, 20037508.342787),
    });
});

$(window).resize(function(){
	$('#map').width($(window).width())
	$('#map').height($(window).height())
});

/**
 * Initialize the map
 */
function initMap()
{
	map		 = new OpenLayers.Map('map', {
		controls			: [
			new OpenLayers.Control.Attribution(),
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.LayerSwitcher({'ascending':false}),
			new OpenLayers.Control.ScaleLine({geodesic: true})
		],
		units				: 'm',
		//projection			: new OpenLayers.Projection("EPSG:900913"),
		//displayProjection	: new OpenLayers.Projection("EPSG:4326"),
	});

	// OpenStreetMap base layer
	mapnik = new OpenLayers.Layer.OSM.Mapnik('OpenStreetMap', {
	    transitionEffect: 'resize',
	});
	map.addLayer(mapnik);

	// Markers layer
	markers = new OpenLayers.Layer.Markers('Markers', { displayInLayerSwitcher: false });
	map.addLayer(markers);

	// center map on Blacksburg
	loc			= new OpenLayers.LonLat(lon, lat).transform(
		EPSG_4326, map.getProjectionObject());
	map.setCenter(loc, INITIAL_ZOOM);
}


/**
 * Add a marker to the specified layer
 */
function addMarker(layer, ll, popupClass, popupContent, data)
{
	feature = new OpenLayers.Feature(layer, ll);
	feature.closeBox = data['closeBox'];
	feature.popupClass = popupClass;
	feature.data.popupContentHTML = popupContent;
	feature.data.overflow = 'auto';

	if(data['icon'])
	{
		feature.data.icon = data['icon'];
	}

	marker = feature.createMarker();

	markerClick = function(e)
	{
		if(this.popup == null)
		{
			this.popup = this.createPopup(this.closeBox);
			map.addPopup(this.popup);
			this.popup.show();
		}
		else {
			this.popup.toggle();
		}

		currentPopup = this.popup;

		// stop the event here before it does any serious damage!
		OpenLayers.Event.stop(e);
	};
	marker.events.register('mousedown', feature, markerClick);

	layer.addMarker(marker);
}
