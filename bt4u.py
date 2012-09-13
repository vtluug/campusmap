#!/usr/bin/python2

import datetime
import flask
import lxml.html
import urllib
import urllib2

BT4U_URL = 'http://bt4u.org' 

app = flask.Flask(__name__)
app.debug = True

def get_asp_crap(doc):
    """Get __VIEWSTATE and __EVENTVALIDATION from hidden form elements."""
    inputs = doc.xpath('//input')
    viewstate = inputs[0].value
    eventval = inputs[1].value
    return viewstate, eventval

def parse_routes(doc):
    listbox = doc.getroot().get_element_by_id('routeListBox')
    return listbox.value_options[1:]

def parse_stops(doc):
    listbox = doc.getroot().get_element_by_id('stopListBox')
    stops = {}
    for option in listbox.value_options[1:]:
        code, stopname = option.split('-')
        stops[int(code)] = option
    return stops

def route_stop_info(route, stop):
    r = urllib2.urlopen(BT4U_URL)
    doc = lxml.html.parse(r)
    vs, ev = get_asp_crap(doc)

    routes = parse_routes(doc)
    if route not in routes:
        return None

    data = {
        '__VIEWSTATE' : vs,
        '__EVENTVALIDATION' : ev,
        '__EVENTTARGET' : 'routeListBox',
        'routeListBox' : route,
        'Button1' : 'Submit',
    }
    data_encoded = urllib.urlencode(data) #.encode('utf-8')
    r = urllib2.urlopen(BT4U_URL, data_encoded)
    doc = lxml.html.parse(r)
    vs, ev = get_asp_crap(doc)
    stops = parse_stops(doc)
    if stop not in stops:
        return None

    data = {
        '__VIEWSTATE' : vs,
        '__EVENTVALIDATION' : ev,
        '__EVENTTARGET' : 'stopListBox',
        'routeListBox' : route,
        'stopListBox' : stops[stop],
        'Button1' : 'Submit',
    }
    data_encoded = urllib.urlencode(data) #.encode('utf-8')
    try:
        r = urllib2.urlopen(BT4U_URL, data_encoded)
        doc = lxml.html.parse(r)
    except urllib2.HTTPError as e:
        return None

    entries = doc.xpath('//li')
    if len(entries) > 1:
        times = []
        for entry in entries[1::2]:
            arrival = entry.text_content().split(': ')[1].strip()
            arrival = datetime.datetime.strptime(arrival,
                    '%b-%d-%Y %I:%M %p')
            times.append(str(arrival))

        return times
    else:
        return None

@app.route('/stop/<route>/<int:stop>')
def stop_info(route, stop):
    times = route_stop_info(route, stop)
    return flask.jsonify({'times': times})

if __name__ == '__main__':
    app.run()
