// initial location and zoom
lat = 37.231797472275744;
lon = -80.42846213700699;
INITIAL_ZOOM = 14;
CLOSER_ZOOM = 17;

EPSG_4326 = new OpenLayers.Projection('EPSG:4326');

AutoSizeAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored, { 'autoSize': true });
AutoSizeAnchoredBubble = OpenLayers.Class(OpenLayers.Popup.AnchoredBubble, { 'autoSize': true });

var map;

OpenLayers.ImgPath = "/images/openlayers/dark/";

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
			//new OpenLayers.Control.LayerSwitcher({'ascending':false}),
			new OpenLayers.Control.ScaleLine({geodesic: true})
		],
		units				: 'm',
		//projection			: new OpenLayers.Projection("EPSG:900913"),
		//displayProjection	: new OpenLayers.Projection("EPSG:4326"),
	});

	// OpenStreetMap base layer
	mapnik = new OpenLayers.Layer.OSM.Mapnik('OpenStreetMap');
	map.addLayer(mapnik);

	// Markers layer
	markers = new OpenLayers.Layer.Markers('Markers');
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

