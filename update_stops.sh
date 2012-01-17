#!/bin/sh
#XAPI_SERVER=http://open.mapquestapi.com/xapi/api/0.6/
XAPI_SERVER=http://www.overpass-api.de/api/xapi?

curl -o stops.osm --location --globoff "${XAPI_SERVER}node[highway=bus_stop][operator=Blacksburg%20Transit]"
