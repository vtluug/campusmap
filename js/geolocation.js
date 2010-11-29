WHERE_AM_I_TEXT = "Where Am I?";
WHERE_AM_I_HOVER_TEXT = "Find your current location on the map (accuracy may vary)";

/**
 * Add a "Where Am I?" button to the map if geolocation is supported by the browser
 */
function addLocateButton()
{
	if(!navigator.geolocation)
	{
		// button should not be added if feature is not supported by browser
		return;
	}

	buttontag = document.createElement('button');
	buttontag.title = WHERE_AM_I_HOVER_TEXT;
	buttontag.innerHTML = WHERE_AM_I_TEXT;

	$(buttontag).bind('click', showMyLocation);

	$('#map_toolbar').prepend(buttontag);
}

/**
 * Zoom to the location returned by the browser
 */
function showMyLocation(e)
{
	e.preventDefault();

	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(markAndZoomGeo);
	}
}

/**
 * Add a marker and zoom to the specified location
 */
function markAndZoomGeo(position)
{
	// clear existing markers
	markers.clearMarkers();

	loc			= new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude).
					transform(EPSG_4326, map.getProjectionObject());

	// add green marker to indicate location
	size		= new OpenLayers.Size(21, 25);
	icon		= new OpenLayers.Icon('js/openlayers/img/marker-green.png', size);
	markers.addMarker(new OpenLayers.Marker(loc, icon));

	// zoom in a bit
	map.setCenter(loc, CLOSER_ZOOM);
}

