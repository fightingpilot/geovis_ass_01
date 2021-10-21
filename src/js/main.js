// Using Leaflet for creating the map and adding controls for interacting with the map

//
//--- Part 1: adding base maps ---
//

//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [47.800998, 13.044625],
	zoom: 14
});

//adding two base maps 

var landscape = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
	attribution: 'Tiles from Thunderforest'}).addTo(map);

var toner = L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>' });
	toner; 

// for using the two base maps in the layer control, I defined a baseMaps variable
var baseMaps = {
	"Thunderforest landscape": landscape,
	"Toner": toner
}

//
//---- Part 2: Adding a scale bar
//

L.control.scale({position:'bottomright',imperial:false}).addTo(map);


//
//---- Part 3: Adding symbols ---- 
//

//Marker Version 1
L.marker([47, 14], {title:'markerrrrrr', clickable:true}).addTo(map).bindPopup("newpopup");
	
//Marker Version 2
var mark = L.marker([47, 12], {title:'markerrrrrr', clickable:true}).addTo(map);
mark.bindPopup("this is my popup");

//Marker Version 3	
//var myIcon = L.icon({
//iconUrl: 'css/images/cheers.png',
//iconSize: [38, 38]
//});

//L.marker([48, 13], {icon: myIcon, title:'theHouse'}).addTo(map);

//
//---- Part 4: adding features from the geojson file 
//

const today = new Date();
var weekday;
if (today.getDay() - 1 < 0) {
	weekday = 7;
} else {
	weekday = today.getDay() - 1;
}

var datedecoder = {
	0: "mon",
	1: "tue",
	2: "wed",
	3: "thu",
	4: "fri",
	5: "sat",
	6: "sun",
	7: "hol"
}

var weekdaydecoder = {
	"mon": "Montag",
	"tue": "Dienstag",
	"wed": "Mittwoch",
	"thu": "Donnestag",
	"fri": "Freitag",
	"sat": "Samstag",
	"sun": "Sonntag",
	"hol": "Feiertag"
}

var barClosedMarker = L.icon({
	iconUrl: 'css/images/cheers(1).png',
	iconSize: [24, 24]
});

var barOpenMarker = L.icon({
	iconUrl: 'css/images/cheers.png',
	iconSize: [24, 24]
});

function isBarOpen (feature) {
	//console.log(feature.properties.bar_name)
	//console.log(feature.properties.opening_hours[datedecoder[weekday]][0]
	//	+ " - " +
	//	feature.properties.opening_hours[datedecoder[weekday]][1])
	if (feature.properties.opening_hours[datedecoder[weekday]][0] === undefined ||
		feature.properties.opening_hours[datedecoder[weekday]][0].length > 5) {
		return false;
	} else {
		var t = feature.properties.opening_hours[datedecoder[weekday]][0].split(":")
		var d = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			t[0],
			t[1],
			0,
			0)
		if (today.getTime() < d.getTime()) {
			return false;
		} else {
			if (feature.properties.opening_hours[datedecoder[weekday]][1] === undefined) {
				return true;
			} else {
				var t = feature.properties.opening_hours[datedecoder[weekday]][1].split(":")
				var dd = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate(),
					t[0],
					t[1],
					0,
					0
				)
				if (dd.getTime() < d.getTime()) {
					dd.setHours(dd.getHours() + 24)
				}
				//console.log(dd)
				if (today.getTime() <= dd.getTime()) {
					return true;
				}
				else return false;
			}
		}
	}
}

function barMarker (feature, latlng, marker) {
	console.log("barMarker")
	console.log(feature.properties.bar_name)
	var mark = L.marker(latlng, {icon: marker, title: feature.properties.bar_name, clickable:true});
	var popupText = "<h3>" + feature.properties.bar_name + "</h3>" +
		"<p><b>Öffnungszeiten</b><br>"
	for (opening_hour in feature.properties.opening_hours) {
		console.log(feature.properties.opening_hours[opening_hour])
		popupText += weekdaydecoder[opening_hour] + ": ";
		if (feature.properties.opening_hours[opening_hour].length === 0) {
			popupText += "Keine Öffnungszeiten bekannt";
		} else
			popupText += feature.properties.opening_hours[opening_hour][0]
			if (feature.properties.opening_hours[opening_hour][1] === undefined) {
				popupText += "<br>"
			} else {
				popupText += " - " +
					feature.properties.opening_hours[opening_hour][1] + "<br>";
			}
	}

	popupText += "</p>"

	popupText += "<p></p><b>Kontakt</b><br>";
	popupText += "Fon: <a href=tel:" + feature.properties.phone + ">" + feature.properties.phone + "</a><br>";
	popupText += 'Internet: <a target="_blank" rel="noopener noreferrer" href=' + feature.properties.web + '>' + feature.properties.web + '</a><br>'
	popupText += 'Addresse: ' + feature.properties.address + '</p>'
	popupText += '<p><b>Info</b><br>'
	popupText += feature.properties.info + "</p>"
	mark.bindPopup(popupText);
	return mark;
}

var allBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		if (isBarOpen(feature)) {
			return barMarker(feature, latlng, barOpenMarker);
		}else return barMarker(feature, latlng, barClosedMarker);
	}
});

var openBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		if (isBarOpen(feature)) {
			return L.marker(latlng, {icon: barOpenMarker});
		}
	}
});

var closedBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		if (!isBarOpen(feature)) {
			return L.marker(latlng, {icon: barClosedMarker});
		}
	}
});

allBars.addTo(map);
//openBars.addTo(map);
//closedBars.addTo(map);

//
//---- Part 5: Adding a layer control for base maps and feature layers
//

//the variable features lists layers that I want to control with the layer control
var features = {
	"Bars": allBars//,
	//"Geöffnete Bars": openBars,
	//"Geschlossene Bars": closedBars
}

//the legend uses the layer control with entries for the base maps and two of the layers we added
//in case either base maps or features are not used in the layer control, the respective element in the properties is null

L.control.layers(baseMaps, features, {position:'topleft'}).addTo(map);






