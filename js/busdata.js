BUS_FEED_URL = "http://bustrackerfeed.appspot.com/feed"; // Bus Tracker feed
BUS_FEED_DEVKEY = '0xfvgLLXqIXvjq2NAtmsDV5Dr6aSqn6wj5rEbh1FNwqqMUHHTfEtlvMTtfVMgdWI'; // FIXME: get your own
BUS_AGENCY_ID = 'f0859a7c-ab70-4a23-9469-b3d4a743d5f6';

BUS_ICON = 'http://m.bustracker.org/images/bus_icon/bus####.png';

BUS_UPDATE_INTERVAL = 10000;

routeId = "";
updateTimer = null;


/**
 * Initialize bus data
 * Adds map layers, loads initial routes, and sets up the update interval
 */
function initBusData()
{
	// Bus route layer
	busRoutes = new OpenLayers.Layer.Vector('Bus Routes');
	map.addLayer(busRoutes);

	// Bus stops layer
	busStops = new OpenLayers.Layer.Markers('Bus Stops');
	map.addLayer(busStops);

	// Buses layer
	busMarkers = new OpenLayers.Layer.Markers('Buses', { attribution : "Bus data from <a href='http://bustracker.org' rel='external'>VT Bus Tracker</a>" });
	map.addLayer(busMarkers);

	loadRoutes();
	initRouteUpdates();
}

/**
 * Loads JSON data from the bus tracker feed
 */
function loadBusData(req, arg, callback)
{
	$.ajax({
		url : BUS_FEED_URL,
		dataType : 'jsonp',
		jsonp : 'cb',
		data : {
			'dev_key' : BUS_FEED_DEVKEY,
			'agency_id' : BUS_AGENCY_ID,
			'req' : req,
			'arg' : arg,
			'int' : 1,
			'stops' : true,
		},
		success : callback,
	});
}

var routes = [];

/**
 * Loads the routes that are currently running
 */
function loadRoutes()
{
	loadBusData('allRunningRoutes', '', parseRoutes);
}

/**
 * Callback for loadRoutes()
 */
function parseRoutes(data)
{
	jsonData = $.parseJSON(data);
	routeList = jsonData['response']['allRunningRoutes'];

	// create route array
	for(id in routeList)
	{
		routes.push({
			routeId : id,
			text : routeList[id]
		});
	}

	// make sure buses are running
	if(routes.length == 0)
	{
		$('#route_selector option').text('No routes running');
		$('#route_selector').attr('disabled', 'disabled');
		return;
	}
	else {
		$('#route_selector option').text('Select a route');
		$('#route_selector').removeAttr('disabled');
	}

	// add each route to the route selector
	$.each(routeList, function(val, text)
	{
		$('#route_selector').append(new Option(text, val));
	});

	$('#route_selector').change(function(e)
	{
		$('#route_selector option:selected').each(function()
		{
			setActiveRoute($(this).val());
		});
	});
}

/**
 * Sets the active bus route and calls loadRoute()
 */
function setActiveRoute(val)
{
	if(val.length == 0)
	{
		return;
	}

	routeId = val;
	loadRoute();
}

/**
 * Loads the current bus route
 */
function loadRoute()
{
	if(routeId.length == 0)
	{
		return;
	}

	loadBusData('route', routeId, parseRoute);
}

/**
 * Callback for loadRoute()
 */
function parseRoute(data)
{
	jsonData = $.parseJSON(data);
	routeData = jsonData['response']['route'];

	addShape(routeData['shape']['shapePoints'][0]);
	addStops(routeData['stops']);
	addBuses(routeData['busses']);
}

/**
 * Adds the shape of a bus route given an array of maps containing lon and lat values
 */
function addShape(pts)
{
	points = [];

	for(i in pts)
	{
		pt = new OpenLayers.Geometry.Point(pts[i]['lon'], pts[i]['lat']);

		points.push(pt.transform(epsg4326, map.getProjectionObject()));;
	}

	// remove existing route
	busRoutes.removeFeatures(busRoutes.features);

	geom = new OpenLayers.Geometry.LineString(points);
	feature = new OpenLayers.Feature.Vector(geom, null, {
		strokeColor : '#ff0000',
		strokeOpacity : 0.7,
		strokeWidth : 5
	});
	busRoutes.addFeatures(feature);
}

/**
 * Updates the stops currently displayed on the map from an array of stops
 */
function addStops(stops)
{
	// remove existing stops
	busStops.clearMarkers();

	for(i in stops)
	{
		stopLoc = stops[i]['location'];

		if(stopLoc.length == 0)
		{
			continue;
		}

		loc = new OpenLayers.LonLat(stopLoc['lon'], stopLoc['lat']);

		eta = parseFloat(stops[i]['eta']);
		eta = Math.round(eta * 100) / 100;

		popupData = "<strong>" + stops[i]['name'] + "</strong><br />\n";

		if(eta >= 0)
		{
			popupData += "ETA: " + eta + " minutes";//<br />\n";
		}

		//popupData = "Scheduled Arrival: ";

		// create marker and add to "bus stops" layer
		addMarker(busStops, loc.transform(epsg4326, map.getProjectionObject()), AutoSizeAnchored, popupData, { 'closeBox' : true });

		// add popup to marker
		//marker.events.register('mousedown', marker, showStopPopup);
	}
}

/**
 * Loads the bus data and calls parseBuses()
 */
function updateBuses()
{
	loadBusData('busses', routeId, parseBuses);
}

/**
 * Callback for updateBuses()
 */
function parseBuses(data)
{
	jsonData = $.parseJSON(data);
	addBuses(jsonData['response']['busses']);
}

/**
 * Updates the position of buses on the map given an array of buses
 */
function addBuses(buses)
{
	// remove existing buses
	busMarkers.clearMarkers();

	size = new OpenLayers.Size(60, 60);

	for(i in buses)
	{	
		busLoc = buses[i]['location'];

		if(busLoc.length == 0)
		{
			continue;
		}

		loc = new OpenLayers.LonLat(busLoc['lon'], busLoc['lat']);

		dir = new String(buses[i]['velocity']['direction']);
		while(dir.length < 4)
		{
			dir = '0'.concat(dir);
		}

		icon = new OpenLayers.Icon(BUS_ICON.replace('####', dir), size);
		popupData = "Passengers: " + buses[i]['passenger_count'] + "<br />\n";
		popupData += "Speed: " + buses[i]['velocity']['speed'] + "mph<br />\n";
		popupData += "Last Updated: " + buses[i]['latestUpdate'];

		// create marker and add to "bus markers" layer
		addMarker(busMarkers, loc.transform(epsg4326, map.getProjectionObject()), AutoSizeAnchored, popupData,  { 'closeBox' : true, 'icon' : icon});
	}
}

/**
 * Initializes automatic updates of bus position at the time specified by BUS_UPDATE_INTERVAL
 */
function initRouteUpdates()
{
	updateTimer = setInterval(updateBuses, BUS_UPDATE_INTERVAL);
}

