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

    //Get color radius call to the query URL
    d3.json(queryURL, function(data) {
        function styleInfo(feature) {
            return {
                opacity: 1,
                fillOpacity: 1
                fillColor: getColor(feature.properties.mag),
                color: "#000",
                radius: getRadius(feature.properties.mag),
                stroke: true,
                weight: 0.5
            };
        }

        //Set different colors from magnitude
        function getColor(magnitude) {
            switch (true) {
                case magnitude > 5:
                    return "#ea2c2c";
                case magnitude > 4:
                    return "#ea822c";
                case magnitude > 3:
                    return "#ee9c00";
                case magnitude > 2:
                    return "#eecc00";
                case magnitude > 1:
                    return "#d4ee00";
                default:
                    return "#98ee00";
            }
        }

        //Set radius from magnitude
        function getRadius(magnitude) {
            if (magnitude === 0) {
                return 1;
            }

            return magnitude * 4;
        }

        //GeoJSON layer
        L.geoJson(data, {
            //Make circles
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },
            //circle style
            style: styleInfo,
            //popup
            onEachFeature: function(feature, layer) {
                layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
            }
        }).addTo(myMap);
    })

    //Create legend variable
    var legend = L.control({
        position: "bottomright"
    });

    //details for the legend
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        //Loop
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<i style = 'background: " colors[i] + " '></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    //Add legend to the map
    legend.addTo(map);
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