NOMINATIM_URL = "http://nominatim.openstreetmap.org/search";
NOMINATIM_EMAIL = 'vtluug_campus_map@james.schwinabart.com';

SEARCH_TEXT = "Search...";

/**
 * Initialize search
 */
function initSearch()
{
	searchbox = $('#search_box');

	searchbox.bind('focus', function(e)
		{
			if(e.target.value == SEARCH_TEXT)
			{
				e.target.value = '';
			}
		});
	searchbox.bind('blur', function(e)
		{
			if(e.target.value == '')
			{
				e.target.value = SEARCH_TEXT;
			}
		});

	$('#toolbar_frm').bind('submit', function(e)
		{
			e.preventDefault();

			search($('#search_box').val());
		});
}

/**
 * Search the OSM Nominatim for the specified query
 */
function search(q)
{
	// get bounding box
	bounds = map.getExtent();
	bounds = bounds.transform(map.getProjectionObject(), EPSG_4326);
	viewbox = bounds.toBBOX();

	$.ajax({
		url : NOMINATIM_URL,
		dataType : 'jsonp',
		jsonp : 'json_callback',
		data : {
			'email' : NOMINATIM_EMAIL,
			'format' : 'json',
			'q' : q,
			'viewbox' : viewbox,
		},
		success : function(data)
		{
			// clear existing markers
			markers.clearMarkers();

			// don't do anything if there weren't any results
			if(data.length <= 0)
			{
				alert("No results found!");
			}

			result = data[0];

			loc		= new OpenLayers.LonLat(result['lon'], result['lat']).
						transform(EPSG_4326, map.getProjectionObject());

			// add green marker to indicate location
			size	= new OpenLayers.Size(21, 25);
			icon	= new OpenLayers.Icon('js/openlayers/img/marker-green.png', size);
			markers.addMarker(new OpenLayers.Marker(loc, icon));

			// zoom in a bit
			map.setCenter(loc, CLOSER_ZOOM);
		},
	});
}

