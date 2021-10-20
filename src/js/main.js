// Using Leaflet for creating the map and adding controls for interacting with the map

//
//--- Part 1: adding base maps ---
//

//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
var map = L.map('map', {
	center: [47.5, 13.05],
	zoom: 9
});

// alternatively the setView method could be used for placing the map in the window
//var map = L.map('map').setView([47.5, 13.05], 8);


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
//L.marker([47, 14], {title:'markerrrrrr', clickable:true}).addTo(map).bindPopup("newpopup");
	
//Marker Version 2
//var mark = L.marker([47, 12], {title:'markerrrrrr', clickable:true}).addTo(map);
//mark.bindPopup("this is my popup");

//Marker Version 3	
//var myIcon = L.icon({
//iconUrl: 'css/images/house.png',
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

var barClosedMarker = {
	radius: 8,
	fillColor: "#ff0000",
	color: "#ff0000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var barOpenMarker = {
	radius: 8,
	fillColor: "#24cb01",
	color: "#24cb01",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var beerIcon = L.icon({
	iconUrl: 'css/images/cheers.png',
	iconSize: [24, 24]
})

function isBarOpen (feature) {
	console.log(feature.properties.bar_name)
	console.log(feature.properties.opening_hours[datedecoder[weekday]][0]
		+ " - " +
		feature.properties.opening_hours[datedecoder[weekday]][1])
}

var b = L.geoJson(bars, {
	//icon: beerIcon
	pointToLayer: function (feature, latlng) {
		isBarOpen(feature);
		return L.circleMarker(latlng, barClosedMarker);
		//return L.Marker(latlng, {icon: beerIcon})
	}
});

b.addTo(map);

//
//---- Part 5: Adding a layer control for base maps and feature layers
//

//the variable features lists layers that I want to control with the layer control
var features = {
	b
	//"Marker 2": mark,
	//"Salzburg": districts
}

//the legend uses the layer control with entries for the base maps and two of the layers we added
//in case either base maps or features are not used in the layer control, the respective element in the properties is null

L.control.layers(baseMaps, features, {position:'topleft'}).addTo(map);






