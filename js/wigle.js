OpenLayers.Layer.WiGLE = OpenLayers.Class(OpenLayers.Layer.XYZ, {
	name: "WiGLE",
	url: 'http://wigle.net/gps/gps//GPSDB/onlinemap2/',
	attribution: "Wifi data &copy; 2011 <a href='http://wigle.net' rel='external'>WiGLE</a>",

	isBaseLayer: false,
	sphericalMercator: true,
	zoomOffset: 0,
	serverResolutions: null,

	initialize: function(name, options) {
		this.tileSize = new OpenLayers.Size(256, 256);
		name = name || this.name;
		url = this.url;
		options = OpenLayers.Util.extend({
				tileSize: new OpenLayers.Size(256, 256),
				numZoomLevels: 24,
				buffer: 0,
				sphericalMercator: true,
		}, options);
		var newArguments = [name, url, options];
		OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArguments);
	},

	clone: function(obj) {
		if (obj == null) {
			obj = new OpenLayers.Layer.WiGLE(this.name,
				                             this,getOptions());
		}

		obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
		
		return obj;
	},

	getURL: function(bounds) {
		srcproj = new OpenLayers.Projection('EPSG:900913');
		var tl = new OpenLayers.LonLat(bounds.left, bounds.top);
		tl = tl.transform(srcproj, EPSG_4326);
		var br = new OpenLayers.LonLat(bounds.right, bounds.bottom);
		br = br.transform(srcproj, EPSG_4326);

		return url + '?lat1=' + tl.lat + '&long1=' + tl.lon + '&lat2=' + br.lat + '&long2=' + br.lon + '&redir=Y&networksOnly=Y&sizeX=256&sizeY=256';
	},

	setMap: function(map) {
		OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
	},

	CLASS_NAME: "OpenLayers.Layer.WiGLE"
});
