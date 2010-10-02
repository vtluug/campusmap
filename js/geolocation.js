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

	atag = document.createElement('a');
	atag.className = 'fake_button';
	atag.href = '#';
	atag.innerHTML = "Where Am I?";

	//atag.addEventListener('mousedown', showMyLocation, false);
	$(atag).bind('click', showMyLocation);

	$('#map_toolbar').prepend(atag);
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

