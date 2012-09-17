#!/bin/sh
#XAPI_SERVER=http://open.mapquestapi.com/xapi/api/0.6/
XAPI_SERVER=http://www.overpass-api.de/api/xapi?
BBOX=-80.4905,37.0958,-30.3446,37.285

curl -o stops.osm --location --globoff "${XAPI_SERVER}node[highway=bus_stop][operator=Blacksburg%20Transit]"
curl -o routes.osm --location --globoff "${XAPI_SERVER}relation[type=route][route=bus][operator=Blacksburg%20Transit]"
curl -o surveillance.osm --location --globoff "${XAPI_SERVER}node[man_made=surveillance][bbox=${BBOX}]"
