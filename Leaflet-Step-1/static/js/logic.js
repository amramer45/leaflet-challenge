//query URL for past 7 days of earthquakes
var queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function createMap(earthquakeData) {
    //create tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    //create a basemaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap,
        "Street Map": streetmap
    };

    //create an overlaymaps object to hold the earthquake layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Magnitude": magnitude
    };

    //create the map object with options
    var map = L.map("map-id", {
        center: [36.85, -75.9779],
        zoom: 3,
        layers: [lightmap, earthquakes]
    });

    //create a layer control, pass in basemaps and overlaymaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}

function createMarkers(response) {
    //Pull the earthquakes property off of response.data
    var earthquakeFeatures = response.data.earthquakeFeatures;

    //Initialize an array to hold the markers
    var earthquakeMarkers = [];
    var magnitudeMarkers = [];

    //Loop through the array
    for (var index = 0; index < earthquakeFeatures.length; index++) {
        var features = earthquakeFeatures[index];

        //For each earthquakeFeatures, create a marker and bind a pop up with the name
        var earthquakeMarker = L.marker([features.lat, features.lon])
            .bindPopup("<h3>" + features.name + "<h3><h3>Magnitude: " + features.capacity + "</h3>");

        //Add the marker to the array
        earthquakeMarkers.push(earthquakeMarker);
    }

    //Create a layer group made from the array, pass it into the createmap function
    createMap(L.layerGroup(earthquakeMarkers));
}

//Perform an API call to the Earthquake API to get station information
d3.json(queryURL, createMarkers);