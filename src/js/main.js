// Using Leaflet for creating the map and adding controls for interacting with the map

//adding base maps
//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [47.800998, 13.044625],
	zoom: 14
});

//adding base maps
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	'attribution':  'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	'useCache': true
});

var BasemapAT_grau = L.tileLayer('https://maps{s}.wien.gv.at/basemap/bmapgrau/{type}/google3857/{z}/{y}/{x}.{format}', {
	maxZoom: 19,
	attribution: 'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
	subdomains: ["", "1", "2", "3", "4"],
	type: 'normal',
	format: 'png',
	bounds: [[46.35877, 8.782379], [49.037872, 17.189532]]
}).addTo(map);

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

// for using the base maps in the layer control, I defined a baseMaps variable
var baseMaps = {
	"OpenStreetMap": osm,
	"Basemap AT": BasemapAT_grau,
	"Light Gray": CartoDB_Positron
}

//creating a legend
var legend = L.control({ position: "bottomleft" });

//Adding a scale bar
L.control.scale({position:'bottomright',imperial:false}).addTo(map);

//adding variable for the day (number) of the the week
const today = new Date();
var weekday;
if (today.getDay() - 1 < 0) {
	weekday = 6;
} else {
	weekday = today.getDay() - 1;
}

//adding variable for the language setting
var language = window.location.hash.split("#")[1];
//default language
if (language === undefined) {
	language = "de";
}
//freeze the language variable, so it can't be changed later on
Object.freeze(language);

//variables to show layers based on the legend
var open = false;
var close = false;
var overlays = [];

//variable to decode the day of the week
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

//symbol for closed bars
var barClosedMarker = L.icon({
	iconUrl: 'css/images/cheers(1).png',
	iconSize: [24, 24]
});

//symbol for open bars
var barOpenMarker = L.icon({
	iconUrl: 'css/images/cheers.png',
	iconSize: [24, 24]
});

//designing the legend
legend.onAdd = function(map) {
	var div = L.DomUtil.create("div", "legend");

	div.innerHTML += "<h4>" + window[language].legend.title + "</h4>";
	div.innerHTML += '<i class="icon" onclick="cheapFunc(\'open\')" style="background-image: url(https://cdn-icons-png.flaticon.com/512/1087/1087972.png);background-repeat: no-repeat;"></i><span>' + window[language].legend.open + '</span><br>';
	div.innerHTML += '<i class="icon" onclick="cheapFunc(\'closed\')" style="background-image: url(https://cdn-icons-png.flaticon.com/512/1088/1088016.png);background-repeat: no-repeat;"></i><span>' + window[language].legend.closed + '</span><br>';

	return div;
};
//add the legend to the map
legend.addTo(map);

//function to add layers to map and store the in overlays
function addToMap(layer, map) {
	layer.addTo(map);
	overlays.push(layer);
}

//function to switch layers using the legend
function cheapFunc(text) {
	//inner function to remove the overlay layers
	var removeMarkers = function() {
		overlays.forEach( function(layer) {
			map.removeLayer(layer)
		});
	overlays = [];
	};

	if (text === "closed"){
		if (!close) {
			removeMarkers();
			addToMap(closedBars, map);
			close = true;
			open = false;
		}
		else if (close) {
			removeMarkers();
			addToMap(allBars, map);
			open = false;
			close = false;
		}
		else if (open) {
			removeMarkers();
			addToMap(closedBars, map);
			close = true;
			open = false;
		}
	};
	if (text === "open"){
		if (!open) {
			removeMarkers();
			addToMap(openBars, map);
			open = true;
			close = false;
		}
		else if (open) {
			removeMarkers();
			addToMap(allBars, map);
			open = false;
			close = false;
		}
		else if (closed) {
			removeMarkers();
			addToMap(openBars, map);
			close = false;
			open = true;
		}
	};
}

//function to check whether a bar is open or not
function isBarOpen (feature) {
	//check whether opening hours are given or not
	if (feature.properties.opening_hours[datedecoder[weekday]][0] === undefined ||
		feature.properties.opening_hours[datedecoder[weekday]][0].length > 5) {
		feature.open = false;
		//return false;
	} else {
		//create a date-object with the opening hour
		var t = feature.properties.opening_hours[datedecoder[weekday]][0].split(":")
		var d = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			t[0],
			t[1],
			0,
			0)
		//check if the current time is before the opening time
		if (today.getTime() < d.getTime()) {
			feature.open = false;
			//return false;
		} else {
			//check if a closing time is given
			if (feature.properties.opening_hours[datedecoder[weekday]][1] === undefined) {
				feature.open = true;
				//return true;
			} else {
				//create a date-object for the closing hour
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
				//check if closing hour is before opening hour
				if (dd.getTime() < d.getTime()) {
					dd.setHours(dd.getHours() + 24)
				}
				//check if current time is before closing time
				if (today.getTime() <= dd.getTime()) {
					feature.open = true
					//return true;
				}
				else {
					feature.open = false;
					//return false;
				}
			}
		}
	}
	return feature.open;
}

//function to set-up the bar icon and pop-up
function barMarker (feature, latlng, marker) {
	//set-up the bar-marker
	var mark = L.marker(latlng, {icon: marker, title: feature.properties.bar_name, clickable:true});
	//set-up the popup contenct
	var popupText = "<h3>" + feature.properties.bar_name + "</h3>" +
		"<p><b>" + window[language].opening_hours + "</b><br>"
	for (opening_hour in feature.properties.opening_hours) {
		popupText += window[language].weekdaydecoder[opening_hour] + ": ";
		if (feature.properties.opening_hours[opening_hour].length === 0) {
			popupText += window[language].closed;
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

	popupText += "<p></p><b>" + window[language].contact + "</b><br>";
	popupText += window[language].phone + ": <a href=tel:" + feature.properties.phone + ">" + feature.properties.phone + "</a><br>";
	popupText += window[language].internet + ': <a target="_blank" rel="noopener noreferrer" href=' + feature.properties.web + '>' + feature.properties.web + '</a><br>'
	popupText += window[language].address + ': ' + feature.properties.address + '</p>'
	popupText += '<p><b>' + window[language].info + '</b><br>'
	popupText += feature.properties.info[language] + "</p>"
	//bind the popup to the marker
	mark.bindPopup(popupText);
	return mark;
}

//adding features from the geojson file
var allBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		//check is the bar is open or not
		if (isBarOpen(feature)) {
			//set-up the bar marker and popup text
			return barMarker(feature, latlng, barOpenMarker);
			//set-up the bar marker and popup text
		}else return barMarker(feature, latlng, barClosedMarker);
	}
});

var openBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		//check is the bar is open or not
		if (isBarOpen(feature)) {
			//set-up the bar marker and popup text
			return barMarker(feature, latlng, barOpenMarker);
			//set-up the bar marker and popup text
		}
	}
});

var closedBars = L.geoJson(bars, {
	pointToLayer: function (feature, latlng) {
		//check is the bar is open or not
		if (!isBarOpen(feature)) {
			//set-up the bar marker and popup text
			return barMarker(feature, latlng, barClosedMarker);
			//set-up the bar marker and popup text
		}
	}
});

addToMap(allBars, map);

//Part 5: Adding a layer control for base maps and feature layers
//the variable features lists layers that I want to control with the layer control
var features = {
}


//the legend uses the layer control with entries for the base maps and two of the layers we added
//in case either base maps or features are not used in the layer control, the respective element in the properties is null

L.control.layers(baseMaps, features, {position:'topleft'}).addTo(map);






