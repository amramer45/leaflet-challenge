//query URL for past 7 days of earthquakes
const queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

//Tectonic URL 
const tectonicUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

function createMap(earthquakes, magnitude) {
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

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
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
        "Magnitude": magnitude,
        "Tectonic Plates": tectonicPlates
    };

    //create the map object with options
    var map = L.map("mapid", {
        center: [36.85, -75.9779],
        zoom: 3,
        layers: [lightmap, magnitude, tectonicPlates]
    });

    //create a layer control, pass in basemaps and overlaymaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 11, 31, 51, 71, 91],
            labels = ["-10-10 km", "10-30 km", "30-50 km", "30-50 km", "70-90 km", "90+ km"];

        div.innerHTML = "<div> </div>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + mapColor(grades[i]) + '"></i>' + labels[i]+ '<br/>';
        }

        return div;
    };

    legend.addTo(map);

}

function mapColor(depthOfQuake) {
    switch (true) {
        case depthOfQuake > 90:
            return "#ea2c2c";
        case depthOfQuake > 70:
            return "#eaa92c";
        case depthOfQuake > 50:
            return "#d5ea2c";
        case depthOfQuake > 30:
            return "#92ea2c";
        case depthOfQuake > 10:
            return "#2ceabf";
        default:
            return "#2c99ea";
    }
}

function mapRadius(mag) {
    if (mag === 0) {
        return 1;
    }

    return mag * 4;
}

function createMarkers(response) {
    var earthquakeFeatures = response.features;

    var earthquakeMarkers = [];
    var magnitude = [];

    for (var index = 0; index < earthquakeFeatures.length; index++) {
        var features = earthquakeFeatures[index];
        var coordinateList = features.geometry.coordinates;

        var earthquakeMark = L.marker(coordinateList.slice(0,2).reverse())
            .bindPopup("<h3>" + features.properties.place + "</h3><h3>Magnitude:" + features.properties.mag + "</h3><h3>Depth: " + coordinateList.slice(2,3) + "</h3>");
        earthquakeMarkers.push(earthquakeMark);
        
        //Magnitude
        var depthOfQuake = coordinateList.slice(2,3)
        var magnitudeList = L.circleMarker(coordinateList.slice(0,2).reverse(), {
            color: "white",
            fillColor: mapColor(depthOfQuake),
            fillOpacity: 0.4,
            weight: 1.5,
            radius: mapRadius(features.properties.mag)
        })
            .bindPopup("<h3>" + features.properties.place + "</h3><h3>Magnitude:" + features.properties.mag + "</h3><h3>Depth: " + coordinateList.slice(2,3) + "</h3>");
        ;

        magnitude.push(magnitudeList);
    };

    //Create a layer group made from the array, pass it into the createmap function
    createMap(L.layerGroup(earthquakeMarkers), L.layerGroup(magnitude));
};

//Tectonic Plates
var tectonicPlates = new L.LayerGroup();

function createTectonicPlates(Data) {
    L.geoJson(Data, {
        color: "orange",
        weight: 2
    })
    .addTo(tectonicPlates);
};

d3.json(queryURL, createMarkers);
d3.json(tectonicUrl, createTectonicPlates);